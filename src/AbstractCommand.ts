const EventEmitter = require('events');
import {ChainedPromiseEventEmitter} from "./lib/ChainedPromiseEventEmitter";

export class AbstractCommand extends EventEmitter {
    protected readonly name: string;
    protected readonly logger;
    protected innerChain: ChainedPromiseEventEmitter;

    constructor(name: string, logger) {
        super();
        this.name = name;
        this.logger = logger;
        this.innerChain = new ChainedPromiseEventEmitter(this.logger);
    }


    build(args: any) {
        this.logger.info('%s building command ', this.name);
        this._build(args, this.innerChain);
        this.logger.info('%s building command done', this.name);

        return this;
    }

    protected _build(args: any, chain: ChainedPromiseEventEmitter) {
        throw new Error('not implemented');
    }

    run() {
        this.logger.info('%s start command ', this.name);

        const finalPromise = this.innerChain.promise()
            .then(() => {
                this.logger.info('%s end command ', this.name);
            });

        this.innerChain.run();

        return finalPromise;
    }

    protected chain(name: string, promiseFn: (resolve: Function, reject: Function) => any) {
        const self = this;
        let start: Date;
        let end: Date;

        this.logger.info('chaining %s', name);

        this.innerChain
            .chain(name, (resolve, reject) => {
                return promiseFn(resolve, reject)
                    .catch((e) => {
                        reject(e);
                    })
            });

        return this;
    }

    public promise(): Promise<any> {
        return this._chain;
    }

    protected handleError(e: Error) {
        console.error(e);
        return Promise.resolve();
    }

    protected trace(...args) {
        this.logger.trace.apply(this.logger, args);
    }

    protected debug(...args) {
        this.logger.debug.apply(this.logger, args);
    }

    protected info(...args) {
        this.logger.info.apply(this.logger, args);
    }

    protected warn(...args) {
        this.logger.warn.apply(this.logger, args);
    }

    protected error(...args) {
        this.logger.error.apply(this.logger, args);
    }

    protected fatal(...args) {
        this.logger.fatal.apply(this.logger, args);
    }
}
