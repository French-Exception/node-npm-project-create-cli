"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events');
const ChainedPromiseEventEmitter_1 = require("./lib/ChainedPromiseEventEmitter");
const fs = require('fs-extra');
const path = require('path');
const rimraf = (() => {
    const _rimraf = require('rimraf');
    return (_path) => {
        return new Promise((resolve, reject) => {
            _rimraf(_path, (e) => {
                if (e)
                    return reject(e);
                return resolve(_path);
            });
        }).catch((e) => {
            console.error(e);
        });
    };
})();
const mkdirp = require('mkdirp');
class AbstractCommand extends EventEmitter {
    constructor(name, logger) {
        super();
        this.name = name;
        this.logger = logger;
        this.innerChain = new ChainedPromiseEventEmitter_1.ChainedPromiseEventEmitter(this.logger);
    }
    build(args) {
        this.logger.debug('%s building command ', this.name);
        this._build(args, this.innerChain);
        this.logger.debug('%s building command done', this.name);
        return this;
    }
    _build(args, chain) {
        throw new Error('not implemented');
    }
    run() {
        this.logger.debug('%s start command ', this.name);
        const finalPromise = this.innerChain.promise()
            .then(() => {
            this.logger.debug('%s end command ', this.name);
        });
        this.innerChain.run();
        return finalPromise;
    }
    chain(name, promiseFn) {
        const self = this;
        let start;
        let end;
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
    destroyAndCreateScopeDir(destroyBefore, absScopedPath) {
        const self = this;
        const chain = new ChainedPromiseEventEmitter_1.ChainedPromiseEventEmitter(this.logger);
        const absScopedPathNorm = path.normalize(absScopedPath);
        const input = { path: absScopedPathNorm, exists: false };
        return chain
            .chain('path.exists.check', (resolve, reject) => {
            try {
                fs.access(absScopedPathNorm, fs.W_OK);
                input.exists = true;
            }
            catch (e) {
                input.exists = false;
            }
            return resolve();
        })
            .chain('path.exists.check.destroyIfNecessary', (resolve, reject) => {
            if (!destroyBefore || !input.exists) {
                this.logger.trace('path.exists.check.destroyIfNecessary destroyBefore: %s, input.exists: %s', (destroyBefore ? 'true' : 'false'), (input.exists ? 'true' : 'false'));
                this.logger.info('path.exists.check.destroyIfNecessary not necessary');
                return Promise.resolve();
            }
            this.logger.info('Deleting directory %s', input.path);
            rimraf(input.path)
                .catch((e) => {
                this.logger.error(e);
                if ('ENOENT' === e.code)
                    return resolve();
            })
                .then(() => {
                self.logger.info('Deleted directory %s', input.path);
                return resolve();
            });
        })
            .chain('path.mkdirp', (resolve, reject) => {
            self.logger.info('Creating directory %s', input.path);
            if (!input.path || destroyBefore) {
                const runner = (retries) => {
                    retries -= 1;
                    if (!retries)
                        return Promise.resolve();
                    return new Promise((_resolve, _reject) => {
                        mkdirp(input.path, (e) => {
                            if (e) {
                                if (retries)
                                    setTimeout(() => {
                                        runner(retries)
                                            .catch((e) => {
                                            this.logger.error(e);
                                        })
                                            .then(() => {
                                            resolve();
                                        });
                                    });
                            }
                            self.logger.info('Created directory %s', input.path);
                            return _resolve();
                        });
                    });
                };
                return runner(3)
                    .catch((e) => {
                    this.logger.error(e);
                    return resolve();
                })
                    .then(() => {
                    resolve();
                });
            }
            else {
                return resolve();
            }
        })
            .chain('path.mkdirp.check', (resolve, reject) => {
            try {
                fs.access(absScopedPathNorm, fs.W_OK);
                self.logger.info('Directory correctly created');
                return resolve();
            }
            catch (e) {
                self.logger.warn('Directory incorrectly created');
                return reject(e);
            }
        })
            .run()
            .promise();
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