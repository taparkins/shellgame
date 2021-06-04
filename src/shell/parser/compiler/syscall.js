import { WasmNode } from './wasmnode';

const SYSCALL_SIGNATURES = {
    fork:   { params: [ 'i32', 'i32', 'i32' ], result: 'i32' },
    print:  { params: [ 'i32', 'i32', 'i32' ], result: 'i32' },
    getenv: { params: [ 'i32' ], result: 'i32' },
    setenv: { params: [ 'i32', 'i32' ], result: null },
}

function buildSyscallImport(syscallNames) {
    return new WasmNode([
        new WasmNode('import'),
        new WasmNode('"os"'),
        new WasmNode('"syscall"'),
        new WasmNode(syscallNames.map(_buildSyscallSignature));
    ]);
}

function syscall2wat(syscallName, args, context) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw '(syscall2wat) Invalid syscall name: ' + syscallName;
    }

    context.imports.add(syscall);
    let resultType = SYSCALL_SIGNATURES[syscallName].result;
    return new WasmNode([
        new WasmNode('call'),
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
        ]);
    }

    if (signature.result !== null) {
        children.push(new WasmNode([
            new WasmNode('result'),
            new WasmNode(signature.result),
        ]);
    }

    return new WasmNode(children);
}

export {
    buildSyscallImport,
    syscall2wat,
}
