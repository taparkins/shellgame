import { compile } from '../lang/compiler';

export class ShellEngine {
    constructor(os, view) {
        this.os = os;
        this.view = view;
        this.view.submitLineCallback = this.handleLine.bind(this);
        this.stdoutRid = this.os.registerReader(0, this.readerCallback.bind(this));
        this.stderrRid = this.os.registerReader(1, this.readerCallback.bind(this));
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
            this.os.print(1, e.message);
            return;
        }
    }

    readerCallback(msg) {
        this.view.addResponse(msg);
    }
}
