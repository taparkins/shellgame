import { WasmNode } from '../wasmnode'
import { convertNode } from './converter'

function ast2wat(astLines, context) {
    let mainNode = _buildMain(astLines, context);
    return new WasmNode([
        new WasmNode('module'),
        context.getMemoryImportNode(),
        ...context.getGlobalsImportNodes(),
        ...context.getFuncsImportNodes(),
        mainNode,
    ]);
}

function _buildMain(astLines, context) {
    let returnType = undefined;
    let body = [];

    for (var i = 0; i < astLines.length; i++) {
        // If the previous line had a return value, that needs to get cleared out
        if (returnType !== undefined && returnType !== null) {
            body.push(new WasmNode(['drop']));
        }

        let ast = astLines[i];
        let lineNode = convertNode(ast, context);
        body.push(lineNode);
        returnType = lineNode.returnType;
    }

    if (returnType === undefined || returnType === null) {
        body.push(new WasmNode([
            new WasmNode('i32.const'),
            new WasmNode('0'),
        ], 'i32'));
    } else if (returnType === '*u8') {
        // TODO: handle string output
    } else if (returnType !== 'i32') {
        // Unknown return type -- just clear it and return zero
        body.push(new WasmNode(['drop']));
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
    ast2wat,
}
