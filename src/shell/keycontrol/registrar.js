import { convertKeyValue } from './convertKey'

export class KeyboardRegistrar {
    constructor() {
        this.keyDownListeners = [];
        this.keyUpListeners = [];

        // TODO: way to unregister listeners?
        window.addEventListener('keydown', (e) => _triggerKeyDown(e, this), true);
        window.addEventListener('keyup', (e) => _triggerKeyUp(e, this), true);
    }

    registerListeners(keyDownCallback, keyUpCallback) {
        this.keyDownListeners.push(keyDownCallback);
        this.keyUpListeners.push(keyUpCallback);
    }
}

function _triggerKeyDown(e, registrar) {
    let convertedKey = convertKeyValue(e.key);
    if (!!convertedKey) {
        let didConsume = false;
        for (var i = 0; i < registrar.keyDownListeners.length; i++) {
            didConsume |= registrar.keyDownListeners[i](convertedKey);
        }

        if (didConsume) {
            e.preventDefault();
        }
    }
}

function _triggerKeyUp(e, registrar) {
    let convertedKey = convertKeyValue(e.key);
    if (!!convertedKey) {
        let didConsume = false;
        for (var i = 0; i < registrar.keyUpListeners.length; i++) {
            didConsume |= registrar.keyUpListeners[i](convertedKey);
        }

        if (didConsume) {
            e.preventDefault();
        }
    }
}
