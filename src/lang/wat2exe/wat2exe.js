import { Executable } from '../../os/processes/executable';

let WabtModule = null;
require('wabt')().then((wabt) => WabtModule = wabt);

function wat2exe(wat, context) {
    // This is a bit of a hack to work around the wabt module being loaded asyncronously
    // Ultimately, I'm hoping to strip down wabt and have something much lighter weight,
    // so perhaps during that process I can get rid of the async loading as well.
    while(WabtModule == null);

    let wasmModule = WabtModule.parseWat('na.wat', wat.toString());
    let byteCode = wasmModule.toBinary({}).buffer;
    return new Executable(byteCode, context.dataRegion);
}

export {
    wat2exe,
}
