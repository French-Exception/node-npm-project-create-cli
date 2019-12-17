"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("@frenchex/npm-project-create-api");
const log4js = require("log4js");
const path = require("path");
exports = module.exports = {
    command: 'create <name>',
    desc: 'Create a new Npm project',
    builder: {
        scope: {
            type: 'string',
            desc: 'Scope for new npm module'
        },
        git: {
            type: 'boolean',
            desc: 'create git',
            default: true
        },
        'git-branch': {
            type: 'string',
            default: 'develop',
            desc: 'git branch to checkout',
        },
        'git-flow': {
            type: 'boolean',
            desc: 'Init git flow',
            default: true
        },
        'destroy-before': {
            type: 'boolean',
            desc: 'If dir exists, delete it',
            default: true
        },
        'root-path': {
            type: 'string',
            desc: 'path',
            default: process.cwd()
        },
        'install': {
            type: 'array',
            desc: 'NPM to install with --save',
            default: []
        },
        devInstall: {
            type: 'array',
            desc: 'NPM to install with --save',
            default: []
        },
        author: {
            type: 'string',
            desc: 'Author name',
            default: process.env.USER
        },
        'npm-bin': {
            type: 'string',
            desc: 'node NPM bin',
            default: 'npm'
        },
        'git-bin': {
            type: 'string',
            desc: 'git bin',
            default: 'git'
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
        const op = api.npmProjectCreate(logger);
        op.build(args);
        const promise = op.run();
        return promise;
    }
};
//# sourceMappingURL=create.js.map