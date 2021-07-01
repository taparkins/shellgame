import { BuildSyscaller } from './syscalls';
import { ProcessMemory } from './memory';

const PROC_STATES = {
    NOT_STARTED: 0,
    RUNNING: 1,
    TERMINATED: 2,
}


export class Process {
    constructor(os, pid, executable, args) {
        this.os = os;
        this.pid = pid;
        this.endListener = undefined;
        this.state = PROC_STATES.NOT_STARTED;
        this.memory = new ProcessMemory();
        this._setupMemory(executable, args);

        let importModule = this._buildImportModule();

        this.module = new WebAssembly.Module(executable.byteCode);
        this.instance = new WebAssembly.Instance(this.module, importModule);
    }

    start() {
        if (this.instance.exports.main === undefined) {
            this.end();
        }

        // TODO: background processes?
        this.state = PROC_STATES.RUNNING;
        let result = this.instance.exports.main(this.useableMemoryPtr, this.argc);
        this.end();
    }

    setEndListener(callback) {
        this.endListener = callback;
        if (this.state == PROC_STATES.TERMINATED) {
            this.endListener(this);
        }
    }

    _setupMemory(executable, args) {
        // Setup regions 0 and 1 (null-ptr and dataSegments)
        let staticRegionPtr = this.memory.alloc(executable.dataRegion.byteLength + executable.dataRegionOffset);
        this.memory.memcopy_safe(executable.dataRegion, staticRegionPtr + executable.dataRegionOffset);

        // Setup region 2 (args)
        this.argc = args.length;
        let encoder = new TextEncoder();
        let argsBuf = new Uint8Array(0);
        for (var i = 0; i < args.length; i++) {
            let argBuf = encoder.encode(args[i] + '\0');
            argsBuf = new Uint8Array([...argsBuf, ...argBuf]);
        }

        let argsRegionPtr = null;
        if (argsBuf.byteLength > 0) {
            this.memory.alloc(argsBuf.byteLength);
            this.memory.memcopy_safe(argsBuf, argsRegionPtr);
        }
    }

    _buildImportModule() {
        return {
            globals: {
                pid: this.pid,
            },
            os: {
                process_space: this.memory.wasmMemory,
            },
            syscalls: this.os.syscaller.exportModule,
        };
    }

    end() {
        this.state = PROC_STATES.TERMINATED;
        if (!!this.endListener) {
            this.endListener(this);
        }
    }
}
