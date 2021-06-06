import { BuildSyscaller } from './syscalls';

export const MEM_CONFIGS = {
    initial: 1,
    maximum: 10,
};

const PROC_STATES = {
    NOT_STARTED: 0,
    RUNNING: 1,
    TERMINATED: 2,
}

const PAGE_SIZE = 65532;

export class Process {
    constructor(os, pid, executable, args) {
        this.os = os;
        this.pid = pid;
        this.endListener = undefined;
        this.state = PROC_STATES.NOT_STARTED;

        this.useableMemoryPtr = this._setupMemory(executable, args);
        let importModule = this._buildImportModule();

        WebAssembly.instantiate(
            executable.byteCode,
            importModule
        ).then(this._onInstantiated.bind(this));
    }

    setEndListener(callback) {
        this.endListener = callback;
        if (this.state == PROC_STATES.TERMINATED) {
            this.endListener(this);
        }
    }

    _onInstantiated(module) {
        this.module = module;
        if (module.instance.exports.main === undefined) {
            this.end();
        }

        // TODO: background processes?
        this.state = PROC_STATES.RUNNING;
        let result = module.instance.exports.main(this.useableMemoryPtr, this.argc);
        // TODO: this is just for testing purposes. Ultimately print needs to move into binaries
        this.os.print(0, result.toString());
        this.end();
    }

    _setupMemory(executable, args) {
        this.argc = args.length;
        this.memory = new WebAssembly.Memory(MEM_CONFIGS);


        let encoder = new TextEncoder();
        let argBufs = [];
        let requiredByteCount = executable.argRegionOffset;
        for (var i = 0; i < args.length; i++) {
            let argbuf = encoder.encode(args[i]);
            argBufs.push(argBuf);
            requiredByteCount += argBuf.byteLength + 1; // +1 to account for \0 byte for string termination
        }

        let requiredPages = Math.floor(requiredByteCount / PAGE_SIZE);
        if (requiredPages >= MEM_CONFIGS.maximum) {
            // TODO: better error handling?
            throw "Insufficient memory for arguments provided to process (" + this.pid + ")";
        } else if (requiredPages > 1) {
            this.memory.grow(argPages - 1);
        }

        let curByteAddr = executable.dataRegionOffset;
        let memoryBuf = new Uint8Array(this.memory.buffer);

        for (var i = 0; i < executable.dataRegion.byteLength; i++) {
            memoryBuf[curByteAddr++] = executable.dataRegion[i];
        }

        for (var i = 0; i < argBufs.length; i++) {
            let argBuf = argBufs[i];
            for (var j = 0; j < argBuf.byteLength; j++) {
                memoryBuf[curByteAddr++] = argBuf[j];
            }
            memoryBuf[curByteAddr++] = 0; // explicitly setting zero shouldn't be needed, but just to be safe
        }

        return curByteAddr;
    }

    _buildImportModule() {
        let module = {
            os: {
                process_space: this.memory,
            }
        };

        let syscalls = BuildSyscaller(this);
        for (let syscallName in syscalls) {
            module.os[syscallName] = syscalls[syscallName];
        }

        return module;
    }

    end() {
        this.state = PROC_STATES.TERMINATED;
        if (!!this.endListener) {
            this.endListener(this);
        }
    }
}
