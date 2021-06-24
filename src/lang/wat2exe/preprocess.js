import { WasmNode } from '../wasmnode'

function preprocess(wat, context) {
    if (typeof(wat.value) === 'string' && wat.value[0] === '#') {
        return new WasmNode(context.substituteDataValue(wat.value));
    } else if (wat.value !== undefined && wat.value !== null) {
        return wat;
    }

    let resultNode = new WasmNode([]);
    for (var i = 0; i < wat.children.length; i++) {
        let child = wat.children[i];
        if (typeof(child) === 'string' && child[0] === '#') {
            resultNode.children.push(context.substituteDataValue(child));
        } else if (typeof(child) === 'object') {
            resultNode.children.push(preprocess(child, context));
        } else {
            resultNode.children.push(child);
        }
    }

    return resultNode;
}

export {
    preprocess,
}
