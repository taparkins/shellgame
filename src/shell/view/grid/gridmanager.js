import { TableManager } from './tablemanager'
import { POSITION_TYPE } from '../../model/buffer'

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
    for (var x = 0; x < gridBuffer.viewport.width; x++) {
        for (var y = 0; y < gridBuffer.viewport.height; y++) {
            let queryPos = { type: POSITION_TYPE.VIEWPORT, x, y };
            let data = gridBuffer.getDataAt(queryPos);
            // TODO: handle meta
            tableManager.setCellValue(x, y, data.charValue);
        }
    }
}

function _setupListeners(gridBuffer, tableManager) {
    // TODO: setup a way to clean these up?
    gridBuffer.addListener('onShiftViewport',
        (gridBuffer, args) => {
            for (var x = 0; x < gridBuffer.viewport.width; x++) {
                for (var y = 0; y < gridBuffer.viewport.height; y++) {
                    let queryPos = { type: POSITION_TYPE.VIEWPORT, x, y };
                    let data = gridBuffer.getDataAt(queryPos);
                    // TODO: handle meta bytes

                    tableManager.setCellValue(x, y, data.charValue);
                }
            }
        },
    );

    gridBuffer.addListener('onSetValue',
        (gridBuffer, args) => {
            if (!args.insideViewport) {
                return;
            }

            // TODO: handle meta byte
            tableManager.setCellValue(
                args.viewportPosition.x,
                args.viewportPosition.y,
                args.charData,
            );
        },
    );
}
