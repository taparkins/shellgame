import { WasmNode } from '../wasmnode'
import { convertSyscall } from './syscall'
import { TYPE_MAPPINGS } from './types'

const NODE_TYPES = {
    BOOLEAN: 'bool',
    COMMAND: 'command',
    IF: 'if',
    GLOBAL_GET: 'global_get',
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

function convertNode(ast, context) {
    switch (ast.type) {
        case NODE_TYPES.BOOLEAN:
            return _convertBool(ast, context);
        case NODE_TYPES.COMMAND:
            return _convertCommand(ast, context);
        case NODE_TYPES.IF:
            return _convertIf(ast, context);
        case NODE_TYPES.GLOBAL_GET:
            return _convertGlobalGet(ast, context);
        case NODE_TYPES.NUMBER:
            return _convertNumber(ast, context);
        case NODE_TYPES.OPERATOR:
            return _convertOperator(ast, context);
        case NODE_TYPES.STRING:
            return _convertString(ast, context);
        case NODE_TYPES.VAR_ACCESS:
            return _convertVarAccess(ast, context);
        case NODE_TYPES.VAR_ASSIGN:
            return _convertVarAssign(ast, context);
        case NODE_TYPES.WHILE:
            return _convertWhile(ast, context);
        default:
            throw 'Invalid ast node type: ' + ast.type;
    }
}

function _convertBool(ast, context) {
    context.topLevelReturnType = 'i32';
    return new WasmNode([
        new WasmNode('i32.const'),
        new WasmNode(ast.value ? '1' : '0'),
    ], 'bool');
}

function _convertCommand(ast, context) {
    throw 'UNIMPLEMENTED EXCEPTION';
}

function _convertIf(ast, context) {
    let cndNode = convertNode(ast.condition, context);

    let bodyNode = new WasmNode([
        'then',
    ]);
    let bodyReturnType = null;
    for (var i = 0; i < ast.body.length; i++) {
        let curLine = ast.body[i];
        let curLineNode = convertNode(curLine, context);
        bodyNode.children.push(curLineNode);
        bodyReturnType = curLineNode.returnType;
    }

    let ifSignatureType = new WasmNode(['void']);
    if (bodyReturnType !== null) {
        ifSignatureType = new WasmNode([
            'result',
            TYPE_MAPPINGS[bodyReturnType],
        ]);
    }

    let elseNode = new WasmNode(['end']);
    if (!Array.isArray(ast.elseBlock)) {
        elseNode = convertNode(ast.elseBlock, context);
    } else if (ast.elseBlock.length > 0) {
        elseNode = new WasmNode([
            'else',
        ]);
        for (var i = 0; i < ast.elseBlock.length; i++) {
            let curLine = ast.elseBlock[i];
            let curLineNode = convertNode(curLine, context);
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

function _convertGlobalGet(ast, context) {
    context.addGlobalDependency(ast.name);
    return new WasmNode(['global.get', '$' + ast.name]);
}

function _convertNumber(ast, context) {
    context.topLevelReturnType = 'i32';
    return new WasmNode([
        new WasmNode('i32.const'),
        new WasmNode(ast.value.toString()),
    ], 'i32');
}

function _convertOperator(ast, context) {
    context.topLevelReturnType = 'i32';
    switch (ast.operator) {
        case OPERATORS.ADD:
            return new WasmNode([
                new WasmNode('i32.add'),
                convertNode(ast.operands[0], context),
                convertNode(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.DIVIDE:
            return new WasmNode([
                new WasmNode('i32.div_s'),
                convertNode(ast.operands[0], context),
                convertNode(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.EQUAL:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                new WasmNode([
                    new WasmNode('i32.sub'),
                    convertNode(ast.operands[0], context),
                    convertNode(ast.operands[1], context),
                ], 'i32'),
            ], 'i32');

        case OPERATORS.MULTIPLY:
            return new WasmNode([
                new WasmNode('i32.mul'),
                convertNode(ast.operands[0], context),
                convertNode(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.NOT_EQUAL:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                new WasmNode([
                    new WasmNode('i32.eqz'),
                    new WasmNode([
                        new WasmNode('i32.sub'),
                        convertNode(ast.operands[0], context),
                        convertNode(ast.operands[1], context),
                    ], 'i32'),
                ], 'i32'),
            ], 'i32');

        case OPERATORS.SUBTRACT:
            return new WasmNode([
                new WasmNode('i32.sub'),
                convertNode(ast.operands[0], context),
                convertNode(ast.operands[1], context),
            ], 'i32');

        case OPERATORS.UNARY_NOT:
            return new WasmNode([
                new WasmNode('i32.eqz'),
                convertNode(ast.operands[0], context),
            ], 'i32');

        case OPERATORS.UNARY_NEGATE:
            return new WasmNode([
                new WasmNode('i32.mul'),
                new WasmNode([
                    new WasmNode('i32.const'),
                    new WasmNode('-1'),
                ], 'i32'),
                convertNode(ast.operands[0], context),
            ], 'i32');
    }
}

function _convertString(ast, context) {
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

function _convertVarAccess(ast, context) {
    // TODO: how do I handle strings as values???
    let encoder = new TextEncoder();
    let dataSegment = new Uint8Array([
        ...encoder.encode(ast.variable),
        0, // null terminate the string
    ]);
    let varNamePtr = context.addDataItem(dataSegment);
    return convertSyscall('getenv', [
        { type: NODE_TYPES.GLOBAL_GET, name: 'pid' },
        { type: NODE_TYPES.NUMBER, value: varNamePtr },
    ], context);
}

function _convertVarAssign(ast, context) {
    let encoder = new TextEncoder();
    let dataSegment = new Uint8Array([
        ...encoder.encode(ast.variable),
        0, // null terminate the string
    ]);
    let varNamePtr = context.addDataItem(dataSegment);
    return convertSyscall('setenv', [
        { type: NODE_TYPES.GLOBAL_GET, name: 'pid' },
        { type: NODE_TYPES.NUMBER, value: varNamePtr },
        ast.value,
    ], context);
}

function _convertWhile(ast, context) {
    let loopId = context.allocBranchIdentifier();

    let resultNode = new WasmNode([
        'loop',
        '$l' + loopId.toString(),
    ]);

    let bodyNodes = [];
    for (var i = 0; i < ast.body.length; i++) {
        let curLine = ast.body[i];
        let curLineNode = convertNode(curLine, context);

        resultNode.returnType = curLineNode.returnType;
        bodyNodes.push(curLineNode);
    }

    if (resultNode.returnType !== undefined) {
        resultNode.children.push(new WasmNode([
            'result',
            TYPE_MAPPINGS[resultNode.returnType],
        ]));
    }

    resultNode.children = resultNode.children.concat(bodyNodes);

    let cndNode = convertNode(ast.condition, context);
    resultNode.children.push(new WasmNode([
        'br_if',
        '$l' + loopId.toString(),
        cndNode,
    ]));

    context.deallocBranchIdentifier();

    return resultNode;
}

export {
    convertNode,
}
