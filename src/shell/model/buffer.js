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
    }

    bufferWidth() {
        // All buffers are expected to be the same, so just check one
        return charBuffer.width();
    }

    bufferHeight() {
        // All buffers are expected to be the same, so just check one
        return charBuffer.height();
    }

    addBufferRow() {
        charBuffer.addRow();
        metaBuffer.addRow();
    }
}
