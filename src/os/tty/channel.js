export class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.queue = "";
        this.readers = {};
    }

    write(msg) {
        let wroteToReader = false;

        for (var rid in this.readers) {
            this.readers[rid](msg);
            wroteToReader = true;
        }

        if (!wroteToReader) {
            this.queue += msg;
        }
    }

    read(count) {
        let readChunk = this.queue.substring(0, count);
        this.queue = this.queue.substring(count);
        return {
            data: readChunk,
            isMore: this.queue.length > 0,
        };
    }

    readAll() {
        return this.read(this.queue.length);
    }

    registerReader(callback) {
        let curMaxRid = Math.max(...Object.keys(this.readers));
        let newRid = curMaxRid + 1;
        this.readers[newRid] = callback;
        return newRid;
    }

    unregisterReader(rid) {
        delete this.readers[rid];
    }
}
