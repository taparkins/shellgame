import { ast2wat } from './ast2wat';
import { CompilationContext } from './context';
import { syscall2wat } from './syscall';
import { WasmNode } from './wasmnode';
import { Executable } from '../../../os/processes/executable';

let WabtModule = null;
require('wabt')().then((wabt) => WabtModule = wabt);

function jit(ast) {
    while(WabtModule == null);

    // TODO: handle multi-line input
    if (Array.isArray(ast)) {
        ast = ast[0];
    }

    let context = new CompilationContext();
    let wat = _buildBaseNode(ast, context);
    let wasmModule = WabtModule.parseWat('na.wat', wat.toString());
    let byteCode = wasmModule.toBinary({}).buffer;
    return new Executable(byteCode, context.dataRegion);
}

function _buildBaseNode(ast, context) {
    let innerWat = ast2wat(ast, context);
    let baseNode = new WasmNode([
        new WasmNode('module'),
        _buildMemoryImport(context),
    ]);

    baseNode.children = baseNode.children.concat(context.getGlobalsImportNode());
    baseNode.children = baseNode.children.concat(context.getFuncsImportNode());

    baseNode.children.push(_buildMainExport(innerWat, context));

    return baseNode;
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
    if (innerWat.returnType === undefined || innerWat.returnType === null) {
        body.push(new WasmNode([
            new WasmNode('i32.const'),
            new WasmNode('0'),
        ], 'i32'));
    } else if (innerWat.returnType === '*u8') {

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
            new WasmNode('"main"'),
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
