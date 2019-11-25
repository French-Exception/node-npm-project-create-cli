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
        }
    },
    handler: (args) => {
        const start = new Date();
        const {NpmProjectCreateCommand} = require('./../NpmProjectCreateCommand');
        const log4js = require('log4js');
        log4js.configure({
            appenders: {'cli.create': {type: 'console'}},
            categories: {default: {appenders: ['cli.create'], level: args.logLevel}}
        });

        const logger = log4js.getLogger('cli.create');
        logger.trace('yargs.handler');

        const cmd = new NpmProjectCreateCommand(logger);
        return cmd.run(args)
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
