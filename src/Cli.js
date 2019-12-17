"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const EventEmitter = require('events');
async function run() {
    const cli = new Cli();
    cli
        .build()
        .then(() => {
        return cli.run();
    })
        .catch((e) => {
        console.error(e);
    });
}
exports.run = run;
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
        this.args = this.yargs.argv;
    }
    getArgs() {
        return this.args;
    }
}
exports.Cli = Cli;
//# sourceMappingURL=Cli.js.map