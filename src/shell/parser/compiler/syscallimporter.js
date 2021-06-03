import { WasmNode } from './wasmnode';

const SYSCALL_SIGNATURES = {
    print:  { params: [ 'i32', 'i32', 'i32' ], result: 'i32' },
    getenv: { params: [ 'i32', 'i32' ], result: 'i32' },
    setenv: { params: [ 'i32', 'i32' ], result: null },
}

function BuildSyscallImport(syscallNames) {
    return new WasmNode([
        new WasmNode('import'),
        new WasmNode('"os"'),
        new WasmNode('"syscall"'),
        new WasmNode(syscallNames.map(_buildSyscallSignature));
    ]);
}

function _buildSyscallSignature(syscallName) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw 'Invalid syscall name: ' + syscallName;
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
    BuildSyscallImport,
}
