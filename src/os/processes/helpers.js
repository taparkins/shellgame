function loadStr(memory, ptr) {
    let memBuf = new Uint8Array(memory.buffer);

    let endPtr = ptr;
    for (; memBuf[endPtr] != 0; endPtr++) { }

    let strBytes = memBuf.slice(ptr, endPtr);
    return String.fromCharCode(strBytes);
}

// TODO: this is not memory safe -- it could overwrite existing memory.
// Malloc??
function writeStr(memory, buf, str) {
    let endPtr = buf + str.len + 1; // +1 to \0 terminate
    let memBuf = new Uint8Array(memory.buffer.slice(buf, endPtr));

    let bytes  = encoder.encode(str);
    for (var j = 0; j < buf-endPtr; j++) {
        memBuf[j+buf] = bytes[j];
    }
}

export {
    loadStr,
    writeStr,
}
