"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("@frenchex/npm-project-create-api");
const path = require("path");
const log4js = require("log4js");
exports = module.exports = {
    command: 'clone <gitUrl>',
    desc: 'Create a new Npm project from a git url',
    builder: {
        'branch': {
            type: 'string',
            default: 'develop',
            desc: 'branch to checkout'
        },
        'root-path': {
            type: 'string',
            default: process.cwd(),
            desc: 'directory'
        },
        'git-bin': {
            type: 'string',
            desc: 'git bin',
            default: 'git'
        },
        'npm-bin': {
            type: 'string',
            desc: 'npm bin',
            default: 'npm'
        },
        'dev': {
            type: 'boolean',
            default: true,
            desc: 'npm i --only dev'
        },
        'destroy-before': {
            type: 'boolean',
            default: false,
            desc: 'Delete directory if exists before cloning'
        },
        'log-level': {
            type: 'choice',
            choices: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
            default: 'info'
        }
    },
    handler: async (args) => {
        const logger = log4js.getLogger('create');
        log4js.configure({
            appenders: { default: { type: 'console' } },
            categories: { default: { appenders: ['default'], level: args.logLevel } }
        });
        const gitBin = path.isAbsolute(args.gitBin) ? args.gitBin : await api.which(args.gitBin);
        const npmBin = path.isAbsolute(args.npmBin) ? args.gitBin : await api.which(args.npmBin);
        args.gitBin = gitBin;
        args.npmBin = npmBin;
        const op = api.gitClone(logger);
        op.build(args);
        const promise = op.run();
        return promise;
    }
};
//# sourceMappingURL=git_clone.js.map