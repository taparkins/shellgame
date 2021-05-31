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
    / whereClause

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

whereClause
    = "where" _ "(" _ cnd:condition _ ")" _ "{" cmds: root _ "}"
        {
            return {
                type: 'while',
                condition: cnd,
                body: cmds,
            };
        }

condition
    = v:value
        {
            return {
                type: 'op',
                operator: '!',
                operands: [{
                    type: 'op',
                    operator: '!',
                    operands: [ v ],
                }],
            };
        }
    / b:baseCommand
        {
            return {
                type: 'op',
                operator '!',
                operands: [{
                    type: 'op',
                    operator: '!',
                    operands: [ b ],
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
    = value
    / head:osIdentifier _ tail:(osIdentifier _)*
        {
            return {
                type: 'command',
                tokens: [ head ].concat(tail),
            };
        }

value
    = numberValue
    / boolValue
    / stringValue

numberValue
    = [0-9]+ { return parseInt(text(), 10); }

boolValue
    = "true" { return true; }
    / "false" { return false; }

// TODO: handle escape sequences
stringValue
    = '"' str:([^"]*) '"' { return str; }
    / "'" str:([^']*) "'" { return str; }

//========================
// Simple helper patterns
//========================

varName = [a-zA-Z0-9_]+

osIdentifier = [.-_a-zA-Z0-9]+

commandSeparator
    = _ ";" _
    / "/r"? "/n"

_ = [ \t\r\n\f]*
