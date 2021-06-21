import { WasmNode } from './wasmnode';
import { ast2wat } from './ast2wat';

const SYSCALL_SIGNATURES = {
    fork:   { params: [ 'i32', 'i32', 'i32' ], result: 'i32' },
    print:  { params: [ 'i32', 'i32', 'i32' ], result: 'i32' },
    getenv: { params: [ 'i32' ], result: 'i32' },
    setenv: { params: [ 'i32', 'i32' ], result: null },
}

function buildSyscallImports(context) {
    return [...context.imports]
        .map((syscallName) => {
            return new WasmNode([
                'import',
                '"os"',
                '"' + syscallName + '"',
                _buildSyscallSignature(syscallName),
            ]);
        });
}

function syscall2wat(syscallName, args, context) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw '(syscall2wat) Invalid syscall name: ' + syscallName;
    }

    context.imports.add(syscallName);
    let resultType = SYSCALL_SIGNATURES[syscallName].result;
    return new WasmNode([
        new WasmNode('call'),
        new WasmNode('$' + syscallName),
        ...args.map((arg) => ast2wat(arg, context)),
    ], resultType);
}

function _buildSyscallSignature(syscallName) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw '(_buildSyscallSignature) Invalid syscall name: ' + syscallName;
    }

    let signature = SYSCALL_SIGNATURES[syscallName];

    let children = [
        new WasmNode('func'),
        new WasmNode('$' + syscallName),
    ];

    for (var i = 0; i < signature.params.length; i++) {
        children.push(new WasmNode([
            new WasmNode('param'),
            new WasmNode(signature.params[i]),
        ]));
    }

    if (signature.result !== null) {
        children.push(new WasmNode([
            new WasmNode('result'),
            new WasmNode(signature.result),
        ]));
    }

    return new WasmNode(children);
}

export {
    buildSyscallImports,
    syscall2wat,
}
