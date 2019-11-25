const { Cli } = require('./src/Cli');
const cli = new Cli();
cli
    .build()
    .then(() => {
    return cli.run();
})
    .catch((e) => {
    console.error(e);
})
    .then(() => {
    process.exit(0);
});
//# sourceMappingURL=index.js.map