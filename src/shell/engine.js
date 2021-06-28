import { compile } from '../lang/compiler'
import { GridBuffer } from './model/buffer'
import { GridViewManager } from './view/grid/gridmanager'

const INIT_BUFFER_WIDTH = 80;
const INIT_BUFFER_HEIGHT = 30;
const INIT_VIEWPORT_X = 0;
const INIT_VIEWPORT_Y = 0;
const INIT_VIEWPORT_WIDTH = INIT_BUFFER_WIDTH;
const INIT_VIEWPORT_HEIGHT = INIT_BUFFER_HEIGHT;

export class ShellEngine {
    constructor(os, viewArgs) {
        this.os = os;
        this.stdoutRid = this.os.registerReader(0, this.readerCallback.bind(this));
        this.stderrRid = this.os.registerReader(1, this.readerCallback.bind(this));

        this.lowerGridBuffer = _initGridBuffer();
        this.upperGridBuffer = _initGridBuffer();
        this.view = new GridViewManager(
            this.lowerGridBuffer,
            this.upperGridBuffer,
            viewArgs.lowerTableId,
            viewArgs.upperTableId,
        );

        // TODO: setup event listeners to handle input and such
    }

    handleLine(inLine) {
        if (inLine === "") {
            this.response = "";
            return
        }

        try {
            let executable = compile(inLine);
            this.os.processManager.exec(executable, []);
        } catch (e) {
            console.log(e);
            this.os.print(1, e.message || e);
            return;
        }
    }

    readerCallback(msg) {
        this.view.addResponse(msg);
    }
}

function _initGridBuffer() {
    let gridBuffer = new GridBuffer(
        INIT_BUFFER_WIDTH,
        INIT_BUFFER_HEIGHT,
        INIT_VIEWPORT_WIDTH,
        INIT_VIEWPORT_HEIGHT,
    );
    gridBuffer.viewport.x = INIT_VIEWPORT_X;
    gridBuffer.viewport.y = INIT_VIEWPORT_Y;

    return gridBuffer;
}
