export class ShellLexer {
    lexLine(shellLine) {
        let curState = lexStates.CLEAN;
        let tokens = [];
        let curWord = "";

        for (var i = 0; i < shellLine.length; i++) {
            let curChar = shellLine[i];

            switch (curState) {
                case lexStates.CLEAN:
                    if (curChar === '"') {
                        curState = lexStates.IN_STRING;
                    } else if (curChar === ' ') {
                        // do nothing
                    } else {
                        curState = lexStates.IN_WORD;
                        curWord = curChar;
                    }
                    break;
                case lexStates.IN_WORD:
                    if (curChar === '"') {
                        throw 'Invalid character (' + curChar + ') at position: ' + i + '.';
                    } else if (curChar === ' ') {
                        tokens.push({
                            type: 'WORD',
                            text: curWord,
                        });
                        curWord = "";
                        curState = lexStates.CLEAN;
                    } else {
                        curWord += curChar;
                    }
                    break;
                case lexStates.IN_STRING:
                default:
                    if (curChar === '"') {
                        tokens.push({
                            type: 'STRING',
                            text: curWord,
                        });
                        curWord = "";
                        curState = lexStates.CLEAN;
                    } else {
                        curWord += curChar;
                    }
                    break;
            }
        }

        // Fencepost to handle ending final token
        if (curState === lexStates.IN_STRING) {
            throw 'Invalid line; expected " character to end string, but found none.'
        } else if (curState === lexStates.IN_WORD) {
            tokens.push({
                type: 'WORD',
                text: curWord,
            });
        }

        return tokens;
    }
}

const lexStates = Object.freeze({
    CLEAN: 1,
    IN_WORD: 2,
    IN_STRING: 3,
});
