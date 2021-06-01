import { parse } from './parser/shellgrammar';

export class ShellEngine {
    constructor(os, view) {
        this.os = os;
        this.view = view;
        this.view.submitLineCallback = this.handleLine.bind(this);
    }

    handleLine(inLine) {
        if (inLine === "") {
            this.response = "";
            return
        }

        try {
            let parsedCmd = parse(inLine);
            // TODO: execute command
        } catch (e) {
            this.os.print(1, e);
            let response = this.os.read(1, e.length).data;
            this.view.addResponseLine(response);
            return;
        }

        this.os.print(0, inLine);
        let response = this.os.read(0, inLine.length).data;
        this.view.addResponseLine(response);
    }
}
