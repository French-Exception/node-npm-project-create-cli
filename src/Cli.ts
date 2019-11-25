import * as yargs from 'yargs';
import {Argv} from "yargs";

const EventEmitter = require('events');

export class Cli extends EventEmitter {

    private readonly yargs: yargs.Argv;
    private args;
    private _run;

    constructor() {
        super();

        this.yargs = yargs;
    }

    async build() {
        this.yargs
            .exitProcess(false)
            .commandDir('./commands')
            .fail((msg: string, err: Error) => {
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
