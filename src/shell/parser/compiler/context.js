export class CompilationContext {
    constructor() {
        this.imports = new Set();
        this.dataRegion = new Uint8Array([ 0, 0, 0, 0, ]); // hardcode 4x 0 bytes to account for null-pointer
        this.dataSegmentPtrs = {};
        this._maxBranchIdentifier = 0;
    }

    addDataItem(dataSegment) {
        if (this.dataSegmentPtrs[dataSegment] !== undefined) {
            return this.dataSegmentPtrs[dataSegment];
        }

        let newPtr = this.dataRegion.length;
        this.dataSegmentPtrs[dataSegment] = newPtr;
        this.dataRegion = new Uint8Array([ ...this.dataRegion, ...dataSegment ]);
        return newPtr;
    }

    allocBranchIdentifier() {
        return ++this._maxBranchIdentifier;
    }

    deallocBranchIdentifier() {
        --this._maxBranchIdentifier;
    }
}
