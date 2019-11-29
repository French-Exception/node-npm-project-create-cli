"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events');
class ChainedPromiseEventEmitter extends EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.initPromises();
    }
    chain(name, promiseFn) {
        const self = this;
        let start;
        let end;
        this.logger.debug('chaining %s', name);
        this._chain = this._chain.then(() => {
            return new Promise((resolve, reject) => {
                start = new Date();
                self.logger.debug('%s start chain', name, start);
                const result = (() => {
                    try {
                        const p = promiseFn.bind(self)((...args) => {
                            resolve(...args);
                        }, (...args) => {
                            reject(...args);
                        });
                        return p;
                    }
                    catch (e) {
                        self.logger.error('%s chain error: %s', name, e.toString());
                        return reject(new Error('%s error in chain execution : ' + e.toString()));
                    }
                })();
                if (result && result instanceof Promise) {
                    result
                        .catch((e) => {
                        self.logger.error('%s chained promise error: %s', name, e.toString());
                    })
                        .then((result) => {
                        resolve(result);
                    });
                }
                return result;
            })
                .then(() => {
                const end = new Date();
                const diffSeconds = (end - start) / 1000;
                self.logger.debug('%s end chain, finished in %s seconds', name, diffSeconds);
            });
        });
        return this;
    }
    initPromises() {
        const self = this;
        const promises = (() => {
            const p = {};
            p.promise = new Promise((resolve, reject) => {
                p.resolve = () => {
                    resolve();
                };
                p.reject = (e) => {
                    reject(e);
                };
            });
            return p;
        })();
        this.start = promises.resolve;
        this.fail = promises.reject;
        this._chain = promises.promise;
    }
    run() {
        this.start();
        return this;
    }
    promise() {
        return this._chain;
    }
}
exports.ChainedPromiseEventEmitter = ChainedPromiseEventEmitter;
//# sourceMappingURL=ChainedPromiseEventEmitter.js.map