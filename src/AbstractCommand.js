"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events');
const ChainedPromiseEventEmitter_1 = require("./lib/ChainedPromiseEventEmitter");
class AbstractCommand extends EventEmitter {
    constructor(name, logger) {
        super();
        this.name = name;
        this.logger = logger;
        this.innerChain = new ChainedPromiseEventEmitter_1.ChainedPromiseEventEmitter(this.logger);
    }
    build(args) {
        this.logger.info('%s building command ', this.name);
        this._build(args, this.innerChain);
        this.logger.info('%s building command done', this.name);
        return this;
    }
    _build(args, chain) {
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
    chain(name, promiseFn) {
        const self = this;
        let start;
        let end;
        this.logger.info('chaining %s', name);
        this.innerChain
            .chain(name, (resolve, reject) => {
            return promiseFn(resolve, reject)
                .catch((e) => {
                reject(e);
            });
        });
        return this;
    }
    promise() {
        return this._chain;
    }
    handleError(e) {
        console.error(e);
        return Promise.resolve();
    }
    trace(...args) {
        this.logger.trace.apply(this.logger, args);
    }
    debug(...args) {
        this.logger.debug.apply(this.logger, args);
    }
    info(...args) {
        this.logger.info.apply(this.logger, args);
    }
    warn(...args) {
        this.logger.warn.apply(this.logger, args);
    }
    error(...args) {
        this.logger.error.apply(this.logger, args);
    }
    fatal(...args) {
        this.logger.fatal.apply(this.logger, args);
    }
}
exports.AbstractCommand = AbstractCommand;
//# sourceMappingURL=AbstractCommand.js.map