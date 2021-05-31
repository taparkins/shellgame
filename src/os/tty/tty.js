import { Channel } from './channel';

export class TTY {
    constructor() {
        this.channels = {};
    }

    addChannel(id, name) {
        if (!!this.channels[id])
            throw 'Attempt to create duplicate channel: ' + id;
        this.channels[id] = new Channel(id, name);
    }

    getChannelById(id) {
        if (!this.channels[id])
            throw 'Attempt to load non-existent channel: ' + id;
        return this.channels[id];
    }
}
