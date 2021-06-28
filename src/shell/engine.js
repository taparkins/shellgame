import { compile } from '../lang/compiler'
import { ShellState } from './model/shellstate'
import { GridViewManager } from './view/grid/gridmanager'
import { KeyManager } from './keycontrol/manager'

const INIT_SHELL_WIDTH = 80;
const INIT_SHELL_HEIGHT = 30;

export class ShellEngine {
    constructor(os, keyboardRegistrar, viewArgs) {
        this.os = os;
        this.stdoutRid = this.os.registerReader(0, this.readerCallback.bind(this));
        this.stderrRid = this.os.registerReader(1, this.readerCallback.bind(this));

        this.shellState = new ShellState({
            width: INIT_SHELL_WIDTH,
            height: INIT_SHELL_HEIGHT,
        });
        this.view = new GridViewManager(
            this.shellState,
            viewArgs.lowerTableId,
            viewArgs.upperTableId,
        );

        this.keyManager = new KeyManager(
            keyboardRegistrar,
            this.shellState,
        );
    }

    handleLine(inLine) {
        if (inLine === "") {
            this.response = "";
            return
        }

        try {
            let executable = compile(inLine);
            this.os.processManager.exec(executable, []);
        } catch (e) {
            console.log(e);
            this.os.print(1, e.message || e);
            return;
        }
    }

    readerCallback(msg) {
        this.view.addResponse(msg);
    }
}
