import { WasmNode } from './wasmnode';
import { BuildSyscallImport } from './syscallimporter';

function jit(env, ast) {

}

function _buildBaseNode() {
    return new WasmNode([
        new WasmNode('module'),
        _buildMemoryImport(),
        BuildSyscallImport([
            'print',
            'getenv',
            'setenv',
        ]),
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

export {
    jit,
}
