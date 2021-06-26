function convertByte(byteValue) {
    // Standard printable ASCII
    if (0x20 < byteValue && byteValue < 0x7F) {
        return String.fromCharCode(byteValue);
    }

    // Space or null-character
    if (byteValue == 0x20 || byteValue == 0x00) {
        return '&nbsp;';
    }

    // And now welcome to the jungle (:
    switch (byteValue) {
        case 0x01: return '\u263A';
        case 0x02: return '\u263B';
        case 0x03: return '\u2665';
        case 0x04: return '\u2666';
        case 0x05: return '\u2663';
        case 0x06: return '\u2660';
        case 0x07: return '\u2022';
        case 0x08: return '\u25D8';
        case 0x09: return '\u25CB';
        case 0x0A: return '\u25D9';
        case 0x0B: return '\u2642';
        case 0x0C: return '\u2640';
        case 0x0D: return '\u266A';
        case 0x0E: return '\u266B';
        case 0x0F: return '\u263C';
        case 0x10: return '\u25BA';
        case 0x11: return '\u25C4';
        case 0x12: return '\u2195';
        case 0x13: return '\u203C';
        case 0x14: return '\u00B6';
        case 0x15: return '\u00A7';
        case 0x16: return '\u25AC';
        case 0x17: return '\u21A8';
        case 0x18: return '\u2191';
        case 0x19: return '\u2193';
        case 0x1A: return '\u2192';
        case 0x1B: return '\u2190';
        case 0x1C: return '\u221F';
        case 0x1D: return '\u2194';
        case 0x1E: return '\u25B2';
        case 0x1F: return '\u25BC';
        case 0x7F: return '\u2302';
        case 0x80: return '\u00C7';
        case 0x81: return '\u00FC';
        case 0x82: return '\u00E9';
        case 0x83: return '\u00E2';
        case 0x84: return '\u00E4';
        case 0x85: return '\u00E0';
        case 0x86: return '\u00E5';
        case 0x87: return '\u00E7';
        case 0x88: return '\u00EA';
        case 0x89: return '\u00EB';
        case 0x8A: return '\u00E8';
        case 0x8B: return '\u00EF';
        case 0x8C: return '\u00EE';
        case 0x8D: return '\u00EC';
        case 0x8E: return '\u00C4';
        case 0x8F: return '\u00C5';
        case 0x90: return '\u00C9';
        case 0x91: return '\u00E6';
        case 0x92: return '\u00C6';
        case 0x93: return '\u00F4';
        case 0x94: return '\u00F6';
        case 0x95: return '\u00F2';
        case 0x96: return '\u00FB';
        case 0x97: return '\u00F9';
        case 0x98: return '\u00FF';
        case 0x99: return '\u00D6';
        case 0x9A: return '\u00DC';
        case 0x9B: return '\u00A2';
        case 0x9C: return '\u00A3';
        case 0x9D: return '\u00A5';
        case 0x9E: return '\u20A7';
        case 0x9F: return '\u0192';
        case 0xA0: return '\u00E1';
        case 0xA1: return '\u00ED';
        case 0xA2: return '\u00F3';
        case 0xA3: return '\u00FA';
        case 0xA4: return '\u00F1';
        case 0xA5: return '\u00D1';
        case 0xA6: return '\u00AA';
        case 0xA7: return '\u00BA';
        case 0xA8: return '\u00BF';
        case 0xA9: return '\u2310';
        case 0xAA: return '\u00AC';
        case 0xAB: return '\u00BD';
        case 0xAC: return '\u00BC';
        case 0xAD: return '\u00A1';
        case 0xAE: return '\u00AB';
        case 0xAF: return '\u00BB';
        case 0xB0: return '\u2591';
        case 0xB1: return '\u2592';
        case 0xB2: return '\u2593';
        case 0xB3: return '\u2502';
        case 0xB4: return '\u2524';
        case 0xB5: return '\u2561';
        case 0xB6: return '\u2562';
        case 0xB7: return '\u2556';
        case 0xB8: return '\u2555';
        case 0xB9: return '\u2563';
        case 0xBA: return '\u2551';
        case 0xBB: return '\u2557';
        case 0xBC: return '\u255D';
        case 0xBD: return '\u255C';
        case 0xBE: return '\u255B';
        case 0xBF: return '\u2510';
        case 0xC0: return '\u2514';
        case 0xC1: return '\u2534';
        case 0xC2: return '\u252C';
        case 0xC3: return '\u251C';
        case 0xC4: return '\u2500';
        case 0xC5: return '\u253C';
        case 0xC6: return '\u255E';
        case 0xC7: return '\u255F';
        case 0xC8: return '\u255A';
        case 0xC9: return '\u2554';
        case 0xCA: return '\u2569';
        case 0xCB: return '\u2566';
        case 0xCC: return '\u2560';
        case 0xCD: return '\u2550';
        case 0xCE: return '\u256C';
        case 0xCF: return '\u2567';
        case 0xD0: return '\u2568';
        case 0xD1: return '\u2564';
        case 0xD2: return '\u2565';
        case 0xD3: return '\u2559';
        case 0xD4: return '\u2558';
        case 0xD5: return '\u2552';
        case 0xD6: return '\u2553';
        case 0xD7: return '\u256B';
        case 0xD8: return '\u256A';
        case 0xD9: return '\u2518';
        case 0xDA: return '\u250C';
        case 0xDB: return '\u2588';
        case 0xDC: return '\u2584';
        case 0xDD: return '\u258C';
        case 0xDE: return '\u2590';
        case 0xDF: return '\u2580';
        case 0xE0: return '\u03B1';
        case 0xE1: return '\u00DF';
        case 0xE2: return '\u0393';
        case 0xE3: return '\u03C0';
        case 0xE4: return '\u03A3';
        case 0xE5: return '\u03C3';
        case 0xE6: return '\u00B5';
        case 0xE7: return '\u03C4';
        case 0xE8: return '\u03A6';
        case 0xE9: return '\u0398';
        case 0xEA: return '\u03A9';
        case 0xEB: return '\u03B4';
        case 0xEC: return '\u221E';
        case 0xED: return '\u03C6';
        case 0xEE: return '\u03B5';
        case 0xEF: return '\u2229';
        case 0xF0: return '\u2261';
        case 0xF1: return '\u00B1';
        case 0xF2: return '\u2265';
        case 0xF3: return '\u2264';
        case 0xF4: return '\u2320';
        case 0xF5: return '\u2321';
        case 0xF6: return '\u00F7';
        case 0xF7: return '\u2248';
        case 0xF8: return '\u00B0';
        case 0xF9: return '\u2219';
        case 0xFA: return '\u00B7';
        case 0xFB: return '\u221A';
        case 0xFC: return '\u207F';
        case 0xFD: return '\u00B2';
        case 0xFE: return '\u25A0';
        case 0xFF: return '\u00A0';
        default:
            throw 'Invalid byte value: ' + [byteValue];
    }
}

export {
    convertByte,
}
