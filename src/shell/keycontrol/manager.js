import { CONTROL_CODES } from './convertKey';

const CURSOR_CHAR_BYTE = 0xB2;
const CURSOR_META_BYTE = 0x00; // TODO

const INITIAL_ACTION_PAUSE = 1000;
const SUBSEQUENT_ACTION_PAUSE = 500;

export class KeyManager {
    constructor(registrar, lowerBuffer, upperBuffer) {
        this.curPos = { x: 0, y: 0 };
        this.activeActionId = undefined;
        this.activeControlCodes = new Set();

        this.lowerBuffer = lowerBuffer;
        this.upperBuffer = upperBuffer;
        this.registrar = registrar;

        this.goToPosition(
            this.upperBuffer.viewport.x,
            this.upperBuffer.viewport.y,
        );
        this.registrar.registerListeners(
            (keyAction) => _handleKeyDown(this, keyAction),
            (keyAction) => _handleKeyUp(this, keyAction),
        );
    }

    goToPosition(x, y) {
        if (!this.upperBuffer.insideViewport(x, y)) {
            // TODO: error flash?
            return false;
        }

        this.upperBuffer.setValue(
            this.curPos.x,
            this.curPos.y,
            0x00,
            0x00,
        );

        this.curPos.x = x;
        this.curPos.y = y;
        this.upperBuffer.setValue(
            this.curPos.x,
            this.curPos.y,
            CURSOR_CHAR_BYTE,
            CURSOR_META_BYTE,
        );
        return true;
    }
}

function _handleKeyDown(manager, keyAction) {
    if (keyAction.type == 'printable') {
        return _handlePrintableCharDown(manager, keyAction.byteValue);
    } else if (keyAction.type == 'control') {
        return _handleControlCodeDown(manager, keyAction.controlType);
    } else {
        throw 'Unknown key action: ' + keyAction.type;
    }
}

function _handleKeyUp(manager, keyAction) {
    if (keyAction.type == 'printable') {
        return _handlePrintableCharUp(manager, keyAction.byteValue);
    } else if (keyAction.type == 'control') {
        return _handleControlCodeUp(manager, keyAction.controlType);
    } else {
        throw 'Unknown key action: ' + keyAction.type;
    }
}

function _handlePrintableCharDown(manager, byteValue) {
    // TODO
    return false;
}

function _handlePrintableCharUp(manager, byteValue) {
    // TODO
    return false;
}

function _handleControlCodeDown(manager, controlCode) {
    let actionFunc = undefined;
    switch(controlCode) {
        case CONTROL_CODES.ALT:
        case CONTROL_CODES.CTRL:
        case CONTROL_CODES.SHIFT:
            manager.activeControlCodes.add(controlCode);
            return true;

        case CONTROL_CODES.ENTER:
            // TODO
            break;
        case CONTROL_CODES.TAB:
            // TODO
            break;
        case CONTROL_CODES.ARROW_D:
            actionFunc = () => manager.goToPosition(
                manager.curPos.x,
                manager.curPos.y + 1,
            );
            break;
        case CONTROL_CODES.ARROW_U:
           actionFunc =  () => manager.goToPosition(
                manager.curPos.x,
                manager.curPos.y - 1,
            );
            break;
        case CONTROL_CODES.ARROW_L:
            actionFunc = () => manager.goToPosition(
                manager.curPos.x - 1,
                manager.curPos.y,
            );
            break;
        case CONTROL_CODES.ARROW_R:
            actionFunc = () => manager.goToPosition(
                manager.curPos.x + 1,
                manager.curPos.y,
            );
            break;
        case CONTROL_CODES.END:
            actionFunc = () => manager.goToPosition(
                manager.upperBuffer.width, // TODO: smarter end computation
                manager.curPos.y,
            );
            break;
        case CONTROL_CODES.HOME:
            actionFunc = () => manager.goToPosition(
                0,
                manager.curPos.y,
            );
            break;
        case CONTROL_CODES.PAGE_D:
            // TODO
            break;
        case CONTROL_CODES.PAGE_U:
            // TODO
            break;
        case CONTROL_CODES.BACKSPACE:
            // TODO
            break;
        case CONTROL_CODES.DELETE:
            // TODO
            break;
        case CONTROL_CODES.INSERT:
            // TODO
            break;
    }

    if (!!actionFunc) {
        _initRepeatingAction(manager, actionFunc);
        return true;
    }

    return false;
}

function _handleControlCodeUp(manager, controlCode) {
    switch(controlCode) {
        case CONTROL_CODES.ALT:
        case CONTROL_CODES.CTRL:
        case CONTROL_CODES.SHIFT:
            manager.activeControlCodes.delete(controlCode);
            return true;

        case CONTROL_CODES.ENTER:
        case CONTROL_CODES.TAB:
        case CONTROL_CODES.ARROW_D:
        case CONTROL_CODES.ARROW_U:
        case CONTROL_CODES.ARROW_L:
        case CONTROL_CODES.ARROW_R:
        case CONTROL_CODES.END:
        case CONTROL_CODES.HOME:
        case CONTROL_CODES.PAGE_D:
        case CONTROL_CODES.PAGE_U:
        case CONTROL_CODES.BACKSPACE:
        case CONTROL_CODES.DELETE:
        case CONTROL_CODES.INSERT:
            _disableRepeatingAction(manager);
            return true;
    }

    return false;
}

function _initRepeatingAction(manager, actionFunc) {
    // clear an existing repeating action to avoid orphaning an action and leaving it going forever
    _disableRepeatingAction(manager);

    let wrappedFunc = () => {
        actionFunc();
        manager.activeActionId = setTimeout(wrappedFunc, SUBSEQUENT_ACTION_PAUSE);
    };
    actionFunc();
    manager.activeActionId = setTimeout(wrappedFunc, INITIAL_ACTION_PAUSE);
}

function _disableRepeatingAction(manager) {
    if (manager.activeActionId !== undefined && manager.activeActionId !== null) {
        clearTimeout(manager.activeActionId);
        manager.activeActionId = undefined;
    }
}
