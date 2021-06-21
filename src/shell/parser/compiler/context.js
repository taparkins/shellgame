import { WasmNode } from './wasmnode'
import { buildSyscallSignature } from './syscall'
import { buildGlobalType } from './globals'

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

    getGlobalsImportNode() {
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

    getFuncsImportNode() {
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
