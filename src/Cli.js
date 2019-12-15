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
    })
        .then(() => {
        process.exit(0);
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
    async run() {
        return new Promise((resolve, reject) => {
            this._run = {
                resolve: () => {
                    return resolve(this.args);
                },
                reject: (e) => {
                    return reject(e);
                }
            };
            require.main['done'] = this._run;
            this.args = this.yargs.argv;
        });
    }
    getArgs() {
        return this.args;
    }
}
exports.Cli = Cli;
//# sourceMappingURL=Cli.js.map