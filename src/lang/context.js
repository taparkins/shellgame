import { WasmNode } from './wasmnode'
import { buildSyscallSignature } from './ast2wat/syscall'
import { buildGlobalType } from './ast2wat/globals'
import { CORELIB_FUNCS } from './corelib/corelib'
import { REGION_1_START } from '../os/processes/executable'

export class CompilationContext {
    constructor() {
        this.globals = new Set();
        this.syscalls = new Set();
        this.corelibs = new Set();

        this.dataRegion = new Uint8Array([ ]);
        this.dataSegmentPtrs = {};
        this._maxBranchIdentifier = 0;
    }

    addDataItem(dataSegment) {
        if (this.dataSegmentPtrs[dataSegment] !== undefined) {
            return this.dataSegmentPtrs[dataSegment];
        }

        let newPtr = this.dataRegion.length + REGION_1_START;
        this.dataSegmentPtrs[dataSegment] = newPtr;
        this.dataRegion = new Uint8Array([ ...this.dataRegion, ...dataSegment ]);
        return newPtr;
    }

    addGlobalDependency(globalName) {
        this.globals.add(globalName);
    }

    addSyscallDependency(funcName) {
        this.syscalls.add(funcName);
    }

    addCorelibDependency(funcName) {
        let funcDesc = CORELIB_FUNCS[funcName];
        if (!funcDesc) {
            throw 'Unknown corelib func: ' + funcName;
        }

        this.corelibs.add(funcName);

        if (!!funcDesc.globals) {
            for (var i = 0; i < funcDesc.globals.length; i++) {
                this.addGlobalDependency(funcDesc.globals[i]);
            }
        }

        if (!!funcDesc.syscalls) {
            for (var i = 0; i < funcDesc.syscalls.length; i++) {
                this.addSyscallDependency(funcDesc.syscalls[i]);
            }
        }

        if (!!funcDesc.corelib) {
            for (var i = 0; i < funcDesc.corelib.length; i++) {
                this.addCorelibDependency(funcDesc.corelib[i]);
            }
        }
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

    getGlobalImportNodes() {
        return [...this.globals]
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

    getSyscallImportNodes() {
        return [...this.syscalls]
            .map((syscallName) => {
                return new WasmNode([
                    'import',
                    '"syscalls"',
                    '"' + syscallName + '"',
                    buildSyscallSignature(syscallName),
                ]);
            });
    }

    getCorelibImportNodes() {
        return [...this.corelibs]
            .map((corelibName) => CORELIB_FUNCS[corelibName].node);
    }

    allocBranchIdentifier() {
        return ++this._maxBranchIdentifier;
    }

    deallocBranchIdentifier() {
        --this._maxBranchIdentifier;
    }
}
