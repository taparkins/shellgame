import { WasmNode } from './wasmnode'
import { buildSyscallSignature } from './ast2wat/syscall'
import { buildGlobalType } from './ast2wat/globals'

export class CompilationContext {
    constructor() {
        this.importGlobals = new Set();
        this.importFuncs = new Set();
        this.dataRegion = new Uint8Array([ 0, 0, 0, 0, ]); // hardcode 4x 0 bytes to account for null-pointer
        this.dataSegmentPtrs = {};
        this._maxBranchIdentifier = 0;
    }

    addDataItem(dataSegment) {
        if (this.dataSegmentPtrs[dataSegment] !== undefined) {
            return this.dataSegmentPtrs[dataSegment];
        }

        let newPtr = this.dataRegion.length;
        this.dataSegmentPtrs[dataSegment] = newPtr;
        this.dataRegion = new Uint8Array([ ...this.dataRegion, ...dataSegment ]);
        return newPtr;
    }

    getMemoryImportNode() {
        // TODO: resize memory if needed for data region (?)
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

    getGlobalsImportNodes() {
        return [...this.importGlobals]
            .map((globalName) => {
                return new WasmNode([
                    'global',
                    '$' + globalName,
                    new WasmNode([
                        'import',
                        '"globals"',
                        '"' + globalName + '"',
                    ]),
                    buildGlobalType(globalName),
                ]);
            });
    }

    getFuncsImportNodes() {
        return [...this.importFuncs]
            .map((syscallName) => {
                return new WasmNode([
                    'import',
                    '"syscalls"',
                    '"' + syscallName + '"',
                    buildSyscallSignature(syscallName),
                ]);
            });
    }

    allocBranchIdentifier() {
        return ++this._maxBranchIdentifier;
    }

    deallocBranchIdentifier() {
        --this._maxBranchIdentifier;
    }
}
