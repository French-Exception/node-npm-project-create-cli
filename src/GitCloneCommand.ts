export interface GitCloneCommandArguments {
    gitBin: string,
    gitUrl: string,
    path: string,
    branch: string
    npmBin: string,
    dev: boolean,
    destroyBefore: boolean
}

import {AbstractCommand} from "./AbstractCommand";

const path = require('path');
const cp = require('child-process-promise');

export class GitCloneCommand extends AbstractCommand {

    constructor(logger) {
        super('git.clone', logger);
    }

    protected _build(args: GitCloneCommandArguments) {
        if (!args.gitBin)
            throw new Error('missing gitBin');

        if (!args.npmBin)
            throw new Error('missing npmBin');

        if (!args.gitUrl)
            throw new Error('missing gitUrl');

        if (!args.path)
            throw new Error('missing path');

        args.path = path.normalize(args.path);

        this
            .chain('destroy.create.scope.dir', (resolve: Function, reject: Function) => {

                this.logger.info('Destroying directory "%s" if necessary: %s', args.path, args.destroyBefore ? 'true' : 'false');

                return this
                    .destroyAndCreateScopeDir(args.destroyBefore, args.path)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('git.clone.checkout', (resolve: Function, reject: Function) => {
                this.logger.info('Cloning using "%s" into "%s"', args.gitUrl, args.path);

                const runner = (retries: number) => {
                    return new Promise((_resolve, _reject) => {
                        retries -= 1;
                        if (!retries) // no more retries
                            return _reject();

                        this
                            .gitCloneAndCheckout(args.gitBin, args.gitUrl, args.branch, args.path)
                            .catch((e) => {
                                if ('ENOENT' === e.code) {
                                    return runner(retries)
                                        .catch((e) => {

                                        })
                                }

                                this.logger.trace('git.clone.checkout failed, retry: %s', retries);
                                return _reject(e);
                            })
                            .then(() => {
                                _resolve();
                            });

                    })
                }

                return runner(3)
                    .catch((e) => {
                        this.logger.error(e);
                    })
            })
            .chain('npm.install', (resolve: Function, reject: Function) => {
                this.logger.info('Npm install with dev ? %s', args.dev ? 'true' : 'false');

                return this
                    .npmInstall(args.npmBin, args.dev, args.path)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        return resolve();
                    })
            });
    }

    async npmInstall(npmBin: string, dev: boolean, path: string) {
        const args = ['install'];
        if (dev)
            args.concat(['--only', 'dev']);

        this.logger.trace('npm.install npmBin: %s, dev: %s, path: %s, args: %s, cwd: %s, ENV.PATH: ', npmBin, dev, path, JSON.stringify(args), process.cwd(), process.env['PATH']);

        const _npmInstall = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: null
        });

        return _npmInstall;
    }

    async gitCloneAndCheckout(gitBin: string, gitUrl: string, branch: string, path: string) {
        const args = ['clone', '-b', branch, gitUrl, path];

        this.logger.trace('gitCloneAndCheckout gitBin: %s, gitUrl: %s, branch: %s, path: %s, args: %s', gitBin, gitUrl, branch, path, JSON.stringify(args));

        const _gitClone = cp
            .spawn(gitBin, args, {
                cwd: path,
                stdio: null
            })

        return _gitClone;
    }
}
