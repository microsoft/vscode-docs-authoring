import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
    Extension,
    ExtensionContext,
    OutputChannel,
    window,
    workspace,
} from "vscode";
import { HttpClient } from "./httpClient";
import * as util from "./util/common";
import { ExtensionDownloader } from "./util/ExtensionDownloader";
import { Logger } from "./util/logger";

export class MarkdocsServer {
    private spawnProcess: childProcess.ChildProcess;
    private started: boolean = false;
    private readonly serverPath;
    private context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this.context = context;
    }

    public ensureRuntimeDependencies(extension: Extension<any>, channel: OutputChannel, logger: Logger): Promise<boolean> {
        return util.installFileExists(util.InstallFileType.Lock)
            .then((exists) => {
                if (!exists) {
                    const downloader = new ExtensionDownloader(channel, logger, extension.packageJSON);
                    return downloader.installRuntimeDependencies();
                } else {
                    return true;
                }
            });
    }

    public async startMarkdocsServerAsync(): Promise<void> {
        const hasStarted = await this.hasAlreadyStartAsync();
        if (hasStarted) {
            return;
        }

        const serverPath = this.getServerPath();
        if (!serverPath) {
            window.showErrorMessage(`[Markdocs Error]: Markdocs server can't be found.`);
            return;
        }

        try {
            this.spawnProcess = this.spawn(serverPath, {});
        } catch (err) {
            window.showErrorMessage(`[Markdocs Error]: ${err}`);
            return;
        }

        if (!this.spawnProcess.pid) {
            window.showErrorMessage(`[Markdocs Error] Error occurs while spawning markdocs local server.`);
            return;
        }

        this.spawnProcess.stdout.on("data", (data) => {
            this.started = false;
        });

        this.spawnProcess.stderr.on("data", (data) => {
            window.showErrorMessage(`[Markdocs Server Error]: ${data.toString()}`);
        });

        await this.ensureMarkdocsServerWorkAsync();
    }

    public stopMarkdocsServer() {
        this.spawnProcess.kill();
    }

    private async ensureMarkdocsServerWorkAsync(): Promise<void> {
        while (true) {
            try {
                await HttpClient.pingAsync();
                return;
            } catch (Error) {
                await this.sleepAsync(100);
            }
        }
    }

    private async hasAlreadyStartAsync(): Promise<boolean> {
        try {
            await HttpClient.pingAsync();
            return true;
        } catch (Error) {
            return false;
        }
    }

    private async sleepAsync(ms: number) {
        return Promise.resolve((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    private getServerPath() {
        const serverPaths = [
            ".markdocs/MarkdocsService.exe",
            ".markdocs/MarkdocsService",
        ];

        for (let p of serverPaths) {
            p = this.context.asAbsolutePath(p);
            if (fs.existsSync(p)) {
                return p;
            }
        }
    }

    private spawn(command: string, options): childProcess.ChildProcess {
        let file;
        let args;
        if (process.platform === "win32") {
            file = "cmd.exe";
            // execute chcp 65001 to make sure console's code page supports UTF8
            // https://github.com/nodejs/node-v0.x-archive/issues/2190
            args = ["/s", "/c", '"chcp 65001 >NUL & ' + command + '"'];
            options = Object.assign({}, options);
            options.windowsVerbatimArguments = true;
        } else {
            file = "/bin/sh";
            args = ["-c", command];
        }
        return childProcess.spawn(file, args, options);
    }
}
