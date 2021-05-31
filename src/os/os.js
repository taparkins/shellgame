import { TTY } from './tty/tty';

export class OS {
    constructor() {
        this.tty = new TTY();
        this.tty.addChannel(0, 'stdout');
        this.tty.addChannel(1, 'stderr');
    }

    print(channelId, msg) {
        let channel = this.tty.getChannelById(channelId);
        channel.write(msg);
    }

    read(channelId, count) {
        let channel = this.tty.getChannelById(channelId);

        if (count == null)
            return channel.readAll();
        return channel.read(count);
    }
}
