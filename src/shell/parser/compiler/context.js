export class CompilationContext {
    constructor() {
        this.imports = new Set();
        this.dataRegion = new Uint8Array([ 0, 0, 0, 0, ]); // hardcode 4x 0 bytes to account for null-pointer
        this.dataSegmentPtrs = {};
    }

    addDataItem(identifier, dataSegment) {
        if (this.dataSegmentPtrs[identifier] !== undefined) {
            return this.dataSegmentPtrs[identifier];
        }

        let newPtr = this.dataRegion.length;
        this.dataSegmentPtrs[identifier] = newPtr;
        this.dataRegion = new Uint8Array([ ...this.dataRegion, ...this.dataSegment ]);
        return newPtr;
    }
}
