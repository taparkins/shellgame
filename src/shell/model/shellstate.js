import { GridBuffer } from './buffer'

const SHELL_STATUS = {
    INPUT: 'INPUT',
    IDLE:  'IDLE',
}

const CURSOR_CHAR_BYTE = 0xB2;
const CURSOR_META_BYTE = 0x00; // TODO


export class ShellState {
    constructor(dimensions) {
        this.curPos = { x: 0, y: 0 };
        this.inputStart = 0;
        this.inputEnd = 0;

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

        let existingByte = this.lowerBuffer.getCharAt(this.curPos.x, this.curPos.y);

        // TODO: handle insert mode vs replace mode
        this.lowerBuffer.setValue(
            this.curPos.x,
            this.curPos.y,
            byteValue,
            0x00, // TODO: meta bytes
        );

        if (existingByte == 0x00) {
            this.inputEnd++;
        }

        // TODO: handle line overflow
        _movePosition(this, this.curPos.x+1, this.curPos.y);
    }

    handleArrowUp() {
        // TODO
    }

    handleArrowDown() {
        // TODO
    }

    handleArrowRight() {
        _movePosition(this, this.curPos.x+1, this.curPos.y);
    }

    handleArrowLeft() {
        _movePosition(this, this.curPos.x-1, this.curPos.y);
    }

    handleEnd() {
        _movePosition(this, this.inputEnd, this.curPos.y);
    }

    handleHome() {
        _movePosition(this, this.inputStart, this.curPos.y);
    }
}

function _writeInputLeader(shellState) {
    shellState.handlePrintableChar(0x3E); // >
    shellState.handlePrintableChar(0x20); // [space]
    shellState.inputStart = 2;
    shellState.inputEnd = 2;
}

function _movePosition(shellState, newX, newY) {
    if (shellState.status !== SHELL_STATUS.INPUT) {
        // TODO: error flash?
        return;
    } else if (!shellState.upperBuffer.insideViewport(newX, newY)) {
        // TODO: error flash?
        return;
    } else if (newX < shellState.inputStart || newX > shellState.inputEnd) {
        // TODO: error flash?
        return;
    }

    shellState.upperBuffer.setValue(shellState.curPos.x, shellState.curPos.y, 0x00, 0x00);

    shellState.curPos.x = newX;
    shellState.curPos.y = newY;

    if (shellState.status == SHELL_STATUS.INPUT) {
        shellState.upperBuffer.setValue(
            shellState.curPos.x,
            shellState.curPos.y,
            CURSOR_CHAR_BYTE,
            CURSOR_META_BYTE,
        );
    }
}
