"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractCommand_1 = require("./AbstractCommand");
const path = require('path');
const fs = require('fs-extra');
const rimraf = (() => {
    const _rimraf = require('rimraf');
    return (_path) => {
        return new Promise((resolve, reject) => {
            _rimraf(_path, (e) => {
                if (e)
                    return reject(e);
                return resolve();
            });
        });
    };
})();
const cp = require('child-process-promise');
class NpmProjectCreateCommand extends AbstractCommand_1.AbstractCommand {
    constructor(logger) {
        super('npm.project.create', logger);
    }
    _build(args, chain) {
        const self = this;
        const absoluteFullPathScoped = path.join(args.rootPath, (args.scope ? '@' + args.scope : ''), args.name);
        return chain
            .chain('destroy.create.scope.dir', (resolve, reject) => {
            return self
                .destroyAndCreateScopeDir(args.destroyBefore, absoluteFullPathScoped)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('npm.init', (resolve, reject) => {
            return self
                .npmInit(args.npmBin, absoluteFullPathScoped, args.name, args.scope)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('npm.install', (resolve, reject) => {
            return self
                .npmInstall(args.npmBin, absoluteFullPathScoped, args.install, args.devInstall)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('git.init', (resolve, reject) => {
            return self
                .gitInit(args.gitBin, absoluteFullPathScoped)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('git.flow.init', (resolve, reject) => {
            return self
                .gitFlowInit(args.gitBin, absoluteFullPathScoped)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('packagejson.update', (resolve, reject) => {
            return self.updatePackageJson()
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
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
    async gitCheckoutBranch(gitBin, branch, path) {
        const _gitCheckout = cp.spawn(gitBin, ['checkout', '-b', branch], {
            cwd: path,
            stdio: null
        });
        return _gitCheckout;
    }
    async gitInit(gitBin, path) {
        const _gitInit = cp.spawn(gitBin, ['init'], {
            cwd: path,
            stdio: null
        });
        return _gitInit;
    }
    async npmInit(npmBin, path, name, scope) {
        const args = ['init', '-y'];
        const _npmInit = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: null
        });
        return _npmInit;
    }
    async _npmInstall(npmBin, absFilePath, toInstall, dev) {
        const args = [(dev ? '--save-dev' : '--save'), 'install'].concat(toInstall);
        const _npmInstall = await cp.spawn(npmBin, args, {
            cwd: absFilePath,
            stdio: null
        });
    }
    async npmInstall(npmBin, absFilePath, toInstall, devToInstall) {
        return this._npmInstall(npmBin, absFilePath, toInstall, false)
            .then(() => {
            return this._npmInstall(npmBin, absFilePath, devToInstall, true);
        });
    }
    async updatePackageJson() {
    }
}
exports.NpmProjectCreateCommand = NpmProjectCreateCommand;
//# sourceMappingURL=NpmProjectCreateCommand.js.map