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
        'log-level': {
            type: 'choice',
            choices: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
            default: 'info'
        }
    },
    handler: (args) => {
        const start = new Date();
        const { GitCloneCommand } = require('./../GitCloneCommand');
        const log4js = require('log4js');
        log4js.configure({
            appenders: { 'cli.git.clone': { type: 'console' } },
            categories: { default: { appenders: ['cli.git.clone'], level: args.logLevel } }
        });
        const logger = log4js.getLogger('cli.create');
        logger.trace('yargs.handler');
        const cmd = new GitCloneCommand(logger);
        return cmd.run(args)
            .then((res) => {
            logger.trace('yargs.handler cmd.run done');
            require.main['done'].resolve(res);
        })
            .then(() => {
            const end = new Date();
            const diff = end - start;
            const diffSeconds = diff / 1000;
            logger.trace('yargs.handler done in %s s', diffSeconds);
            logger.info('Finished in %s seconds', diffSeconds);
        });
    }
};
//# sourceMappingURL=git_clone.js.map