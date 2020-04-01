import { commands, Position, Selection, TextEditor, workspace, WorkspaceConfiguration } from "vscode";
import { generateTimestamp, postWarning } from "../../helper/common";
import { output } from "../../helper/output";
import { Markdown, MarkdownExtensionSettingsPath, OpenSettingsCommand, RedirectDocumentId } from "./constants";
import { RedirectionFile } from "./redirection";

export interface IMasterRedirections {
    redirections: IMasterRedirection[];
}

export interface IMasterRedirection {
    source_path: string;
    redirect_url: string;
    redirect_document_id?: boolean;
}

export class MasterRedirection implements IMasterRedirections {
    public redirections: RedirectionFile[];

    constructor(redirectionFiles: RedirectionFile[]) {
        this.redirections = redirectionFiles;
    }
}

export interface IMarkdownConfig {
    docsetName: string;
    docsetRootFolderName: string;
    omitDefaultJsonProperties?: boolean;
}

export async function getMarkdownOptions(): Promise<{ config: WorkspaceConfiguration, options: IMarkdownConfig | null }> {
    const config = workspace.getConfiguration(Markdown);
    const options = {
        docsetName: config.docsetName,
        docsetRootFolderName: config.docsetRootFolderName,
        omitDefaultJsonProperties: config.omitDefaultJsonProperties,
    };

    if (options.docsetName === "" ||
        options.docsetRootFolderName === "") {
        // Open the settings, and prompt the user to enter values.
        await commands.executeCommand(OpenSettingsCommand, MarkdownExtensionSettingsPath);
        postWarning("Please set the Docset Name and Docset Root Folder Name before using this command.");
        return { config, options: null };
    }

    return { config, options };
}

export async function updateRedirects(editor: TextEditor, redirects: IMasterRedirections | null, config: WorkspaceConfiguration) {
    const lineCount = editor.document.lineCount - 1;
    const lastLine = editor.document.lineAt(lineCount);
    const entireDocSelection =
        new Selection(
            new Position(0, 0),
            new Position(lineCount, lastLine.range.end.character));

    await editor.edit((builder) => {
        builder.replace(entireDocSelection, redirectsToJson(redirects, config));
    });

    await editor.document.save();
}

export function redirectsToJson(redirects: IMasterRedirections | null, config: WorkspaceConfiguration) {
    const omitDefaultJsonProperties = config.omitDefaultJsonProperties;
    const replacer = (key: string, value: string) => {
        return omitDefaultJsonProperties && key === RedirectDocumentId
            ? !!value
                ? true
                : undefined
            : value;
    };

    const space =
        workspace.getConfiguration("editor").insertSpaces
            ? workspace.getConfiguration("editor").tabSize as number || 2
            : 2;

    return JSON.stringify(redirects, replacer, space);
}

export function showStatusMessage(message: string) {
    const { msTimeValue } = generateTimestamp();
    output.appendLine(`[${msTimeValue}] - ` + message);
    output.show();
}
