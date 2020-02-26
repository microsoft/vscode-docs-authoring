"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
class Reporter extends vscode_1.Disposable {
    constructor(context) {
        super(() => exports.reporter.dispose());
        const packageInfo = getPackageInfo(context);
        exports.reporter = packageInfo && new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    }
}
exports.Reporter = Reporter;
function getPackageInfo(context) {
    const extensionPackage = require(context.asAbsolutePath("./package.json"));
    return { name: extensionPackage.name, version: extensionPackage.version, aiKey: extensionPackage.aiKey };
}
//# sourceMappingURL=telemetry.js.map