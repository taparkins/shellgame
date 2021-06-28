import { TableManager } from './tablemanager';

export class GridViewManager {
    constructor(shellState, lowerTableId, upperTableId) {
        this.shellState = shellState;

        let lowerViewport = this.shellState.lowerBuffer.viewport;
        this.lowerTableManager = new TableManager(
            lowerTableId,
            lowerViewport.width,
            lowerViewport.height,
        );
        _initViewport(this.shellState.lowerBuffer, this.lowerTableManager);

        let upperViewport = this.shellState.upperBuffer.viewport;
        this.upperTableManager = new TableManager(
            upperTableId,
            upperViewport.width,
            upperViewport.height,
        );
        _initViewport(this.shellState.upperBuffer, this.upperTableManager);

        _setupListeners(this.shellState.lowerBuffer, this.lowerTableManager);
        _setupListeners(this.shellState.upperBuffer, this.upperTableManager);
    }
}

function _initViewport(gridBuffer, tableManager) {
    let startX = gridBuffer.viewport.x;
    let endX = gridBuffer.viewport.x + gridBuffer.viewport.width;
    let startY = gridBuffer.viewport.y;
    let endY = gridBuffer.viewport.y + gridBuffer.viewport.height;

    for (var x = startX; x < endX; x++) {
        for (var y = startY; y < endY; y++) {
            tableManager.setCellValue(x, y, gridBuffer.getCharAt(x, y));
        }
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
