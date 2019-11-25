"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const EventEmitter = require('events');
class Cli extends EventEmitter {
    constructor() {
        super();
        this.yargs = yargs;
    }
    async build() {
        this.yargs
            .exitProcess(false)
            .commandDir('./commands')
            .fail((msg, err) => {
            console.error(err);
        })
            .demandCommand(1)
            .help()
            .version();
    }
    run() {
        const self = this;
        return new Promise((resolve, reject) => {
            self._run = {
                resolve: () => {
                    return resolve(self.args);
                },
                reject: (e) => {
                    return reject(e);
                }
            };
            require.main['done'] = self._run;
            self.args = this.yargs.argv;
        });
    }
    getArgs() {
        return this.args;
    }
}
exports.Cli = Cli;
//# sourceMappingURL=Cli.js.map