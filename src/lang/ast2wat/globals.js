const GLOBAL_TYPES = {
    pid: { type: 'i32', mutable: false },
};

function buildGlobalType(globalName) {
    let typeSignature = GLOBAL_TYPES[globalName];
    if (typeSignature === undefined) {
        throw 'invalid global name: ' + globalName;
    }

    if (!typeSignature.mutable) {
        return typeSignature.type;
    }

    return new WasmNode([
        'mut',
        typeSignature.type,
    ]);
}

export {
    buildGlobalType,
}
