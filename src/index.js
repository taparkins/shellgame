import { ShellEngine } from './shell/engine'
import { OS } from './os/os'

const LOWER_SHELL_TABLE_ID = 'bufTable1';
const UPPER_SHELL_TABLE_ID = 'bufTable2';

function main() {
    let os = new OS();

    let viewArgs = {
        lowerTableId: LOWER_SHELL_TABLE_ID,
        upperTableId: UPPER_SHELL_TABLE_ID,
    };
    let shellEngine = new ShellEngine(os, viewArgs);

    // Just a quick demo snippet to see some characters display
    let x = 0;
    let y = 0;
    for (var i = 0; i < 256; i++) {
        x = i % 80;
        y = Math.floor(i / 80);
        shellEngine.lowerGridBuffer.setValue(x, y, i, 0);
    }

    for (; y < 30; y++) {
        for (; x < 80; x++) {
            shellEngine.lowerGridBuffer.setValue(x, y, 15, 0);
        }
        x = 0;
    }
}


window.addEventListener("load", main, false);
