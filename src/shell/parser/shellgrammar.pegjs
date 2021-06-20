//==============
// Core grammar
//==============

root
    = _ cmd:command _ { return [ cmd ]; }
    / _ cmd:command commandSeparator tail:root _ { return tail.concat([ cmd ]); }

command
    = assignmentCommand
    / ifClause
    / whileClause
    / baseCommand

ifClause
    = "if" _ "(" cnd:condition ")" _ "{" _ cmds:root _ "}" _ elifBlocks:elifClause* _ elseBlock:elseClause?
        {
            let result = {
                type: 'if',
                condition: cnd,
                body: cmds,
                elseBlock: [],
            };
            
            let curIf = result;
            for (var i = 0; i < elifBlocks.length; i++) {
                curIf.elseBlock = [ elifBlocks[i] ];
                curIf = elifBlocks[i];
            }

            if (!!elseBlock)
                curIf.elseBlock = elseBlock;

            return result;
        }

elifClause
    = "else if" _ "(" cnd:condition ")" _ "{" _ cmds:root _ "}"
        {
            return {
                type: 'if',
                condition: cnd,
                body: cmds,
                elseBlock: [],
            };
        }

elseClause
    = "else" _ "{" _ cmds:root _ "}"
        {
            return cmds;
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
                operator: 'u!',
                operands: [{
                    type: 'op',
                    operator: 'u!',
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
    = arithStatement
    / head:osIdentifier tail:(__ subCommand)*
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
    / value

subCommand
    = value
    / "{" _ inner:baseCommand _ "}" { return inner; }

arithStatement = equalityStmt

equalityStmt
    = head:addStmt tail:(_ ("=="/"!=") _ addStmt)*
        {
            return tail.reduce((curTree, element) => {
                let op = element[1];
                let subTree = element[3];
                return {
                    type: 'op',
                    operator: op,
                    operands: [
                        curTree,
                        subTree,
                    ],
                };
            }, head);
        }

addStmt
    = head:multiplyStmt tail:(_ ("+"/"-") _ multiplyStmt)*
        {
            return tail.reduce((curTree, element) => {
                let op = element[1];
                let subTree = element[3];
                return {
                    type: 'op',
                    operator: op,
                    operands: [
                        curTree,
                        subTree,
                    ],
                };
            }, head);
        }

multiplyStmt
    = head:unaryOp tail:(_ ("*"/"/") _ unaryOp)*
        {
            return tail.reduce((curTree, element) => {
                let op = element[1];
                let subTree = element[3];
                return {
                    type: 'op',
                    operator: op,
                    operands: [
                        curTree,
                        subTree,
                    ],
                };
            }, head);
        }

unaryOp
    = ops:(("!"/"-") _)* val:arithValue
        {
            return ops.reduce((curTree, element) => {
                let op = element[0]
                return {
                    type: 'op',
                    operator: 'u'+op,
                    operands: [ curTree ],
                };
            }, val);
        }

arithValue
    = "(" _ stmt:arithStatement _ ")" { return stmt; }
    / numberValue
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
    / name:varName
        {
            return {
                type: 'access',
                variable: name,
            };
        }

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
    / str:osIdentifier {
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
