import { TTY } from './tty/tty';
import { ProcessManager } from './processes/manager';
import { Syscaller } from './processes/syscalls';
import { OsEnvironment } from './processes/env';

export class OS {
    constructor() {
        this.tty = new TTY();
        this.tty.addChannel(0, 'stdout');
        this.tty.addChannel(1, 'stderr');

        this.syscaller = new Syscaller(this);
        this.processManager = new ProcessManager(this);

        this.environment = new OsEnvironment(this);
    }

    print(channelId, bytes) {
        let channel = this.tty.getChannelById(channelId);
        channel.write(bytes);
    }

    read(channelId, count) {
        let channel = this.tty.getChannelById(channelId);

        if (count == null)
            return channel.readAll();
        return channel.read(count);
    }

    getProcByPID(pid) {
        return this.processManager.runningProcs[pid];
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
