import { GridBuffer, POSITION_TYPE } from './buffer'

const SHELL_STATUS = {
    INPUT: 'INPUT',
    IDLE:  'IDLE',
}

const CURSOR_CHAR_BYTE = 0xB2;
const CURSOR_META_BYTE = 0x00; // TODO
const NEWLINE_BYTE = 0x0A;

export class ShellState {
    constructor(dimensions) {
        this.cursorPos = {
            type: POSITION_TYPE.VIEWPORT,
            x: 0,
            y: 0
        };
        this.inputStart = 0;
        this.inputEnd = 0;

        this.history = [new Uint8Array([])];
        this.historyIndex = 0;

        this.handleLineListeners = [];

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

    addHandleLineListener(callback) {
        this.handleLineListeners.push(callback);
    }

    typeBytes(byteLine) {
        for (var i = 0; i < byteLine.byteLength; i++) {
            _typeChar(this, byteLine[i]);
        }
    }

    goIdle() {
        this.status = SHELL_STATUS.IDLE;
        _hideCursor(this);
        _resetLine(this);
    }

    activateInput() {
        if (this.status !== SHELL_STATUS.INPUT) {
            this.status = SHELL_STATUS.INPUT;
            _resetLine(this);
        }
    }

    handlePrintableChar(byteValue) {
        if (this.status !== SHELL_STATUS.INPUT) {
            // TODO: error flash?
            return;
        }

        _typeChar(this, byteValue);

        this.historyIndex = this.history.length - 1;
        this.history[this.historyIndex] = _readCurrentInput(this);
    }

    handleArrowUp() {
        if (this.historyIndex <= 0) {
            // TODO: error flash?
            return;
        }

        this.historyIndex--;
        let historyInput = this.history[this.historyIndex];

        _clearCurrentInput(this);
        this.typeBytes(historyInput);
    }

    handleArrowDown() {
        if (this.historyIndex >= this.history.length - 1) {
            // TODO: error flash?
            return;
        }

        this.historyIndex++;
        let historyInput = this.history[this.historyIndex];

        _clearCurrentInput(this);
        this.typeBytes(historyInput);
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

        this.historyIndex = this.history.length - 1;
        this.history[this.historyIndex] = _readCurrentInput(this);
    }

    handleDelete() {
        if (this.inputStart == this.inputEnd) {
            // TODO: error flash?
            return;
        }
        _deleteChar(this, this.cursorPos.x);

        this.historyIndex = this.history.length - 1;
        this.history[this.historyIndex] = _readCurrentInput(this);
    }

    handleEnter() {
        let inputBytes = _readCurrentInput(this);

        this.history[this.history.length - 1] = this.history[this.historyIndex];
        if (this.history[this.history.length - 1].byteLength !== 0) {
            this.history.push(new Uint8Array());
        }
        this.historyIndex = this.history.length - 1;

        _onHandleLine(this, inputBytes);
    }
}

function _onHandleLine(shellState, inputBytes) {
    for (var i = 0; i < shellState.handleLineListeners.length; i++) {
        shellState.handleLineListeners[i](inputBytes);
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
    _typeChar(shellState, 0x3E); // >
    _typeChar(shellState, 0x20); // [space]
    shellState.inputStart = 2;
    shellState.inputEnd = 2;
}

function _moveCursorPosition(shellState, dx, dy) {
    let newPos = {
        type: POSITION_TYPE.VIEWPORT,
        x: shellState.cursorPos.x + dx,
        y: shellState.cursorPos.y + dy,
    }

    if (!shellState.upperBuffer.insideViewport(newPos)) {
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

function _hideCursor(shellState) {
    shellState.upperBuffer.setValue(shellState.cursorPos, 0x00, 0x00);
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

function _readCurrentInput(shellState) {
        // TODO: handle meta? I don't think those will come up for this use case, but worth thinking about
        let inputByteRegion = shellState.lowerBuffer.getDataBetween(
            {
                type: POSITION_TYPE.VIEWPORT,
                x: shellState.inputStart,
                y: shellState.cursorPos.y,
            },
            {
                type: POSITION_TYPE.VIEWPORT,
                x: shellState.inputEnd,
                y: shellState.cursorPos.y,
            }
        ).charData;
        return new Uint8Array(inputByteRegion.flatMap((byteLine) => [...byteLine]));
}

function _clearCurrentInput(shellState) {
    for (var x = shellState.inputStart; x < shellState.inputEnd; x++) {
        let curPos = {
            type: POSITION_TYPE.VIEWPORT,
            x: x,
            y: shellState.cursorPos.y,
        };
        shellState.lowerBuffer.setValue(curPos, 0x00, 0x00);
    }

    shellState.inputEnd = shellState.inputStart;
    _moveCursorPosition(
        shellState,
        shellState.inputStart - shellState.cursorPos.x,
        0,
    );
}

function _typeChar(shellState, byteValue) {
        let existingData = shellState.lowerBuffer.getDataAt(shellState.cursorPos);

        if (byteValue == NEWLINE_BYTE) {
            _resetLine(shellState);
        } else {
            // TODO: handle insert mode vs replace mode
            shellState.lowerBuffer.setValue(
                shellState.cursorPos,
                byteValue,
                0x00, // TODO: handle meta
            );

            if (existingData.charValue == 0x00) {
                shellState.inputEnd++;
            }

            // TODO: handle line overflow
            _moveCursorPosition(shellState, 1, 0);
        }
    }


function _resetLine(shellState) {
    if (shellState.cursorPos.x !== 0) {
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
    }

    if (shellState.status == SHELL_STATUS.INPUT) {
        _writeInputLeader(shellState);
    }
}
