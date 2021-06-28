export class DataBuffer {
    constructor(width, height) {
        if (width <= 0 || height <= 0) {
            throw "Both width and height of GridBuffer must be positive.";
        }

        this.buffer = [];
        for (var x = 0; x < width; x++) {
            this.buffer.push(new Uint8Array(height));
        }
    }

    width() {
        return this.buffer.length;
    }

    height() {
        return this.buffer[0].byteLength;
    }

    addRow() {
        this.buffer.push(new Uint8Array(this.height()));
    }
}

export class ShellViewport {
    constructor(width, height) {
        if (width <= 0 || height <= 0) {
            throw "Both width and height of ShellViewport must be positive.";
        }

        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }
}

export class GridBuffer {
    constructor(bufWidth, bufHeight, vpWidth, vpHeight) {
        if (vpWidth < bufWidth || vpHeight < bufHeight) {
            throw "Viewport dimensions must be smaller than the buffer dimensions."
       }

        this.charBuffer = new DataBuffer(bufWidth, bufHeight);
        this.metaBuffer = new DataBuffer(bufWidth, bufHeight);
        this.viewport = new ShellViewport(vpWidth, vpHeight);

        this.listeners = {
            onShiftViewport: [],
            onAddBufferRow: [],
            onSetValue: [],
        };
    }

    getCharAt(x, y) {
        _validateIndex(x, y, this);
        return this.charBuffer.buffer[x][y];
    }

    getMetaAt(x, y) {
        _validateIndex(x, y, this);
        return this.metaBuffer.buffer[x][y];
    }

    bufferWidth() {
        // All buffers are expected to be the same, so just check one
        return this.charBuffer.width();
    }

    bufferHeight() {
        // All buffers are expected to be the same, so just check one
        return this.charBuffer.height();
    }

    addListener(type, callback) {
        if (this.listeners[type] === undefined) {
            throw "Invalid lisntener type: " + type;
        }

        this.listeners[type].push(callback);
    }

    insideViewport(x, y) {
        return this.viewport.x <= x && this.viewport.width > x &&
               this.viewport.y <= y && this.viewport.height > y;
    }

    setValue(x, y, charData, metaData) {
        _validateIndex(x, y, this);

        this.charBuffer.buffer[x][y] = charData;
        this.metaBuffer.buffer[x][y] = metaData;

        let insideViewport = this.insideViewport(x, y);
        _triggerListeners(this.listeners.onSetValue, this, { x, y, charData, metaData, insideViewport });
    }

    shiftViewport(dx, dy) {
        let newTop = this.viewport.y + dy;
        let newBottom = newTop + this.viewport.height;
        if (newTop < 0 || newBottom > this.charBuffer.height()) {
            throw "Invalid viewport translation; attempt to translate viewport out of valid indices.";
        }

        let newLeft = this.viewport.x + dx;
        let newRight = newLeft + this.viewport.width;
        if (newLeft < 0 || newRight > this.charBuffer.width()) {
            throw "Invalid viewport translation; attempt to translate viewport out of valid indices.";
        }

        this.viewport.x = newTop;
        this.viewport.y = newBottom;

        _triggerListeners(this.listners.onShiftViewport, this, { dx, dy });
    }

    addBufferRow() {
        this.charBuffer.addRow();
        this.metaBuffer.addRow();
        _triggerListeners(this.listeners.onAddBufferRow, this, { });
    }
}

function _triggerListeners(callbackList, gridBuffer, argObj) {
    for (var i = 0; i < callbackList.length; i++) {
        callbackList[i](gridBuffer, argObj);
    }
}

function _validateIndex(x, y, gridBuffer) {
    if (x < 0 || x >= gridBuffer.bufferWidth() || y < 0 || y >= gridBuffer.bufferHeight()) {
        throw "Position out of range: (" + x + ", " + y + ")";
    }
}
