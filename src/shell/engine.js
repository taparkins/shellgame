import { parse } from './parser/shellgrammar';


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
            let parsedCmd = parse(inLine);
            console.log(parsedCmd);
            // TODO: execute command
        } catch (e) {
            console.log(e);
            this.os.print(1, e);
            return;
        }

        this.os.print(0, inLine);
    }

    readerCallback(msg) {
        this.view.addResponse(msg);
    }
}
