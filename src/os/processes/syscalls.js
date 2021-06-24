import { loadStr, writeStr } from './helpers';

export class Syscaller {
    constructor(os) {
        this.os = os;
        this.exportModule = {
            fork:   this.fork.bind(this),
            write:  this.write.bind(this),
            malloc: this.malloc.bind(this),
            free:   this.free.bind(this),
            getenv: this.getenv.bind(this),
            setenv: this.setenv.bind(this),
            trap:   this.trap.bind(this),
        };
    }

    // Signature: [ i32, *u8, *u8, i32 ] -> i32
    // Details:
    //   Begins a new process with the specified executable, using the specified arguments.
    //   Arg 0:  process ID
    //   Arg 1:  pointer to 0-terminated string with path to the executable to run
    //   Arg 2:  pointer to buffer that contains arguments for the new process
    //   Arg 3:  number of bytes contained in the argument buffer
    //   Return: status code
    //     On success: positive integer of the PID for the new process
    //     On failure: negative number indicating failure:
    //          -1 -- Specified executable ID not found in lookup tables
    //          -2 -- Out of bounds access on local memory
    //          -3 -- Argument buffer too large to fit into memory space of new process
    fork(pid, exePathPtr, argBuf, argBufLen) {
        let process = this.os.getProcByPID(pid);
        let maxPtr = process.memory.buffer.byteLength;

        if (exePathPtr > maxPtr) {
            return -2;
        } else if (argBuf + argBufLen > maxPtr) {
            return -2;
        }

        let path = loadStr(process.memory, exePathPtr);

        let consumedBytes = 0;
        let curPtr = argBuf;
        let args = [];
        while (consumedBytes < argBufLen) {
            let nextArg = loadStr(process.memory, curPtr);
            curPtr += nextArg.length + 1;
            args.push(nextArg);
        }

        let executable = process.os.environment.executables[path];
        if (executable === undefined) {
            return -1;
        }

        // TODO: error handling on memory capacity
        return process.os.processManager.exec(executable, args);
    }

    // Signature: [ i32, i32, *u8, i32 ] -> i32
    // Details:
    //   Writes a buffer of bytes into a specified channel, and reports back success/failure.
    //   Arg 0:  process ID
    //   Arg 1:  integer code for channel to write into
    //   Arg 2:  address to beginning of byte data to be written
    //   Arg 3:  number of bytes to write into the channel
    //   Return: status code
    //     On success: non-negative number of bytes written to channel
    //     On failure: negative number (see "error codes" for meaning)
    write(pid, channelCode, byteAddr, byteLen) {
        let process = this.os.getProcByPID(pid);
        let strBuffer = process.memory.wasmMemory.buffer.slice(byteAddr, byteAddr + byteLen);

        let decoder = new TextDecoder();
        let msg = decoder.decode(new Uint8Array(strBuffer));
        // TODO: don't convert this to a string, just write a byte array to the channel
        process.os.print(channelCode, msg);
        return msg.length;
    }

    // Signature: [ i32, i32 ] -> *u8
    // Details:
    //   Requests an allocation of memory for the specified process, of the specified size.
    //   Arg 0:  process ID
    //   Arg 1:  number of bytes to allocate into the region
    //   Return: pointer to allocated memory
    //     On failure: exception is thrown
    malloc(pid, byteLen) {
        let process = this.os.getProcByPID(pid);
        return process.memory.alloc(byteLen);
    }

    // Signature: [ i32, *u8 ] -> ()
    // Details:
    //   Frees an allocation of memory for the specified process.
    //   Arg 0: process ID
    //   Arg 1: pointer to region of memory to be freed
    //   Return: VOID
    //     On failure: exception is thrown
    free(pid, ptr) {
        let process = this.os.getProcByPID(pid);
        return process.memory.free(ptr);
    }

    // Signature: [ i32, *u8 ] -> *u8
    // Details:
    //   Loads the value from an environment variable.
    //   Arg 0:  process ID
    //   Arg 1:  Pointer to \0-terminated string name for the environment variable to load
    //   Return: Pointer to \0-terminated string contents of requested environment variable.
    //     If the specified environment variable is uninitialized, the pointer will reference
    //     an empty string.
    getenv(pid, envNamePtr) {
        let process = this.os.getProcByPID(pid);
        let envName = loadStr(process.memory, envNamePtr);
        let value = process.os.environment.variables[envName];

        if (value === undefined) {
            value = "";
        }

        let saveBuf = writeStr(process.memory, value);
        return saveBuf;
    }

    // Signature: [ i32, *u8, *u8 ] -> ()
    // Details:
    //   Saves a value to an environment variable.
    //   Arg 0:  process ID
    //   Arg 1:  Pointer to \0-terminated string name for the environment variable to load
    //   Arg 2:  Pointer to \0-terminated string value to save to the environment variable
    setenv(pid, envNamePtr, strPtr) {
        let process = this.os.getProcByPID(pid);
        let envName = loadStr(process.memory, envNamePtr);
        let value = loadStr(process.memory, strPtr);
        process.os.environment.variables[envName] = value;
    }

    // Signature: [ i32, *u8 ] -> EXCEPTION
    // Details:
    //   Throws an exception with a provided message.
    //   Arg 0:  process ID
    //   Arg 1:  Pointer to a \0-terminated string used as the message for the exception
    //   Returns: Does not return, always throws an exception
    trap(pid, msgPtr) {
        let process = this.os.getProcByPID(pid);
        let msg = loadStr(process.memory, msgPtr);
        throw msg;
    }
}
