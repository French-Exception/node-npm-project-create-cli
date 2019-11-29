const EventEmitter = require('events');
import {ChainedPromiseEventEmitter} from "./lib/ChainedPromiseEventEmitter";

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
            })
        }).catch((e) => {
            console.error(e);
        })
    }
})();
const mkdirp = require('mkdirp');

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
        this.logger.debug('%s building command ', this.name);
        this._build(args, this.innerChain);
        this.logger.debug('%s building command done', this.name);

        return this;
    }

    protected _build(args: any, chain: ChainedPromiseEventEmitter) {
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

    protected chain(name: string, promiseFn: (resolve: Function, reject: Function) => any) {
        const self = this;
        let start: Date;
        let end: Date;

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

    destroyAndCreateScopeDir(destroyBefore: boolean, absScopedPath: string): Promise<any> {
        const self = this;
        const chain = new ChainedPromiseEventEmitter(this.logger);

        const absScopedPathNorm = path.normalize(absScopedPath);

        const input: { path: string, exists: boolean } = {path: absScopedPathNorm, exists: false};

        return chain
            .chain('path.exists.check', (resolve: Function, reject: Function) => {
                try {
                    fs.access(absScopedPathNorm, fs.W_OK);
                    input.exists = true;
                } catch (e) {
                    input.exists = false;
                }
                return resolve();
            })
            .chain('path.exists.check.destroyIfNecessary', (resolve: Function, reject: Function) => {
                if (!destroyBefore || !input.exists) {
                    this.logger.trace('path.exists.check.destroyIfNecessary destroyBefore: %s, input.exists: %s', (destroyBefore ? 'true' : 'false'), (input.exists ? 'true' : 'false'));
                    this.logger.info('path.exists.check.destroyIfNecessary not necessary');
                    return Promise.resolve();
                }

                this.logger.info('Deleting directory %s', input.path);

                rimraf(input.path)
                    .catch((e) => {
                        this.logger.error(e);
                        // ENOENT, nothing can be done here
                        if ('ENOENT' === e.code)
                            return resolve();
                    })
                    .then(() => {
                        self.logger.info('Deleted directory %s', input.path);
                        return resolve();
                    })

            })
            .chain('path.mkdirp', (resolve: Function, reject: Function) => {
                self.logger.info('Creating directory %s', input.path);
                if (!input.path || /** just deleted it **/ destroyBefore) {
                    const runner = (retries) => {
                        retries -= 1;
                        if (!retries) return Promise.resolve();

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
                                                })
                                        })
                                }

                                self.logger.info('Created directory %s', input.path);
                                return _resolve();
                            })
                        })
                    }

                    return runner(3)
                        .catch((e) => {
                            this.logger.error(e);
                            return resolve();
                        })
                        .then(() => {
                            resolve();
                        })

                } else {
                    return resolve();
                }
            })
            .chain('path.mkdirp.check', (resolve: Function, reject: Function) => {
                try {
                    fs.access(absScopedPathNorm, fs.W_OK);
                    self.logger.info('Directory correctly created');
                    return resolve();
                } catch (e) {
                    self.logger.warn('Directory incorrectly created');
                    return reject(e);
                }
            })
            .run<any>()
            .promise();
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
