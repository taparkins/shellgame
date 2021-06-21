import { syscall2wat } from './syscall'
import { WasmNode } from './wasmnode'

const NODE_TYPES = {
    BOOLEAN: 'bool',
    COMMAND: 'command',
    IF: 'if',
    NUMBER: 'number',
    OPERATOR: 'op',
    STRING: 'string',
    VAR_ACCESS: 'access',
    VAR_ASSIGN: 'assign',
    WHILE: 'while',
}

const OPERATORS = {
    ADD:          '+',
    DIVIDE:       '/',
    EQUAL:        '==',
    MULTIPLY:     '*',
    NOT_EQUAL:    '!=',
    SUBTRACT:     '-',
    UNARY_NOT:    'u!',
    UNARY_NEGATE: 'u-'
}

function ast2wat(ast, context) {
    switch (ast.type) {
        case NODE_TYPES.BOOLEAN:
            return _bool2wat(ast, context);
        case NODE_TYPES.COMMAND:
            return _command2wat(ast, context);
        case NODE_TYPES.IF:
            return _if2wat(ast, context);
        case NODE_TYPES.NUMBER:
            return _number2wat(ast, context);
        case NODE_TYPES.OPERATOR:
            return _operator2wat(ast, context);
        case NODE_TYPES.STRING:
            return _string2wat(ast, context);
        case NODE_TYPES.VAR_ACCESS:
            return _access2wat(ast, context);
        case NODE_TYPES.VAR_ASSIGN:
            return _assign2wat(ast, context);
        case NODE_TYPES.WHILE:
            return _while2wat(ast, context);
        default:
            throw 'Invalid ast node type: ' + ast.type;
    }
}

function _bool2wat(ast, context) {
    context.topLevelReturnType = 'i32';
    return new WasmNode([
        new WasmNode('i32.const'),
        new WasmNode(ast.value ? '1' : '0'),
    ], 'i32');
}

function _command2wat(ast, context) {
    throw 'UNIMPLEMENTED EXCEPTION';
}

function _if2wat(ast, context) {
    let cndNode = ast2wat(ast.condition, context);

    let bodyNode = new WasmNode([
        'then',
    ]);
    let bodyReturnType = null;
    for (var i = 0; i < ast.body.length; i++) {
        let curLine = ast.body[i];
        let curLineNode = ast2wat(curLine, context);
        bodyNode.children.push(curLineNode);
        bodyReturnType = curLineNode.returnType;
    }

    let ifSignatureType = new WasmNode(['void']);
    if (bodyReturnType !== null) {
        ifSignatureType = new WasmNode([
            'result',
            bodyReturnType,
        ]);
    }

    let elseNode = new WasmNode(['end']);
    if (!Array.isArray(ast.elseBlock)) {
        elseNode = ast2wat(ast.elseBlock, context);
    } else if (ast.elseBlock.length > 0) {
        elseNode = new WasmNode([
            'else',
        ]);
        for (var i = 0; i < ast.elseBlock.length; i++) {
            let curLine = ast.elseBlock[i];
            let curLineNode = ast2wat(curLine, context);
            elseNode.children.push(curLineNode);
        }
    } else if (bodyReturnType !== null) {
        elseNode = new WasmNode([
            'else',
            new WasmNode(['i32.const', '0']),
        ]);
    }

    return new WasmNode([
        'if',
        ifSignatureType,
        cndNode,
        bodyNode,
        elseNode,
    ], bodyReturnType);
}

function _number2wat(ast, context) {
    context.topLevelReturnType = 'i32';
    return new WasmNode([
        new WasmNode('i32.const'),
        new WasmNode(ast.value.toString()),
    ], 'i32');
}

function _operator2wat(ast, context) {
    context.topLevelReturnType = 'i32';
    switch (ast.operator) {
        case OPERATORS.ADD:
            return new WasmNode([
                new WasmNode('i32.add'),
                ast2wat(ast.operands[0], context),
                ast2wat(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.DIVIDE:
            return new WasmNode([
                new WasmNode('i32.div_s'),
                ast2wat(ast.operands[0], context),
                ast2wat(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.EQUAL:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                new WasmNode([
                    new WasmNode('i32.sub'),
                    ast2wat(ast.operands[0], context),
                    ast2wat(ast.operands[1], context),
                ], 'i32'),
            ], 'i32');

        case OPERATORS.MULTIPLY:
            return new WasmNode([
                new WasmNode('i32.mul'),
                ast2wat(ast.operands[0], context),
                ast2wat(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.NOT_EQUAL:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                new WasmNode([
                    new WasmNode('i32.eqz'),
                    new WasmNode([
                        new WasmNode('i32.sub'),
                        ast2wat(ast.operands[0], context),
                        ast2wat(ast.operands[1], context),
                    ], 'i32'),
                ], 'i32'),
            ], 'i32');

        case OPERATORS.SUBTRACT:
            return new WasmNode([
                new WasmNode('i32.sub'),
                ast2wat(ast.operands[0], context),
                ast2wat(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.UNARY_NOT:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                ast2wat(ast.operands[0], context),
            ], 'i32');

        case OPERATORS.UNARY_NEGATE:
            return new WasmNode([
                new WasmNode('i32.mul'),
                new WasmNode([
                    new WasmNode('i32.const'),
                    new WasmNode('-1'),
                ], 'i32'),
                ast2wat(ast.operands[0], context),
            ], 'i32');
    }
}

function _string2wat(ast, context) {
    // TODO: how do I handle strings as values???
    let encoder = new TextEncoder();
    let dataSegment = new Uint8Array([
        ...encoder.encode(ast.value),
        0, // null terminate the string
    ]);
    let strPtr = context.addDataItem(dataSegment);
    return new WasmNode([
        new WasmNode('i32.const'),
        new WasmNode(strPtr.toString()),
    ], '*u8');
}

function _access2wat(ast, context) {
    // TODO: how do I handle strings as values???
    let encoder = new TextEncoder();
    let dataSegment = new Uint8Array([
        ...encoder.encode(ast.variable),
        0, // null terminate the string
    ]);
    let varNamePtr = context.addDataItem(dataSegment);
    return syscall2wat('getenv', [
        { type: 'number', value: varNamePtr },
    ], context);
}

function _assign2wat(ast, context) {
    let encoder = new TextEncoder();
    let dataSegment = new Uint8Array([
        ...encoder.encode(ast.variable),
        0, // null terminate the string
    ]);
    let varNamePtr = context.addDataItem(dataSegment);
    return syscall2wat('setenv', [
        { type: 'number', value: varNamePtr },
        ast.value,
    ], context);
}

function _while2wat(ast, context) {
    let loopId = context.allocBranchIdentifier();

    let resultNode = new WasmNode([
        'loop',
        '$l' + loopId.toString(),
    ]);

    let bodyNodes = [];
    for (var i = 0; i < ast.body.length; i++) {
        let curLine = ast.body[i];
        let curLineNode = ast2wat(curLine, context);

        resultNode.returnType = curLineNode.returnType;
        bodyNodes.push(curLineNode);
    }

    if (resultNode.returnType !== undefined) {
        resultNode.children.push(new WasmNode([
            'result',
            resultNode.returnType,
        ]));
    }

    resultNode.children = resultNode.children.concat(bodyNodes);

    let cndNode = ast2wat(ast.condition, context);
    resultNode.children.push(new WasmNode([
        'br_if',
        '$l' + loopId.toString(),
        cndNode,
    ]));

    context.deallocBranchIdentifier();

    return resultNode;
}

export {
    ast2wat,
}
