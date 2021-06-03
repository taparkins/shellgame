export class OsEnvironment {
    constructor(os) {
        this.os = os;
        this.variables = {};
        this.executables = {};
    }

    registerExecutable(path, executable) {
        if (executables[path] !== undefined) {
            deregisterExecutable(path);
        }

        executables[path] = executable;
    }

    deregisterExecutable(path) {
        // TODO: once we've got background processes happening, do we need to check for running processes for this executable?
        delete executables[path];
    }
}
