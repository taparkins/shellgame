import { WasmNode } from '../wasmnode'
import { convertNode } from './converter'
import { TYPE_MAPPINGS } from './types'

const SYSCALL_SIGNATURES = {
    fork:   { params: [ 'i32', '*u8', '*u8', 'i32' ], result: 'i32' },
    write:  { params: [ 'i32', 'i32', '*u8', 'i32' ], result: 'i32' },
    malloc: { params: [ 'i32', 'i32' ], result: '*u8' },
    free:   { params: [ 'i32', '*u8' ], result: null },
    getenv: { params: [ 'i32', '*u8' ], result: '*u8' },
    setenv: { params: [ 'i32', '*u8', '*u8' ], result: null },
}

function convertSyscall(syscallName, args, context) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw '(convertSyscall) Invalid syscall name: ' + syscallName;
    }

    context.addSyscallDependency(syscallName);
    let resultType = SYSCALL_SIGNATURES[syscallName].result;
    return new WasmNode([
        new WasmNode('call'),
        new WasmNode('$' + syscallName),
        ...args.map((arg) => convertNode(arg, context)),
    ], resultType);
}

function buildSyscallSignature(syscallName) {
    if (SYSCALL_SIGNATURES[syscallName] === undefined) {
        throw '(_buildSyscallSignature) Invalid syscall name: ' + syscallName;
    }

    let signature = SYSCALL_SIGNATURES[syscallName];

    let children = ['func', '$' + syscallName];
    for (var i = 0; i < signature.params.length; i++) {
        children.push(new WasmNode([
            'param',
            TYPE_MAPPINGS[signature.params[i]],
        ]));
    }

    if (signature.result !== null) {
        children.push(new WasmNode([
            'result',
            TYPE_MAPPINGS[signature.result],
        ]));
    }

    return new WasmNode(children);
}

export {
    buildSyscallSignature,
    convertSyscall,
}
