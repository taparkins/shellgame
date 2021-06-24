import { print } from './print'
import { countBytes, shiftBytesLeft } from './bytes'
import { itoa, atoi } from './strconv'

const CORELIB_FUNCS = {
    print,
    countBytes,
    shiftBytesLeft,
    itoa,
    atoi,
};

export {
    CORELIB_FUNCS,
}
