//==============
// Core grammar
//==============

root
    = _ cmd:command _ { return [ cmd ]; }
    / _ cmd:command commandSeparator tail:root _ { return tail.concat([ cmd ]); }

command
    = assignmentCommand
    / baseCommand
    / ifClause
    / whileClause

ifClause
    = "if" _ "(" cnd:condition ")" _ "{" _ cmds:root _ "}" _ elifBlocks:elifClause* _ elseBlock:elseClause?
        {
            let result = {
                type: 'if',
                branches: [
                    {
                        condition: cnd,
                        body: cmds,
                    }
                ],
            };
            
            for (var i = 0; i < elifBlocks.length; i++) {
                result.branches.push(elifs[i]);
            }

            if (!!elseBlock)
                result.branches.push(elseBlock);

            return result;
        }

elifClause
    = "else if" _ "(" cnd:condition ")" _ "{" _ cmds:root _ "}"
        {
            return {
                condition: cnd,
                body: cmds,
            };
        }

elseClause
    = "else" _ "{" _ cmds:root _ "}"
        {
            return {
                condition: 'true',
                body: cmds,
            };
        }

whileClause
    = "while" _ "(" _ cnd:condition _ ")" _ "{" cmds: root _ "}"
        {
            return {
                type: 'while',
                condition: cnd,
                body: cmds,
            };
        }

condition
    = c:subCommand
        {
            return {
                type: 'op',
                operator: '!',
                operands: [{
                    type: 'op',
                    operator: '!',
                    operands: [ c ],
                }],
            };
        }

assignmentCommand
    = "$" name:varName _ "=" _ cmd:baseCommand
        {
            return {
                type: 'assign',
                variable: name,
                value: cmd,
            };
        }

baseCommand
    = head:osIdentifier tail:(__ subCommand)*
        {
            let cleanedTail = [];
            for (let i = 0; i < tail.length; i++) {
                cleanedTail.push(tail[i][1]);
            }

            return {
                type: 'command',
                execution: head.join(''),
                tokens: cleanedTail,
            };
        }
    / simpleCommand

subCommand
    = simpleCommand
    / "{" _ inner:baseCommand _ "}"
        {
            return inner;
        }

simpleCommand
    = value
    / name:varName
        {
            return {
                type: 'access',
                variable: name,
            };
        }

value
    = numberValue
    / boolValue
    / stringValue

numberValue
    = [0-9]+ {
        return {
            type: 'number',
            value: parseInt(text(), 10),
        };
    }

boolValue
    = "true" {
        return {
            type: 'bool',
            value: true,
        };
    }
    / "false" {
        return {
            type: 'bool',
            value: false,
        };
    }


// TODO: handle escape sequences
stringValue
    = '"' str:([^ \t\r\n\f']*) '"' {
        return {
            type: 'string',
            value: str.join(''),
        };
    }
    / "'" str:([^ \t\r\n\f"]*) "'" {
        return {
            type: 'string',
            value: str.join(''),
        };
    }
    / str:([^ \t\r\n\f'"]+) {
        return {
            type: 'string',
            value: str.join(''),
        };
    }

//========================
// Simple helper patterns
//========================

varName = "$" [a-zA-Z0-9_]+

osIdentifier = [./-_a-zA-Z0-9]+

commandSeparator
    = _ ";" _
    / "/r"? "/n"

ws = [ \t\r\n\f]
_  = ws*
__ = ws+
