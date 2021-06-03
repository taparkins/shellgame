import { Process } from './process';

export class ProcessManager {
    constructor(os) {
        this.os = os;
        this.runningProcs = {};
    }

    exec(executable, args) {
        let pid = _nextPid();
        let process = new Process(this.os, pid, executable, args);
        process.setEndListener((proc) => {
            delete this.runningProcs[proc.pid];
        });

        return pid;
    }

    _nextPid() {
        let maxPid = Math.max(...Object.keys(runningProcs));
        return maxPid + 1;
    }
}
