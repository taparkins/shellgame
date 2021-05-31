import { ShellEngine } from './shell/engine';
import { ShellWindow } from './shell/view';
import { OS } from './os/os';

function main() {
    let os = new OS();
    let shellContainer = document.getElementById("container");
    let shellView = new ShellWindow(shellContainer);
    let shellEngine = new ShellEngine(os, shellView);
}


window.addEventListener("load", main, false);
