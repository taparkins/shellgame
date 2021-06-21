import { loadStr, writeStr } from './helpers';

// Builds a reference object that invokes syscalls based on the specified process.
// Syscalls are created dynamically to allow knowledge of which process is calling
// to be "baked in" to the syscalls themselves.
function BuildSyscaller(process) {

    return {

        // Signature: [ *u8, *u8, i32 ] -> i32
        // Details:
        //   Begins a new process with the specified executable, using the specified arguments.
        //   Arg 1:  pointer to 0-terminated string with path to the executable to run
        //   Arg 2:  pointer to buffer that contains arguments for the new process
        //   Arg 3:  number of bytes contained in the argument buffer
        //   Return: status code
        //     On success: positive integer of the PID for the new process
        //     On failure: negative number indicating failure:
        //          -1 -- Specified executable ID not found in lookup tables
        //          -2 -- Out of bounds access on local memory
        //          -3 -- Argument buffer too large to fit into memory space of new process
        fork: (exePathPtr, argBuf, argBufLen) => {
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
        },

        // Signature: [ i32, *u8, i32 ] -> i32
        // Details:
        //   Prints a string of bytes into a specified channel, and reports back success/failure.
        //   Arg 1:  integer code for channel to write into
        //   Arg 2:  address to beginning of byte data to be written
        //   Arg 3:  number of bytes to write into the channel
        //   Return: status code
        //     On success: non-negative number of bytes written to channel
        //     On failure: negative number (see "error codes" for meaning)
        print: (channelCode, byteAddr, byteLen) => {
            let strBuffer = process.memory.buffer.slice(byteAddr, byteAddr + byteLen);
            let msg = String.fromCharCode(new Uint8Array(strBuffer));
            process.os.print(channelCode, msg);
            return msg.length;
        },

        // Signature: [ *u8 ] -> *u8
        // Details:
        //   Loads the value from an environment variable.
        //   Arg 1:  Pointer to \0-terminated string name for the environment variable to load
        //   Return: Pointer to \0-terminated string contents of requested environment variable.
        //     If the specified environment variable is uninitialized, the pointer will reference
        //     an empty string.
        getenv: (envNamePtr) => {
            let envName = loadStr(process.memory, envNamePtr);
            let value = process.os.environment.variables[envName];

            if (value === undefined) {
                value = "";
            }

            // TODO: I need a malloc to do this properly.
            let saveBuf = 0x00;
            writeStr(process.memory, saveBuf, value);
            return saveBuf;
        },

        // Signature: [ *u8, *u8 ] -> ()
        // Details:
        //   Saves a value to an environment variable.
        //   Arg 1:  Pointer to \0-terminated string name for the environment variable to load
        //   Arg 2:  Pointer to \0-terminated string value to save to the environment variable
        setenv: (envNamePtr, strPtr) => {
            let envName = loadStr(process.memory, envNamePtr);
            let value = loadStr(process.memory, strPtr);
            process.os.environment.variables[envName] = value;
        }
    }
}

export {
    BuildSyscaller,
}
