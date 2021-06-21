import { Process } from './process';

export class ProcessManager {
    constructor(os) {
        this.os = os;
        this.runningProcs = {};
    }

    exec(executable, args) {
        let pid = this._nextPid();
        let process = new Process(this.os, pid, executable, args);
        this.runningProcs[pid] = process;
        process.setEndListener((proc) => {
            delete this.runningProcs[proc.pid];
        });
        process.start();

        return pid;
    }

    _nextPid() {
        let maxPid = Math.max(0, ...Object.keys(this.runningProcs));
        return maxPid + 1;
    }
}
