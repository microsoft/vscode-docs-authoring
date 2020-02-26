"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.extensionEnvironment = {
    Develop: "Develop",
    Production: "Production",
    Staging: "Staging",
    Test: "Test",
    Unknown: "Unknown",
};
/**
 * Provides a common tool for logging. Currently prints to the console (when debugging), and nothing else.
 * @param {any} message - the object to be written to the log. This does not strictly require string type.
 */
function debug(message) {
    process.stdout.write(message + "\n");
}
exports.debug = debug;
/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
function information(message) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(message);
        vscode.window.showInformationMessage(message);
    });
}
exports.information = information;
/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
function error(message) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(message);
        vscode.window.showErrorMessage(message);
    });
}
exports.error = error;
/**
 * Build log trace and send to SkyEye log database
 * @param {string} commandName - the command name that user use.
 */
function telemetry(commandName, message) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write(commandName + ": " + message + "\n");
    });
}
exports.telemetry = telemetry;
//# sourceMappingURL=log.js.map