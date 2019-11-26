"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractCommand_1 = require("./AbstractCommand");
const path = require('path');
const cp = require('child-process-promise');
class GitCloneCommand extends AbstractCommand_1.AbstractCommand {
    constructor(logger) {
        super('git.clonee', logger);
    }
    _build(args) {
        args.path = path.normalize(args.path);
        this
            .chain('git.clone.checkout', (resolve, reject) => {
            return this
                .gitCloneAndCheckout(args.gitBin, args.gitUrl, args.branch, args.path)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                resolve();
            });
        })
            .chain('npm.install', (resolve, reject) => {
            return this
                .npmInstall(args.npmBin, args.dev, args.path)
                .catch((e) => {
                return reject(e);
            })
                .then(() => {
                return resolve();
            });
        });
    }
    async npmInstall(npmBin, dev, path) {
        const args = ['install'];
        if (dev)
            args.concat(['--only', 'dev']);
        const _npmInstall = cp.spawn(npmBin, args, {
            cwd: path,
            stdio: 'inherit'
        });
        return _npmInstall;
    }
    async gitCloneAndCheckout(gitBin, gitUrl, branch, path) {
        const _gitClone = cp.spawn(gitBin, ['clone', '-b', branch, gitUrl, path], {
            cwd: path,
            stdio: 'inherit'
        });
        return _gitClone;
    }
}
exports.GitCloneCommand = GitCloneCommand;
//# sourceMappingURL=GitCloneCommand.js.map