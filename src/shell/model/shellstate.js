import { GridBuffer, POSITION_TYPE } from './buffer'

const SHELL_STATUS = {
    INPUT: 'INPUT',
    IDLE:  'IDLE',
}

const CURSOR_CHAR_BYTE = 0xB2;
const CURSOR_META_BYTE = 0x00; // TODO


export class ShellState {
    constructor(dimensions) {
        this.cursorPos = {
            type: POSITION_TYPE.VIEWPORT,
            x: 0,
            y: 0
        };
        this.inputStart = 0;
        this.inputEnd = 0;
        this.history = [];

        this.lowerBuffer = new GridBuffer(
            dimensions.width,
            dimensions.height,
            dimensions.width,
            dimensions.height,
        );
        this.upperBuffer = new GridBuffer(
            dimensions.width,
            dimensions.height,
            dimensions.width,
            dimensions.height,
        );

        this.status = SHELL_STATUS.INPUT;
        _writeInputLeader(this);

    }

    handlePrintableChar(byteValue) {
        if (this.status !== SHELL_STATUS.INPUT) {
            // TODO: error flash?
            return;
        }

        let existingData = this.lowerBuffer.getDataAt(this.cursorPos);

        // TODO: handle insert mode vs replace mode
        this.lowerBuffer.setValue(
            this.cursorPos,
            byteValue,
            0x00, // TODO: handle meta
        );

        if (existingData.charValue == 0x00) {
            this.inputEnd++;
        }

        // TODO: handle line overflow
        _moveCursorPosition(this, 1, 0);
    }

    handleArrowUp() {
        // TODO
    }

    handleArrowDown() {
        // TODO
    }

    handleArrowRight() {
        _moveCursorPosition(this, 1, 0);
    }

    handleArrowLeft() {
        _moveCursorPosition(this, -1, 0);
    }

    handleEnd() {
        let endPos = Math.min(this.inputEnd, this.upperBuffer.bufferWidth());
        _moveCursorPosition(
            this,
            endPos - this.cursorPos.x,
            0,
        );
    }

    handleHome() {
        _moveCursorPosition(
            this,
            this.inputStart - this.cursorPos.x,
            0,
        );
    }

    handleBackspace() {
        if (this.inputStart == this.inputEnd) {
            // TODO: error flash?
            return;
        } else if (this.cursorPos.x == 0) {
            // TODO: error flash?
            return;
        }

        _deleteChar(this, this.cursorPos.x-1);
        _moveCursorPosition(this, -1, 0);
    }

    handleDelete() {
        if (this.inputStart == this.inputEnd) {
            // TODO: error flash?
            return;
        }
        _deleteChar(this, this.cursorPos.x);
    }

    handleEnter() {
        // TODO: handle meta? I don't think those will come up for this use case, but worth thinking about
        let inputByteRegion = this.lowerBuffer.getDataBetween(
            {
                type: POSITION_TYPE.VIEWPORT,
                x: this.inputStart,
                y: this.cursorPos.y,
            },
            {
                type: POSITION_TYPE.VIEWPORT,
                x: this.inputEnd - 1,
                y: this.cursorPos.y,
            }
        ).charData;
        let inputBytes = new Uint8Array(inputByteRegion.flatMap((byteLine) => [...byteLine]));
        this.history.push(inputBytes);

        let decoder = new TextDecoder();
        let inputString = decoder.decode(inputBytes);
        // TODO: send string off to be processed into a command
        console.log(inputString);

        _resetLine(this);
    }
}

function _cursorPosToDataPos(shellState, cursorPos) {
    // The top buffer will never be resized, but the bottom one may be
    // This converts a cursor coordinate into a data coordinate to account for that
    let dataX = cursorPos.x + shellState.lowerBuffer.viewport.x;
    let dataY = cursorPos.y + shellState.lowerBuffer.viewport.y;
    return { x: dataX, y: dataY };
}

function _writeInputLeader(shellState) {
    shellState.handlePrintableChar(0x3E); // >
    shellState.handlePrintableChar(0x20); // [space]
    shellState.inputStart = 2;
    shellState.inputEnd = 2;
}

function _moveCursorPosition(shellState, dx, dy) {
    let newPos = {
        type: POSITION_TYPE.VIEWPORT,
        x: shellState.cursorPos.x + dx,
        y: shellState.cursorPos.y + dy,
    }

    if (shellState.status !== SHELL_STATUS.INPUT) {
        // TODO: error flash?
        return;
    } else if (!shellState.upperBuffer.insideViewport(newPos)) {
        // TODO: error flash?
        return;
    } else if (newPos.x < shellState.inputStart || newPos.x > shellState.inputEnd) {
        // TODO: error flash?
        return;
    }

    shellState.upperBuffer.setValue(
        shellState.cursorPos,
        0x00,
        0x00,
    );

    shellState.cursorPos = newPos;

    shellState.upperBuffer.setValue(
        shellState.cursorPos,
        CURSOR_CHAR_BYTE,
        CURSOR_META_BYTE,
    );
}

function _deleteChar(shellState, cursorX) {
    if (cursorX < shellState.inputStart || cursorX > shellState.inputEnd) {
        throw "Invalid index for deleting character: " + cursorX;
    }

    let cursorY = shellState.cursorPos.y;
    for (var currentX = cursorX; currentX < shellState.inputEnd - 1; currentX++) {
        let currentPos = {
            type: POSITION_TYPE.VIEWPORT,
            x: currentX,
            y: cursorY,
        };
        let nextPos = {
            type: POSITION_TYPE.VIEWPORT,
            x: currentX + 1,
            y: cursorY,
        }

        let nextData = shellState.lowerBuffer.getDataAt(nextPos);
        shellState.lowerBuffer.setValue(currentPos, nextData.charValue, nextData.metaValue);
    }

    // Fencepost to clear out last character
    let clearOutPos = {
        type: POSITION_TYPE.VIEWPORT,
        x: shellState.inputEnd - 1,
        y: cursorY,
    };
    shellState.lowerBuffer.setValue(clearOutPos, 0x00, 0x00);

    shellState.inputEnd--;
}

function _resetLine(shellState) {
    let newCursorPos = {
        type: POSITION_TYPE.VIEWPORT,
        x: 0,
        y: shellState.cursorPos.y + 1
    };
    if (!shellState.lowerBuffer.insideViewport(newCursorPos)) {
        shellState.lowerBuffer.addBufferRow();
        shellState.lowerBuffer.shiftViewport(0, 1);
        newCursorPos.y = shellState.cursorPos.y;
    }

    shellState.inputStart = 0;
    shellState.inputEnd = 0;
    _moveCursorPosition(
        shellState,
        newCursorPos.x - shellState.cursorPos.x,
        newCursorPos.y - shellState.cursorPos.y,
    );
    _writeInputLeader(shellState);
}
