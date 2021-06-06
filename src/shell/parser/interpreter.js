import { parse } from './shellgrammar';
import { jit } from './compiler/jitter';

export class Interpreter {
    constructor(os) {
        this.os = os;
    }

    executeLine(inLine) {
        let ast = parse(inLine);
        let executable = jit(ast);
        this.os.processManager.exec(executable, []);
    }
}
