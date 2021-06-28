const PRINTABLE_CHARS = {
    ' ': 0x20,  '0': 0x30,  '@': 0x40,  'P':  0x50,  '`': 0x60,  'p': 0x70,
    '!': 0x21,  '1': 0x31,  'A': 0x41,  'Q':  0x51,  'a': 0x61,  'q': 0x71,
    '"': 0x22,  '2': 0x32,  'B': 0x42,  'R':  0x52,  'b': 0x62,  'r': 0x72,
    '#': 0x23,  '3': 0x33,  'C': 0x43,  'S':  0x53,  'c': 0x63,  's': 0x73,
    '$': 0x24,  '4': 0x34,  'D': 0x44,  'T':  0x54,  'd': 0x64,  't': 0x74,
    '%': 0x25,  '5': 0x35,  'E': 0x45,  'U':  0x55,  'e': 0x65,  'u': 0x75,
    '&': 0x26,  '6': 0x36,  'F': 0x46,  'V':  0x56,  'f': 0x66,  'v': 0x76,
    "'": 0x27,  '7': 0x37,  'G': 0x47,  'W':  0x57,  'g': 0x67,  'w': 0x77,
    '(': 0x28,  '8': 0x38,  'H': 0x48,  'X':  0x58,  'h': 0x68,  'x': 0x78,
    ')': 0x29,  '9': 0x39,  'I': 0x49,  'Y':  0x59,  'i': 0x69,  'y': 0x79,
    '*': 0x2a,  ':': 0x3a,  'J': 0x4a,  'Z':  0x5a,  'j': 0x6a,  'z': 0x7a,
    '+': 0x2b,  ';': 0x3b,  'K': 0x4b,  '[':  0x5b,  'k': 0x6b,  '{': 0x7b,
    ',': 0x2c,  '<': 0x3c,  'L': 0x4c,  '\\': 0x5c,  'l': 0x6c,  '|': 0x7c,
    '-': 0x2d,  '=': 0x3d,  'M': 0x4d,  ']':  0x5d,  'm': 0x6d,  '}': 0x7d,
    '.': 0x2e,  '>': 0x3e,  'N': 0x4e,  '^':  0x5e,  'n': 0x6e,  '~': 0x7e,
    '/': 0x2f,  '?': 0x3f,  'O': 0x4f,  '_':  0x5f,  'o': 0x6f,
}

const CONTROL_CODES = {
    ALT:       'ALT',
    CTRL:      'CTRL',
    SHIFT:     'SHIFT',
    ARROW_D:   'ARROW_D',
    ARROW_U:   'ARROW_U',
    ARROW_L:   'ARROW_L',
    ARROW_R:   'ARROW_R',
    END:       'END',
    HOME:      'HOME',
    PAGE_D:    'PAGE_D',
    PAGE_U:    'PAGE_U',
    ENTER:     'ENTER',
    TAB:       'TAB',
    BACKSPACE: 'BACKSPACE',
    DELETE:    'DELETE',
    INSERT:    'INSERT',
}

const CONTROL_CODE_LOOKUP = {
    'Alt':        CONTROL_CODES.ALT,
    'Control':    CONTROL_CODES.CTRL,
    'Shift':      CONTROL_CODES.SHIFT,
    'Enter':      CONTROL_CODES.ENTER,
    'Tab':        CONTROL_CODES.TAB,
    'ArrowDown':  CONTROL_CODES.ARROW_D,
    'ArrowUp':    CONTROL_CODES.ARROW_U,
    'ArrowLeft':  CONTROL_CODES.ARROW_L,
    'ArrowRight': CONTROL_CODES.ARROW_R,
    'End':        CONTROL_CODES.END,
    'Home':       CONTROL_CODES.HOME,
    'PageDown':   CONTROL_CODES.PAGE_D,
    'PageUp':     CONTROL_CODES.PAGE_U,
    'Backspace':  CONTROL_CODES.BACKSPACE,
    'Delete':     CONTROL_CODES.DELETE,
    'Insert':     CONTROL_CODES.INSERT,
}

function convertKeyValue(value) {
    let type = 'printable';
    let byteValue = PRINTABLE_CHARS[value];
    if (byteValue !== undefined) {
        return { type, byteValue };
    }

    type = 'control';
    let controlType = CONTROL_CODE_LOOKUP[value];
    if (controlType !== undefined) {
        return { type, controlType };
    }

    return undefined;
}

export {
    convertKeyValue,
    PRINTABLE_CHARS,
    CONTROL_CODES,
}
