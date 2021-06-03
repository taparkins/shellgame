import { parse } from './shellgrammar';

export class Interpreter {
    constructor(os) {
        this.os = os;
    }

    executeLine(inLine) {
        let ast;
        try {
            ast = parse(inLine);
        } catch (e) {
            this.os.print(0, "Invalid command\n");
            this.os.print(1, e);
        }

        let execPayload = _jit(ast);
        this.os.processManager.exec(execPayload.bytecode, execPayload.args);
    }

    _jit(ast) {
        // TODO: this only handles a portion of the grammar -- need to complete

    }
}
