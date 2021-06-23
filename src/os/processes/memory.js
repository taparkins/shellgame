const MEM_CONFIGS = {
    initial: 1,
    maximum: 10,
};

const PAGE_SIZE = 65532;

export class ProcessMemory {
    constructor() {
        this.wasmMemory = new WebAssembly.Memory(MEM_CONFIGS);
        this.heap = [];
    }

    // Copies a set of bytes into memory, starting from the specified pointer. Also performs validation that the copy will not flow outside of an allocation boundary
    memcopy_safe(buffer, ptr) {
        let allocRegionIndex = Math.abs(_binarySearch(this.heap, ptr));
        let alloc = this.heap[allocRegionIndex];
        let maxPtr = alloc.ptr + alloc.length;
        if (maxPtr < ptr + buffer.byteLength) {
            throw 'Unsafe memcopy (' + ptr.toString(16) + ':' + buffer.byteLength + ') -- nearest region was (' + alloc.ptr.toString(16) + ':' + alloc.length + ')';
        }

        this.memcopy(buffer, ptr);
    }

    // Copies a set of bytes into memory starting from the specified pointer
    memcopy(buffer, ptr) {
        let memArray = new Uint8Array(this.wasmMemory.buffer);
        for (var i = 0; i < buffer.byteLength; i++) {
            let curPtr = ptr + i;
            memArray[curPtr] = buffer[i];
        }
    }

    alloc(byteLength) {
        // Look for freed fragment that would fit allocation
        for (var i = 0; i < this.heap.length - 1; i++) {
            let leftAlloc = this.heap[i];
            let rightAlloc = this.heap[i+1];

            let leftBoundary = leftAlloc.ptr + leftAlloc.length;
            let rightBoundary = rightAlloc.ptr;
            let freeLength = rightBoundary - leftBoundary;

            if (freeLength <= byteLength) {
                this.heap.splice(i, 0, { ptr: leftBoundary, length: byteLength });
                return leftBoundary;
            }

        }

        // If none were found, check if the current page has sufficient space, and grow if not
        let finalAlloc = { ptr: 0, length: 0 };
        if (this.heap.length > 0) {
            finalAlloc = this.heap[this.heap.length-1];
        }

        let nextPtr = finalAlloc.ptr + finalAlloc.length;
        let usedPageSpace = nextPtr % PAGE_SIZE;
        let remainingPageSpace = PAGE_SIZE - usedPageSpace;
        let requiredExpansionSpace = byteLength - remainingPageSpace;
        if (requiredExpansionSpace > 0) {
            let requiredGrowth = Math.ceil(requiredExpansionSpace / PAGE_SIZE);
            this.wasmMemory.grow(requiredGrowth);
        }

        this.heap.push({ ptr: nextPtr, length: byteLength });

        return nextPtr;
    }

    free(ptr) {
        let delIndex = _binarySearch(this.heap, ptr);
        if (delIndex < 0) {
            throw 'Invalid free -- ptr not allocated: ' + ptr;
        }

        this.heap.splice(delIndex, 1);
    }
}

function _insertAllocation(heap, alloc, index) {
    heap.splice(index, 0, alloc);
}

// Searches for the position a specified pointer should be inserted into a sorted heap
// If return value is positive, the pointer was exactly found and the value indicates the index where
// If return value is negative, the value represents the index of the highest pointer record lower than the provided pointer
function _binarySearch(heap, ptr) {
    let minIndex = 0;
    let maxIndex = heap.length - 1;

    while (minIndex < maxIndex) {
        let checkIndex = Math.floor((maxIndex - minIndex) / 2) + minIndex;
        let heapValue = heap[checkIndex];

        if (heapValue.ptr == ptr) {
            return checkIndex;
        } else if (heapValue.ptr < ptr) {
            minIndex = checkIndex + 1;
        } else { // if (heapValue.ptr > ptr)
            maxIndex = checkIndex - 1;
        }
    }

    // Fencepost check for when min- and maxIndex are equal
    if (heap[minIndex].ptr == ptr) {
        return minIndex;
    }

    return -minIndex;
}
