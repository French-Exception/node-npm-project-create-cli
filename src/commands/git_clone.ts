import * as lib from "@frenchex/npm-project-create-api";

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
    handler: (args) => {
        const start = new Date();
        const log4js = require('@log4js-node/log4js-api');
        log4js.configure({
            appenders: {'cli.git.clone': {type: 'console'}},
            categories: {default: {appenders: ['cli.git.clone'], level: args.logLevel}}
        });

        const logger = log4js.getLogger('cli.git.clone');
        logger.trace('yargs.handler');

        const cmd = lib.gitClone(args);
        return cmd
            .build(args)
            .run()
            .then((res) => {
                logger.trace('yargs.handler cmd.run done');
                require.main['done'].resolve(res);
            })
            .then(() => {
                const end = new Date();
                const diff: number = <any>end - <any>start;
                const diffSeconds = diff / 1000;

                logger.trace('yargs.handler done in %s s', diffSeconds);
                logger.info('Finished in %s seconds', diffSeconds);
            });
    }
};
