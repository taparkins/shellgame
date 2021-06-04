import { ast2wat } from './ast2wat';
import { CompilationContext } from './context';
import { buildSyscallImport, syscall2wat } from './syscallimporter';
import { WasmNode } from './wasmnode';

function jit(env, ast) {
    let context = new CompilationContext();
    let wat = _buildBaseNode(ast, context);


}

function _buildBaseNode(ast, context) {
    let innerWat = ast2wat(ast, context);
    return new WasmNode([
        new WasmNode('module'),
        _buildMemoryImport(context),
        buildSyscallImport(context),
        _buildMainExport(innerWat, context),
    ]);
}

function _buildMemoryImport() {
    return new WasmNode([
        new WasmNode('memory'),
        new WasmNode([
            new WasmNode('import'),
            new WasmNode('"os"'),
            new WasmNode('"process_space"'),
        ]),
        new WasmNode(1),
    ]);
}

function _buildMainExport(innerWat, context) {
    let body = [ innerWat ];
    if (innerWat.returnType === undefined) {
        body.push(new WasmNode([
            new WasmNode('i32.const'),
            new WasmNode('0'),
        ], 'i32'));
    } else if (innerWat.returnType !== 'i32') {
        body.push(new WasmNode([
            new WasmNode('drop'),
        ]));
        body.push(new WasmNode([
            new WasmNode('i32.const'),
            new WasmNode('0'),
        ], 'i32'));
    }

    return new WasmNode([
        new WasmNode('func'),
        new WasmNode('$main'),

        new WasmNode([
            new WasmNode('export'),
            new WasmNode('main'),
        ]),

        new WasmNode([
            new WasmNode('param'),
            new WasmNode('i32'),
        ]),
        new WasmNode([
            new WasmNode('param'),
            new WasmNode('i32'),
        ]),

        new WasmNode([
            new WasmNode('result'),
            new WasmNode('i32'),
        ]),

        ...body,
    ]);
}

export {
    jit,
}
