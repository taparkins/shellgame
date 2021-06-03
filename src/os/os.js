import { TTY } from './tty/tty';
import { ProcessManager } from './processes/manager';
import { OsEnvironment } from './processes/env';

export class OS {
    constructor() {
        this.tty = new TTY();
        this.tty.addChannel(0, 'stdout');
        this.tty.addChannel(1, 'stderr');

        this.processManager = new ProcessManager(this);

        this.environment = new OsEnvironment(this);
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

    registerReader(channelId, callback) {
        let channel = this.tty.getChannelById(channelId);
        return channel.registerReader(callback);
    }

    unregisterReader(channelId, rid) {
        let channel = this.tty.getChannelById(channelId);
        channel.unregisterReader(rid);
    }
}
