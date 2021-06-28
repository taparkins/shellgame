import { convertByte } from './convertbyte';

const TABLE_CLASS = 'bufTable';
const ROW_CLASS   = 'bufRow';
const CELL_CLASS  = 'bufCell';

export class TableManager {
    constructor(tableId, width, height) {
        this.table = document.getElementById(tableId);
        if (!this.table) {
            throw "Invalid table id provided: " + tableId;
        }

        if (width <= 0 || height <= 0) {
            throw 'Table dimensions must be positive. Received: (' + width + ', ' + height + ')';
        }

        _initTable(this.table, width, height);
    }

    setCellValue(x, y, byteValue) {
        //TODO: metadata

        let cellId = _getCellId(this.table, x, y);
        let cell = document.getElementById(cellId);
        if (!cell) {
            throw 'Unable to find cell at index (' + x + ', ' + y + ')';
        }

        cell.innerHTML = convertByte(byteValue);
    }
}

function _initTable(table, width, height) {
    table.classList.add(TABLE_CLASS);

    for (var y = 0; y < height; y++) {
        let newRow = document.createElement('tr');
        newRow.id = _getRowId(table, y);
        newRow.classList.add(ROW_CLASS);

        for (var x = 0; x < width; x++) {
            let newCell = document.createElement('td');
            newCell.innerHTML = convertByte(0);
            newCell.id = _getCellId(table, x, y);
            newCell.classList.add(CELL_CLASS);
            newRow.appendChild(newCell);
        }

        table.appendChild(newRow);
    }
}

function _getRowId(table, y) {
    return table.id + '__tr' + y;
}

function _getCellId(table, x, y) {
    return table.id + '__td' + x + '_' + y;
}
