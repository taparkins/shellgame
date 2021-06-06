const NEWLINE_PATTERN = /\r?\n/;

export class ShellWindow {
    constructor(containerElem) {
        this.container = containerElem;
        this.curLine = null;
        this.submitLineCallback = null;
        this.initShellContainer();
    }

    initShellContainer() {
        this.container.classList.add("shellContainer");

        this.clickShield = document.createElement("div");
        this.clickShield.classList.add("shellClickShield");
        this.clickShield.addEventListener("mouseup", this.selectActiveLine.bind(this), false);
        this.container.appendChild(this.clickShield);

        this.addShellLine(false);
    }

    addResponse(msg) {
        if (!!this.curLine) {
            this.deactivateShellLine(this.curLine);
            this.curLine = null;
        }

        let msgLines = msg.split(NEWLINE_PATTERN);
        for (var i = 0; i < msgLines.length; i++) {
            let newResponseLine = document.createElement("textarea");
            newResponseLine.classList.add("shellLine");
            this.deactivateShellLine(newResponseLine);
            newResponseLine.rows = 1;
            newResponseLine.cols = 120;
            newResponseLine.value = msg;

            this.container.appendChild(document.createElement("br"));
            this.container.appendChild(newResponseLine);
        }

        this.addShellLine(true);
    }

    addShellLine(includeBr) {
        if (!!this.curLine)
            this.deactivateShellLine(this.curLine);

        let newShellLinePrefix = document.createElement("textarea");
        newShellLinePrefix.classList.add("shellLine");
        this.deactivateShellLine(newShellLinePrefix);
        newShellLinePrefix.rows = 1;
        newShellLinePrefix.value = "> "
        newShellLinePrefix.cols = newShellLinePrefix.value.length;

        this.curLine = document.createElement("textarea");
        this.curLine.classList.add("shellLine");
        this.curLine.rows = 1;
        this.curLine.cols = 120 - newShellLinePrefix.cols;
        this.activateShellLine(this.curLine);

        if (includeBr) {
            this.container.appendChild(document.createElement("br"));
        }
        this.container.appendChild(newShellLinePrefix);
        this.container.appendChild(this.curLine);

        this.selectActiveLine();
    }

    activateShellLine(shellLine) {
        shellLine.classList.add('active');
        shellLine.addEventListener('keydown', this._returnHandler.bind(this), false);
        shellLine.disabled = false;
    }

    deactivateShellLine(shellLine) {
        shellLine.classList.remove('active');
        shellLine.removeEventListener("keydown", this._returnHandler.bind(this), false);
        shellLine.disabled = true;
    }

    selectActiveLine() {
        if (!this.curLine)
            return;

        this.curLine.focus();
        this.curLine.setSelectionRange(
            this.curLine.value.length,
            this.curLine.value.length);
    }

    _returnHandler(evnt) {
        if (evnt.keyCode == 13) {
            evnt.preventDefault();
            if (this.submitLineCallback && this.curLine)
                this.submitLineCallback(this.curLine.value);
        }
    }
}
