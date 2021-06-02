import { BuildSyscaller } from './syscalls';

const MEM_CONFIGS = {
    initial: 1,
    maximum: 10,
};

export class Process {
    constructor(os, bytecode, args) {
        this.os = os;
        this.pid = os.getPid();

        this._setupMemory(args);
        this._buildImportModule();
        WebAssembly.instantiate(bytecode, importModule).then(this._onInstantiated.bind(this));
    }

    _onInstantiated(module) {
        this.module = module;
        if (module.instance.exports.main === undefined) {
            end();
        }

        // TODO: background processes?
        module.instance.exports.main(this.argc);
        end();
    }

    _setupMemory(args) {
        this.argc = args.length;
        this.memory = new WebAssembly.Memory(MEM_CONFIGS);

        let encoder = new TextEncoder();
        let argBufs = [];
        let bytesToAssign = 0;
        for (var i = 0; i < args.length; i++) {
            let argBuf = encoder.encode(args[i]);
            argBufs.push(argBuf);
            totalLen += argBuf.byteLength + 1; // +1 to account for \0 byte for string termination
        }

        let argPages = Math.floor(bytesToAssign / PAGE_SIZE);
        if (argPages >= MEM_CONFIGS.maximum) {
            // TODO: better error handling?
            throw "Insufficient memory for arguments provided to process (" + this.pid + ")";
        } else if (argPages > 1) {
            this.memory.grow(argPages - 1);
        }

        let curByteAddr = 0;
        let memoryBuf = new Uint8Array(this.memory.buffer);
        for (var i = 0; i < argBufs.length; i++) {
            let argBuf = argBufs[i];
            for (var j = 0; j < argBuf.byteLength; j++) {
                memoryBuf[curByteAddr++] = argBuf[j];
            }
            memoryBuf[curByteAddr++] = 0; // explicitly setting zero shouldn't be needed, but just to be safe
        }
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
        this.os.releasePid(this.pid);
    }
}
