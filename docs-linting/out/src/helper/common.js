"use strict";
"use-strict";
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
const extension_1 = require("../extension");
/**
 * Create timestamp
 */
function generateTimestamp() {
    const date = new Date(Date.now());
    return {
        msDateValue: date.toLocaleDateString("en-us"),
        msTimeValue: date.toLocaleTimeString([], { hour12: false }),
    };
}
exports.generateTimestamp = generateTimestamp;
/**
 * Check for active extensions
 */
function checkExtension(extensionName, notInstalledMessage) {
    const extensionValue = vscode.extensions.getExtension(extensionName);
    if (!extensionValue) {
        if (notInstalledMessage) {
            extension_1.output.appendLine(notInstalledMessage);
        }
        return false;
    }
    return extensionValue.isActive;
}
exports.checkExtension = checkExtension;
/**
 * Output message with timestamp
 * @param message
 */
function showStatusMessage(message) {
    const { msTimeValue } = generateTimestamp();
    extension_1.output.appendLine(`[${msTimeValue}] - ${message}`);
}
exports.showStatusMessage = showStatusMessage;
/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
function showWarningMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showWarningMessage(message);
    });
}
exports.showWarningMessage = showWarningMessage;
//# sourceMappingURL=common.js.map