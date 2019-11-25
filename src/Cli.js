"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const EventEmitter = require('events');
class Cli extends EventEmitter {
    constructor() {
        super();
        this.yargs = yargs;
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.yargs
                .exitProcess(false)
                .commandDir('./commands')
                .fail((msg, err) => {
                console.error(err);
            })
                .demandCommand(1)
                .help()
                .version();
        });
    }
    run() {
        const self = this;
        return new Promise((resolve, reject) => {
            self._run = {
                resolve: () => {
                    return resolve(self.args);
                },
                reject: (e) => {
                    return reject(e);
                }
            };
            require.main['done'] = self._run;
            self.args = this.yargs.argv;
        });
    }
    getArgs() {
        return this.args;
    }
}
exports.Cli = Cli;
//# sourceMappingURL=Cli.js.map