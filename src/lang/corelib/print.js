import { WasmNode } from '../wasmnode'

const print = {
    node: new WasmNode([
        'func',
        '$print',
        new WasmNode(['param', '$strptr', 'i32']),

        new WasmNode([
            'call', '$write',
            new WasmNode(['global.get', '$pid']),
            new WasmNode(['i32.const', '0']),
            new WasmNode(['local.get', '$strptr']),
            new WasmNode([
                'call', '$countBytes',
                new WasmNode(['local.get', '$strptr']),
            ]),
        ]),
        new WasmNode(['drop']),
    ]),
    globals: ['pid'],
    syscalls: ['write'],
    corelib: ['countBytes'],
};

export {
    print,
}
