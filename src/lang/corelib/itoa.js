import { WasmNode } from '../wasmnode'

const itoa = {
    node: new WasmNode([
        'func',
        '$itoa',
        new WasmNode(['param', '$n', 'i32']),
        new WasmNode(['result', 'i32']),
        new WasmNode(['local', '$m', 'i32']),
        new WasmNode(['local', '$resultptr', 'i32']),
        new WasmNode(['local', '$curptr', 'i32']),

        new WasmNode([
            'local.set', '$m',
            new WasmNode([
                'if',
                new WasmNode([ 'result', 'i32' ]),
                new WasmNode([ 'i32.lt_s',
                    new WasmNode([ 'local.get', '$n' ]),
                    new WasmNode([ 'i32.const', '0' ]),
                ]),
                new WasmNode([ 'then',
                    new WasmNode([ 'i32.mul',
                        new WasmNode([ 'local.get', '$n' ]),
                        new WasmNode([ 'i32.const', '-1' ]),
                    ]),
                ]),
                new WasmNode([ 'else', new WasmNode([ 'local.get', '$n' ]) ]),
            ]),
        ]),

        new WasmNode([
            'local.set', '$resultptr',
            // This potentially allocates more than is necessary, but it simplifies the logic by quite a lot
            new WasmNode([ 'call', '$malloc',
                new WasmNode([ 'global.get', '$pid' ]),
                new WasmNode([ 'i32.const', '12' ]),
            ]),
        ]),
        new WasmNode([ 'local.set', '$curptr',
            new WasmNode([ 'i32.add',
                new WasmNode([ 'i32.const', '11' ]),
                new WasmNode([ 'local.get', '$resultptr' ]),
            ]),
        ]),

        new WasmNode([ 'block', '$break',
            new WasmNode([ 'loop', '$l1',
                new WasmNode([ 'i32.store8',
                    new WasmNode([ 'local.get', '$curptr' ]),
                    new WasmNode([ 'i32.add',
                        new WasmNode([ 'i32.rem_u',
                            new WasmNode([ 'local.get', '$m' ]),
                            new WasmNode([ 'i32.const', '10' ]),
                        ]),
                        // '0' character
                        new WasmNode([ 'i32.const', '48' ]),
                    ]),
                ]),

                new WasmNode([ 'local.set', '$curptr',
                    new WasmNode([ 'i32.sub',
                        new WasmNode([ 'local.get', '$curptr' ]),
                        new WasmNode([ 'i32.const', '1' ]),
                    ]),
                ]),

                new WasmNode([ 'local.set', '$m',
                    new WasmNode([ 'i32.div_u',
                        new WasmNode([ 'local.get', '$m' ]),
                        new WasmNode([ 'i32.const', '10' ]),
                    ]),
                ]),

                new WasmNode([ 'br_if', '$break',
                    new WasmNode([ 'i32.eqz', new WasmNode([ 'local.get', '$m' ])]),
                ]),
                new WasmNode([ 'br', '$l1' ]),
            ]),
        ]),

        new WasmNode([
            'if',
            new WasmNode([
                'i32.lt_s',
                new WasmNode([ 'local.get', '$n' ]),
                new WasmNode([ 'i32.const', '0' ]),
            ]),
            new WasmNode([
                'then',
                new WasmNode([
                    'i32.store8',
                    new WasmNode([ 'local.get', '$curptr' ]),
                    // '-' character
                    new WasmNode([ 'i32.const', '45' ]),
                ]),
                new WasmNode([
                    'local.set', '$curptr',
                    new WasmNode([
                        'i32.sub',
                        new WasmNode([ 'local.get', '$curptr' ]),
                        new WasmNode([ 'i32.const', '1' ]),
                    ]),
                ]),
            ]),
        ]),

        // Fencepost: shift curptr back to the last character we inserted
        new WasmNode([
            'local.set', '$curptr',
            new WasmNode([
                'i32.add',
                new WasmNode([ 'local.get', '$curptr' ]),
                new WasmNode([ 'i32.const', '1' ]),
            ]),
        ]),

        new WasmNode([
            'call', '$shiftBytesLeft',
            new WasmNode([ 'local.get', '$curptr' ]),
            new WasmNode([
                'i32.sub',
                new WasmNode([ 'local.get', '$curptr' ]),
                new WasmNode([ 'local.get', '$resultptr' ]),
            ]),
            new WasmNode([
                'i32.sub',
                new WasmNode([ 'i32.const', '12' ]),
                new WasmNode([
                    'i32.sub',
                    new WasmNode([ 'local.get', '$curptr' ]),
                    new WasmNode([ 'local.get', '$resultptr' ]),
                ]),
            ]),
        ]),

        new WasmNode([ 'local.get', '$resultptr' ]),
    ]),
    globals: ['pid'],
    syscalls: ['malloc'],
    corelib: ['shiftBytesLeft'],
};

export {
    itoa,
}
