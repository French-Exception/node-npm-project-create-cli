export interface GitCloneCommandArguments {
    gitBin: string,
    gitUrl: string,
    path: string,
    branch: string
    npmBin: string,
    dev: boolean
}

import {AbstractCommand} from "./AbstractCommand";

const path = require('path');
const cp = require('child-process-promise');

export class GitCloneCommand extends AbstractCommand {

    constructor(logger) {
        super('git.clonee', logger);
    }

    protected _build(args: GitCloneCommandArguments) {
        args.path = path.normalize(args.path);

        this
            .chain('git.clone.checkout', (resolve: Function, reject: Function) => {
                return this
                    .gitCloneAndCheckout(args.gitBin, args.gitUrl, args.branch, args.path)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('npm.install', (resolve: Function, reject: Function) => {
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

        const _npmInstall = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: 'inherit'
        });

        return _npmInstall;
    }

    async gitCloneAndCheckout(gitBin: string, gitUrl: string, branch: string, path: string) {
        const _gitClone = cp.spawn(gitBin, ['clone', '-b', branch, gitUrl, path], {
            cwd: path,
            stdio: 'inherit'
        });

        return _gitClone;
    }
}
