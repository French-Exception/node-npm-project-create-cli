import {ChainedPromiseEventEmitter} from "./lib/ChainedPromiseEventEmitter";

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

import {AbstractCommand} from './AbstractCommand'

const path = require('path');
const fs = require('fs-extra');

const cp = require('child-process-promise');

export class NpmProjectCreateCommand extends AbstractCommand {

    constructor(logger) {
        super('npm.project.create', logger);
    }

    _build(args: NpmProjectCreateCommandArguments, chain: ChainedPromiseEventEmitter) {
        const self = this;
        const absoluteFullPathScoped = path.join(args.rootPath, (args.scope ? '@' + args.scope : ''), args.name);

        return chain
            .chain('destroy.create.scope.dir', (resolve: Function, reject: Function) => {
                return self
                    .destroyAndCreateScopeDir(args.destroyBefore, absoluteFullPathScoped)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('npm.init', (resolve: Function, reject: Function) => {
                return self
                    .npmInit(args.npmBin, absoluteFullPathScoped, args.name, args.scope)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('npm.install', (resolve: Function, reject: Function) => {
                return self
                    .npmInstall(args.npmBin, absoluteFullPathScoped, args.install, args.devInstall)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('git.init', (resolve: Function, reject: Function) => {
                return self
                    .gitInit(args.gitBin, absoluteFullPathScoped)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('git.flow.init', (resolve: Function, reject: Function) => {
                return self
                    .gitFlowInit(args.gitBin, absoluteFullPathScoped)
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .chain('packagejson.update', (resolve: Function, reject: Function) => {
                return self.updatePackageJson()
                    .catch((e) => {
                        return reject(e);
                    })
                    .then(() => {
                        resolve();
                    })
            })
            .promise();
    }




    gitFlowInit(gitBin, path) {
        const _gitFlowInit = cp.spawn(gitBin, ['flow', 'init', '-d'], {
            cwd: path,
            stdio: null
        });

        return _gitFlowInit;
    }

    async gitCheckoutBranch(gitBin: string, branch: string, path: string) {
        const _gitCheckout = cp.spawn(gitBin, ['checkout', '-b', branch], {
            cwd: path,
            stdio: null
        });

        return _gitCheckout;
    }

    async gitInit(gitBin: string, path: string) {
        const _gitInit = cp.spawn(gitBin, ['init'], {
            cwd: path,
            stdio: null
        })

        return _gitInit;
    }

    async npmInit(npmBin: string, path: string, name: string, scope?: string) {
        const args = ['init', '-y'];

        const _npmInit = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: null
        });

        return _npmInit;
    }


    async _npmInstall(npmBin: string, absFilePath: string, toInstall: string[], dev: boolean) {
        const args = [(dev ? '--save-dev' : '--save'), 'install'].concat(toInstall);

        const _npmInstall = await cp.spawn(npmBin, args, {
            cwd: absFilePath,
            stdio: null
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
