import { parse } from './parser/grammar';
import { ast2wat } from './ast2wat/ast2wat';
import { wat2exe } from './wat2exe/wat2exe';
import { CompilationContext } from './context';

function compile(code) {
    let context = new CompilationContext();
    let astLines = parse(code);
    let wat = ast2wat(astLines, context);
    let exe = wat2exe(wat, context);
    return exe;
}

export {
    compile,
}
