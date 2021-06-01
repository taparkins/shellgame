export class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.queue = "";
    }

    write(msg) {
        this.queue += msg;
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
}
