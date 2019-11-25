export interface NpmProjectCreateCommandArguments {
    name: string,
    scope: string,
    gitFlow: boolean,
    git: boolean,
    gitBranch: string,
    destroyBefore: boolean
    rootPath: string,
    install: string[],
    devInstall: string[]
    username: string,
    email: string
    npmBin: string,
    gitBin: string
}

const path = require('path');
const fs = require('fs-extra');
const rimraf = (() => {
    const _rimraf = require('rimraf');
    return (_path) => {
        return new Promise((resolve, reject) => {
            _rimraf(_path, (e) => {
                if (e) return reject(e);
                return resolve();
            })
        })
    }
})();
const mkdirp = require('mkdirp');
const cp = require('child-process-promise');

export class NpmProjectCreateCommand {

    private readonly logger;

    constructor(logger) {
        this.logger = logger;
    }

    run(args: NpmProjectCreateCommandArguments) {
        const self = this;
        const absoluteFullPathScoped = path.join(args.rootPath, (args.scope ? '@' + args.scope : ''), args.name);

        return Promise.resolve()
            .then(() => {
                return self.destroyAndCreateScopeDir(args.destroyBefore, absoluteFullPathScoped)
            })
            .then(() => {
                return self.npmInit(args.npmBin, absoluteFullPathScoped, args.name, args.scope);
            })
            .catch((e) => {
                self.logger.error(e);
                process.exit(1);
            })
            .then(() => {
                return self.npmInstall(args.npmBin, absoluteFullPathScoped, args.install, args.devInstall);
            })
            .then(() => {
                return self.gitInit(args.gitBin, absoluteFullPathScoped);
            })
            .then(() => {
                return self.gitFlowInit(args.gitBin, absoluteFullPathScoped);
            })
            .then(() => {
                return self.updatePackageJson();
            });
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

    destroyAndCreateScopeDir(destroyBefore: boolean, absScopedPath: string) {
        const self = this;
        const absScopedPathNorm = path.normalize(absScopedPath);

        self.logger.trace('destroyAndCreateScopeDir start');

        return Promise.resolve()
            .then(() => {
                let exists = false;
                try {
                    fs.access(absScopedPathNorm, fs.W_OK);
                    exists = true;
                } catch (e) {
                    exists = false;
                }
                return {path: absScopedPathNorm, exists: exists}
            })
            .catch(() => {
                return {path: absScopedPathNorm, exists: false}
            })
            .then((input: { path: string, exists: boolean }) => {
                self.logger.trace('destroyAndCreateScopeDir exists ?', input);

                return new Promise((resolve, reject) => {
                    if (destroyBefore && input.exists) {
                        rimraf(input.path)
                            .catch((e) => {
                                self.debug('destroyAndCreateScopeDir', e);
                                return resolve(input);
                            })
                    }
                    resolve(input);
                });
            })
            .then((input: { path: string, exists: boolean }) => {
                return new Promise((resolve, reject) => {
                    if (!input.path || /** just deleted it **/ destroyBefore) {
                        mkdirp(input.path, (e) => {
                            if (e) return resolve(e);
                            return resolve();
                        })
                    } else {
                        resolve();
                    }
                })
            })
    }

    gitFlowInit(gitBin, path){
        const _gitFlowInit = cp.spawn(gitBin, ['flow', 'init', '-d'], {
            cwd: path,
            stdio: 'inherit'
        });

        return _gitFlowInit;
    }

    async gitCheckoutBranch(gitBin: string, branch: string, path: string) {
        const _gitCheckout = cp.spawn(gitBin, ['checkout', '-b', branch], {
            cwd: path,
            stdio: 'inherit'
        });

        return _gitCheckout;
    }

    async gitInit(gitBin: string, path: string) {
        const _gitInit = cp.spawn(gitBin, ['init'], {
            cwd: path,
            stdio: 'inherit'
        })

        return _gitInit;
    }

    async npmInit(npmBin: string, path: string, name: string, scope?: string) {
        const args = ['init', '-y'];

        const _npmInit = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: 'inherit'
        });

        return _npmInit;
    }


    async _npmInstall(npmBin: string, absFilePath: string, toInstall: string[], dev: boolean) {
        const args = [(dev ? '--save-dev' : '--save'), 'install'].concat(toInstall);
        console.log('_npmInstall', toInstall, npmBin, args);

        const _npmInstall = await cp.spawn(npmBin, args, {
            cwd: absFilePath,
            stdio: 'inherit'
        });

    }

    async npmInstall(npmBin: string, absFilePath: string, toInstall: string[], devToInstall: string[]) {
        return this._npmInstall(npmBin, absFilePath, toInstall, false)
            .then(() => {
                return this._npmInstall(npmBin, absFilePath, devToInstall, true);
            })
    }

    async updatePackageJson() {

    }
}
