import vscode = require("vscode");
import TelemetryReporter from "vscode-extension-telemetry";

export let reporter: TelemetryReporter;

export class Reporter extends vscode.Disposable {
    constructor(context: vscode.ExtensionContext) {
        super(() => reporter.dispose());
        const packageInfo = getPackageInfo(context);
        reporter = packageInfo && new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    }
}

interface IPackageInfo {
    name: string;
    version: string;
    aiKey: string;
}

function getPackageInfo(context: vscode.ExtensionContext): IPackageInfo {
    const extensionPackage = require(context.asAbsolutePath("./package.json"));
    return { name: extensionPackage.name, version: extensionPackage.version, aiKey: extensionPackage.aiKey };
}
