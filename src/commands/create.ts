import * as api from "@frenchex/npm-project-create-api";
import * as log4js from "log4js";
import * as path from "path";

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
            default: false
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
        },
        'package-version': {
            type: 'string',
            default: '0.0.1',
        },
        'package-email': {
            type: 'string',
            default: process.env.USER_EMAIL
        },
        'package-author': {
            type: 'string',
            default: process.env.USER
        },
        'package-json': {
            type: 'object',
            default: {},
            description: 'Overload package.json using --package-json.foo=bar'
        }
    },
    handler: async (args) => {
        const logger = log4js.getLogger('create');
        log4js.configure({
            appenders: {default: {type: 'console'}},
            categories: {default: {appenders: ['default'], level: args.logLevel}}
        });

        const gitBin = path.isAbsolute(args.gitBin) ? args.gitBin : await api.which(args.gitBin);
        const npmBin = path.isAbsolute(args.npmBin) ? args.gitBin : await api.which(args.npmBin);
        args.gitBin = gitBin;
        args.npmBin = npmBin;

        args.packageJson.version = args.version
        args.packageJson.author = args.author
        args.packageJson.email = args.email


        const op = api.npmProjectCreate(logger);

        op.build(args);

        const promise = op.run();

        return promise;
    }
};


