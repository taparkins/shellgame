export class ShellEngine {
    constructor(os, view) {
        this.os = os;
        this.view = view;
        this.view.submitLineCallback = this.handleLine.bind(this);
    }

    handleLine(inLine) {
        // TODO: parse and such
        this.os.print(0, inLine);
        let response = this.os.read(0, inLine.length).data;
        this.view.addResponseLine(response);
    }
}
