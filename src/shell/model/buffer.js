const POSITION_TYPE = {
    BUFFER: 'buffer',
    VIEWPORT: 'viewport',
}

export class DataBuffer {
    constructor(width, height) {
        if (width <= 0 || height <= 0) {
            throw "Both width and height of GridBuffer must be positive.";
        }

        this.buffer = [];
        for (var y = 0; y < height; y++) {
            this.buffer.push(new Uint8Array(width));
        }
    }

    byteAt(x, y) {
        return this.buffer[y][x];
    }

    setByte(x, y, byteValue) {
        this.buffer[y][x] = byteValue;
    }

    width() {
        return this.buffer[0].byteLength;
    }

    height() {
        return this.buffer.length;
    }

    addRow() {
        this.buffer.push(new Uint8Array(this.width()));
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

    getDataAt(position) {
        let { x, y } = _convertPositionToBuf(position, this);
        _validateIndex(x, y, this);
        return {
            charValue: this.charBuffer.byteAt(x, y),
            metaValue: this.metaBuffer.byteAt(x, y),
        };
    }

    getDataBetween(position1, position2) {
        let convertedPos1 = _convertPositionToBuf(position1, this);
        let x1 = convertedPos1.x;
        let y1 = convertedPos1.y;

        let convertedPos2 = _convertPositionToBuf(position2, this);
        let x2 = convertedPos2.x;
        let y2 = convertedPos2.y;

        _validateIndex(x1, y1, this);
        _validateIndex(x2, y2, this);

        let charData = [];
        let metaData = [];
        for (var curY = y1; curY < y2 + 1; curY++) {
            charData.push(this.charBuffer.buffer[curY].slice(x1, x2));
            metaData.push(this.metaBuffer.buffer[curY].slice(x1, x2));
        }

        return { charData, metaData };
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

    insideViewport(position) {
        let { x, y } = _convertPositionToViewport(position, this);
        return this.viewport.x <= x && this.viewport.width > x &&
               this.viewport.y <= y && this.viewport.height > y;
    }

    setValue(position, charData, metaData) {
        let bufPosition = _convertPositionToBuf(position, this);
        let viewPosition = _convertPositionToViewport(position, this);
        _validateIndex(bufPosition.x, bufPosition.y, this);

        this.charBuffer.setByte(bufPosition.x, bufPosition.y, charData);
        this.metaBuffer.setByte(bufPosition.x, bufPosition.y, metaData);

        let insideViewport = this.insideViewport(position);
        _triggerListeners(
            this.listeners.onSetValue,
            this,
            {
                charData,
                metaData,
                insideViewport,
                bufferPosition: bufPosition,
                viewportPosition: viewPosition,
            });
    }

    shiftViewport(dx, dy) {
        if (dx == 0 && dy == 0) {
            // We do not want to trigger listeners on a zero shift
            return;
        }

        let newTop = this.viewport.y + dy;
        let newBottom = newTop + this.viewport.height;
        if (newTop < 0 || newBottom > this.bufferHeight()) {
            throw "Invalid viewport translation; attempt to translate viewport out of valid indices.";
        }

        let newLeft = this.viewport.x + dx;
        let newRight = newLeft + this.viewport.width;
        if (newLeft < 0 || newRight > this.bufferWidth()) {
            throw "Invalid viewport translation; attempt to translate viewport out of valid indices.";
        }

        this.viewport.x = newLeft;
        this.viewport.y = newTop;

        _triggerListeners(this.listeners.onShiftViewport, this, { dx, dy });
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

function _convertPositionToBuf(position, gridBuffer) {
    switch (position.type) {
        case POSITION_TYPE.BUFFER:
            return position;
        case POSITION_TYPE.VIEWPORT:
            return {
                type: POSITION_TYPE.BUFFER,
                x: position.x + gridBuffer.viewport.x,
                y: position.y + gridBuffer.viewport.y,
            };
        default:
            throw 'Invalid position type: ' + position.type;
    }
}

function _convertPositionToViewport(position, gridBuffer) {
    switch (position.type) {
        case POSITION_TYPE.VIEWPORT:
            return position;
        case POSITION_TYPE.BUFFER:
            return {
                type: POSITION_TYPE.VIEWPORT,
                x: position.x - gridBuffer.viewport.x,
                y: position.y - gridBuffer.viewport.y,
            };
        default:
            throw 'Invalid position type: ' + position.type;
    }
}


export {
    POSITION_TYPE,
}
