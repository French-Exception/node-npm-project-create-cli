import * as yargs from 'yargs';

const EventEmitter = require('events');

export async function run() {
    const cli = new Cli();

    cli
        .build()
        .then(() => {
            return cli.run();
        })
        .catch((e) => {
            console.error(e);
        })
}

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
        this.args = this.yargs.argv;
    }

    getArgs() {
        return this.args;
    }

}
