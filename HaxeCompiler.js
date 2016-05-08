"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const log = require('./log');
const exec_1 = require('./exec');
class HaxeCompiler {
    constructor(from, haxeDirectory, hxml, sourceDirectories) {
        this.ready = true;
        this.todo = false;
        this.port = '7000';
        this.from = from;
        this.haxeDirectory = haxeDirectory;
        this.hxml = hxml;
        this.sourceMatchers = [];
        for (let dir of sourceDirectories) {
            this.sourceMatchers.push(path.join(dir, '**'));
        }
    }
    run(watch) {
        return __awaiter(this, void 0, void 0, function* () {
            if (watch) {
                this.watcher = chokidar.watch(this.sourceMatchers, { ignored: /[\/\\]\./, persistent: true, ignoreInitial: true });
                this.watcher.on('add', (file) => {
                    this.scheduleCompile();
                });
                this.watcher.on('change', (file) => {
                    this.scheduleCompile();
                });
                this.watcher.on('unlink', (file) => {
                    this.scheduleCompile();
                });
                this.startCompilationServer();
                setTimeout(() => {
                    this.scheduleCompile();
                }, 500);
            }
            else
                yield this.compile();
        });
    }
    scheduleCompile() {
        if (this.ready) {
            this.triggerCompilationServer();
        }
        else {
            this.todo = true;
        }
    }
    startCompilationServer() {
        let exe = 'haxe';
        let env = process.env;
        if (fs.existsSync(this.haxeDirectory) && fs.statSync(this.haxeDirectory).isDirectory()) {
            let localexe = path.resolve(this.haxeDirectory, 'haxe' + exec_1.sys());
            if (!fs.existsSync(localexe))
                localexe = path.resolve(this.haxeDirectory, 'haxe');
            if (fs.existsSync(localexe))
                exe = localexe;
            const stddir = path.resolve(this.haxeDirectory, 'std');
            if (fs.existsSync(stddir) && fs.statSync(stddir).isDirectory()) {
                env.HAXE_STD_PATH = stddir;
            }
        }
        let haxe = child_process.spawn(exe, ['--wait', this.port], { env: env, cwd: path.normalize(this.from) });
        haxe.stdout.on('data', (data) => {
            log.info(data.toString());
        });
        haxe.stderr.on('data', (data) => {
            log.error(data.toString());
        });
        haxe.on('close', (code) => {
            log.error('Haxe compilation server stopped.');
        });
    }
    triggerCompilationServer() {
        return new Promise((resolve, reject) => {
            let exe = 'haxe';
            let env = process.env;
            if (fs.existsSync(this.haxeDirectory) && fs.statSync(this.haxeDirectory).isDirectory()) {
                let localexe = path.resolve(this.haxeDirectory, 'haxe' + exec_1.sys());
                if (!fs.existsSync(localexe))
                    localexe = path.resolve(this.haxeDirectory, 'haxe');
                if (fs.existsSync(localexe))
                    exe = localexe;
                const stddir = path.resolve(this.haxeDirectory, 'std');
                if (fs.existsSync(stddir) && fs.statSync(stddir).isDirectory()) {
                    env.HAXE_STD_PATH = stddir;
                }
            }
            console.log('Haxe compile start.');
            //haxe --connect 6000 --cwd myproject.hxml
            let haxe = child_process.spawn(exe, ['--connect', this.port, this.hxml], { env: env, cwd: path.normalize(this.from) });
            haxe.stdout.on('data', (data) => {
                log.info(data.toString());
            });
            haxe.stderr.on('data', (data) => {
                log.error(data.toString());
            });
            haxe.on('close', (code) => {
                this.ready = true;
                if (this.todo) {
                    this.scheduleCompile();
                }
                console.log('Haxe compile end.');
                if (code === 0)
                    resolve();
                else
                    reject('Haxe compiler error.');
            });
        });
    }
    compile() {
        return new Promise((resolve, reject) => {
            let exe = 'haxe';
            let env = process.env;
            if (fs.existsSync(this.haxeDirectory) && fs.statSync(this.haxeDirectory).isDirectory()) {
                let localexe = path.resolve(this.haxeDirectory, 'haxe' + exec_1.sys());
                if (!fs.existsSync(localexe))
                    localexe = path.resolve(this.haxeDirectory, 'haxe');
                if (fs.existsSync(localexe))
                    exe = localexe;
                const stddir = path.resolve(this.haxeDirectory, 'std');
                if (fs.existsSync(stddir) && fs.statSync(stddir).isDirectory()) {
                    env.HAXE_STD_PATH = stddir;
                }
            }
            console.log('Haxe compile start.');
            let haxe = child_process.spawn(exe, [this.hxml], { env: env, cwd: path.normalize(this.from) });
            haxe.stdout.on('data', (data) => {
                log.info(data.toString());
            });
            haxe.stderr.on('data', (data) => {
                log.error(data.toString());
            });
            haxe.on('close', (code) => {
                console.log('Haxe compile end.');
                if (code === 0)
                    resolve();
                else
                    reject('Haxe compiler error.');
            });
        });
    }
}
exports.HaxeCompiler = HaxeCompiler;
//# sourceMappingURL=HaxeCompiler.js.map