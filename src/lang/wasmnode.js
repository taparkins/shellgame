export class WasmNode {
    constructor(initValue, returnType) {
        this.value = null;
        this.children = [];
        this.returnType = returnType;

        if (Array.isArray(initValue)) {
            this.children = initValue;
        } else if (initValue !== undefined) {
            this.value = initValue;
        }
    }

    toString() {
        if (this.value !== null) {
            return this.value.toString();
        }

        let childStrs = this.children.map((child) => child.toString());
        return '(' + childStrs.join(' ') + ')';
    }
}

