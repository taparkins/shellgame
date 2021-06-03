export class WasmNode {
    constructor(initValue) {
        this.value = null;
        this.children = [];

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

        let childStrs = children.map((child) => child.toString());
        return '(' + childStrs.join(' ') + ')';
    }
}

