import { print } from './print'
import { countBytes, shiftBytesLeft } from './bytes'
import { itoa } from './itoa'

const CORELIB_FUNCS = {
    print,
    countBytes,
    shiftBytesLeft,
    itoa,
};

export {
    CORELIB_FUNCS,
}
