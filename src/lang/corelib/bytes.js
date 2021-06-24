import { WasmNode } from '../wasmnode'

const countBytes = {
    node: new WasmNode([
        'func',
        '$countBytes',
        new WasmNode(['param', '$strptr', 'i32']),
        new WasmNode(['result', 'i32']),
        new WasmNode(['local', '$curptr', 'i32']),
        new WasmNode(['local', '$curval', 'i32']),

        new WasmNode([ 'local.set', '$curptr', new WasmNode([ 'local.get', '$strptr' ]) ]),
        new WasmNode([
            'block', '$break',
            new WasmNode([
                'loop', '$l1',
                new WasmNode([
                    'local.set', '$curval',
                    new WasmNode([
                        'i32.load',
                        new WasmNode(['local.get', '$curptr']),
                    ]),
                ]),

                // Check byte 0
                new WasmNode([
                    'br_if', '$break',
                    new WasmNode([
                        'i32.eqz',
                        new WasmNode([
                            'i32.and',
                            new WasmNode(['i32.const', '0x000000ff']),
                            new WasmNode(['local.get', '$curval']),
                        ]),
                    ]),
                ]),

                new WasmNode([
                    'local.set', '$curptr',
                    new WasmNode([
                        'i32.add',
                        new WasmNode(['i32.const', '1']),
                        new WasmNode(['local.get', '$curptr']),
                    ]),
                ]),

                // Check byte 1
                new WasmNode([
                    'br_if', '$break',
                    new WasmNode([
                        'i32.eqz',
                        new WasmNode([
                            'i32.and',
                            new WasmNode(['i32.const', '0x0000ff00']),
                            new WasmNode(['local.get', '$curval']),
                        ]),
                    ]),
                ]),

                new WasmNode([
                    'local.set', '$curptr',
                    new WasmNode([
                        'i32.add',
                        new WasmNode(['i32.const', '1']),
                        new WasmNode(['local.get', '$curptr']),
                    ]),
                ]),

                // Check byte 2
                new WasmNode([
                    'br_if', '$break',
                    new WasmNode([
                        'i32.eqz',
                        new WasmNode([
                            'i32.and',
                            new WasmNode(['i32.const', '0x00ff0000']),
                            new WasmNode(['local.get', '$curval']),
                        ]),
                    ]),
                ]),

                new WasmNode([
                    'local.set', '$curptr',
                    new WasmNode([
                        'i32.add',
                        new WasmNode(['i32.const', '1']),
                        new WasmNode(['local.get', '$curptr']),
                    ]),
                ]),

                // Check byte 3
                new WasmNode([
                    'br_if', '$break',
                    new WasmNode([
                        'i32.eqz',
                        new WasmNode([
                            'i32.and',
                            new WasmNode(['i32.const', '0xff000000']),
                            new WasmNode(['local.get', '$curval']),
                        ]),
                    ]),
                ]),

                new WasmNode([
                    'local.set', '$curptr',
                    new WasmNode([
                        'i32.add',
                        new WasmNode(['i32.const', '1']),
                        new WasmNode(['local.get', '$curptr']),
                    ]),
                ]),

                // Check next i32
                new WasmNode(['br', '$l1']),
            ]),
        ]),

        // return computed count
        new WasmNode([
            'i32.sub',
            new WasmNode(['local.get', '$curptr']),
            new WasmNode(['local.get', '$strptr']),
        ]),
    ]),
};

const shiftBytesLeft = {
    node: new WasmNode([
        'func',
        '$shiftBytesLeft',
        new WasmNode([ 'param', '$ptr', 'i32' ]),
        new WasmNode([ 'param', '$shift', 'i32' ]),
        new WasmNode([ 'param', '$byteCnt', 'i32' ]),

        new WasmNode([ 'block', '$break',
            new WasmNode([ 'loop', '$l1',
                new WasmNode([ 'br_if', '$break',
                    new WasmNode([ 'i32.le_s',
                        new WasmNode([ 'local.get', '$byteCnt' ]),
                        new WasmNode([ 'i32.const', '0' ]),
                    ]),
                ]),

                new WasmNode([ 'i32.store8',
                    new WasmNode(['i32.sub',
                        new WasmNode([ 'local.get', '$ptr' ]),
                        new WasmNode([ 'local.get', '$shift' ]),
                    ]),
                    new WasmNode([ 'i32.load8_u', new WasmNode([ 'local.get', '$ptr' ])]),
                ]),

                new WasmNode([ 'i32.store8',
                    new WasmNode([ 'local.get', '$ptr' ]),
                    new WasmNode([ 'i32.const', '0' ]),
                ]),

                new WasmNode([ 'local.set', '$byteCnt',
                    new WasmNode([ 'i32.sub',
                        new WasmNode([ 'local.get', '$byteCnt' ]),
                        new WasmNode([ 'i32.const', '1' ]),
                    ]),
                ]),
                new WasmNode([ 'local.set', '$ptr',
                    new WasmNode([ 'i32.add',
                        new WasmNode([ 'local.get', '$ptr' ]),
                        new WasmNode([ 'i32.const', '1' ]),
                    ]),
                ]),

                new WasmNode([ 'br', '$l1' ]),
            ]),
        ]),
    ]),
};

export {
    countBytes,
    shiftBytesLeft,
}
