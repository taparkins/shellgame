// Builds a reference object that invokes syscalls based on the specified process.
// Syscalls are created dynamically to allow knowledge of which process is calling
// to be "baked in" to the syscalls themselves.
function BuildSyscaller(process) {

    return {
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
            os.print(channelCode, msg);
            return msg.length;
        },
}

export {
    BuildSyscaller,
}
