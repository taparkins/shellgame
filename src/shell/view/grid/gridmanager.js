import { TableManager } from './tablemanager';

export class GridViewManager {
    constructor(lowerBuffer, upperBuffer, lowerTableId, upperTableId) {
        _assertValidBuffers(lowerBuffer, upperBuffer);

        this.lowerBuffer = lowerBuffer;
        this.upperBuffer = upperBuffer;

        this.lowerTableManager = new TableManager(
            lowerTableId,
            lowerBuffer.viewport.width,
            lowerBuffer.viewport.height,
        );
        this.upperTableManager = new TableManager(
            upperTableId,
            upperBuffer.viewport.width,
            upperBuffer.viewport.height,
        );

        _setupListeners(this.lowerBuffer, this.lowerTableManager);
        _setupListeners(this.upperBuffer, this.upperTableManager);
    }
}

function _assertValidBuffers(lowerBuffer, upperBuffer) {
    let diffWidth  = lowerBuffer.viewport.width  != upperBuffer.viewport.width;
    let diffHeight = lowerBuffer.viewport.height != upperBuffer.viewport.height;
    if (diffWidth || diffHeight) {
        throw "GridBuffers for lower and upper layers must have the same size Viewport.\n" +
            "\tLower dimenisons were: (" + lowerBuffer.viewport.width + ", " + lowerBuffer.viewport.height + ")\n" +
            "\tUpper dimensions were: (" + upperBuffer.viewport.width + ", " + upperBuffer.viewport.height + ")";
    }
}

function _setupListeners(gridBuffer, tableManager) {
    // TODO: setup a way to clean these up?
    gridBuffer.addListener('onShiftViewport',
        (gridBuffer, args) => {
            let lowX = gridBuffer.viewport.x;
            let highX = gridBuffer.viewport.x + gridBuffer.viewport.width;
            let lowY = gridBuffer.viewport.y;
            let highY = gridBuffer.viewport.height;

            for (var x = lowX; x < highX; x++) {
                for (var y = lowY; y < highY; y++) {
                    // TODO: handle meta bytes
                    tableManager.setCellValue(x, y, gridBuffer.getCharAt(x, y));
                }
            }
        },
    );

    gridBuffer.addListener('onSetValue',
        (gridBuffer, args) => {
            // TODO: handle meta byte
            tableManager.setCellValue(args.x, args.y, args.charData);
        },
    );
}
