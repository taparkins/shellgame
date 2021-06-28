import { KeyboardRegistrar } from './shell/keycontrol/registrar';
import { ShellEngine } from './shell/engine'
import { OS } from './os/os'

const LOWER_SHELL_TABLE_ID = 'bufTable1';
const UPPER_SHELL_TABLE_ID = 'bufTable2';

function main() {
    let keyboardRegistrar = new KeyboardRegistrar();
    let os = new OS();

    let viewArgs = {
        lowerTableId: LOWER_SHELL_TABLE_ID,
        upperTableId: UPPER_SHELL_TABLE_ID,
    };
    let shellEngine = new ShellEngine(os, keyboardRegistrar, viewArgs);
}


window.addEventListener("load", main, false);
