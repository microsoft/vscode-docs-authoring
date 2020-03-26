import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    CompletionContext,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Diagnostic,
    DiagnosticSeverity,
    MarkdownString,
    Position,
    QuickPickItem,
    Range,
    SnippetString,
    TextDocument,
    window,
    workspace,
} from "vscode";

import { insertContentToEditor, matchAll, naturalLanguageCompare, noActiveEditorMessage } from "./common";

export function insertLanguageCommands() {
    return [
        { command: insertLanguageIdentifier.name, callback: insertLanguageIdentifier },
    ];
}

export interface IHighlightLanguage {
    readonly language: string;
    readonly aliases: string[];
    readonly extensions?: string[];
}

export type HighlightLanguages = IHighlightLanguage[];

/**
 * The various syntax highlighting languages available.
 * Source langs: https://raw.githubusercontent.com/DuncanmaMSFT/highlight.js/master/README.md
 * If this changes, we need to update "contributes/configuration/markdown.docsetLanguages" schema.
 */
export const languages: HighlightLanguages =
    [
        { language: ".NET Core CLI", aliases: ["dotnetcli"] },
        { language: "Apache", aliases: ["apache", "apacheconf"] },
        { language: "ARM assembler", aliases: ["armasm", "arm"] },
        { language: "ASPX", aliases: ["aspx"] },
        { language: "ASP.NET (C#)", aliases: ["aspx-csharp"] },
        { language: "ASP.NET (VB)", aliases: ["aspx-vb"] },
        { language: "AzCopy", aliases: ["azcopy"] },
        { language: "Azure CLI", aliases: ["azurecli"] },
        { language: "Azure CLI (Interactive)", aliases: ["azurecli-interactive"] },
        { language: "Azure Powershell", aliases: ["azurepowershell"] },
        { language: "Azure Powershell (Interactive)", aliases: ["azurepowershell-interactive"] },
        { language: "Bash", aliases: ["bash", "sh", "zsh"], extensions: [".sh", ".bash"] },
        { language: "C", aliases: ["c"], extensions: [".c"] },
        { language: "C#", aliases: ["csharp", "cs"], extensions: [".cs"] },
        { language: "C# (Interactive)", aliases: ["csharp-interactive"] },
        { language: "C++", aliases: ["cpp", "c", "cc", "h", "c++", "h++", "hpp"], extensions: [".cpp", ".h", ".hpp", ".cc"] },
        { language: "C++/CX", aliases: ["cppcx"] },
        { language: "C++/WinRT", aliases: ["cppwinrt"] },
        { language: "CSS", aliases: ["css"] },
        { language: "DAX Power BI", aliases: ["dax"] },
        { language: "DOS", aliases: ["dos", "bat", "cmd"], extensions: [".bat", ".cmd"] },
        { language: "Dockerfile", aliases: ["dockerfile", "docker"] },
        { language: "F#", aliases: ["fsharp", "fs"], extensions: [".fs", ".fsi", ".fsx"] },
        { language: "Go", aliases: ["go", "golang"], extensions: [".go"] },
        { language: "Gradle", aliases: ["gradle"] },
        { language: "Groovy", aliases: ["groovy"] },
        { language: "HashiCorp Configuration Language (HCL)", aliases: ["terraform", "tf", "hcl"] },
        { language: "HTML", aliases: ["html", "xhtml"], extensions: [".html", ".xhtml"] },
        { language: "HTTP", aliases: ["http", "https"] },
        { language: "Ini", aliases: ["ini"], extensions: [".ini"] },
        { language: "JSON", aliases: ["json"], extensions: [".json"] },
        { language: "Java", aliases: ["java", "jsp"], extensions: [".java", ".jsp"] },
        { language: "JavaScript", aliases: ["javascript", "js", "jsx"], extensions: [".js", ".jsx"] },
        { language: "Kotlin", aliases: ["kotlin", "kt"] },
        { language: "Kusto", aliases: ["kusto"] },
        { language: "Makefile", aliases: ["makefile", "mk", "mak"], extensions: [".gmk", ".mk", ".mak"] },
        { language: "Markdown", aliases: ["markdown", "md", "mkdown", "mkd"], extensions: [".md", ".markdown", ".mdown", ".mkd", ".mdwn", ".mdtxt", ".mdtext", ".rmd"] },
        { language: "Managed Object Format", aliases: ["mof"] },
        { language: "MS Graph (Interactive)", aliases: ["msgraph-interactive"] },
        { language: "Nginx", aliases: ["nginx", "nginxconf"] },
        { language: "Node.js", aliases: ["nodejs"] },
        { language: "Objective C", aliases: ["objectivec", "mm", "objc", "obj-c"], extensions: [".m", ".h"] },
        { language: "Odata", aliases: ["odata"] },
        { language: "PHP", aliases: ["php", "php3", "php4", "php5", "php6"], extensions: [".php", ".php3", ".php4", ".php5", ".phtml"] },
        { language: "PowerApps Formula", aliases: ["powerappsfl"] },
        { language: "PowerShell", aliases: ["powershell", "ps"], extensions: [".ps", ".ps1", ".psd1", ".psm1"] },
        { language: "PowerShell (Interactive)", aliases: ["powershell-interactive"] },
        { language: "Properties", aliases: ["properties"] },
        { language: "Protocol Buffers", aliases: ["protobuf"] },
        { language: "Python", aliases: ["python", "py", "gyp"], extensions: [".py"] },
        { language: "Q#", aliases: ["qsharp"] },
        { language: "R", aliases: ["r"], extensions: [".r"] },
        { language: "Razor CSHTML", aliases: ["cshtml", "razor", "razor-cshtml"], extensions: [".cshtml", ".razor"] },
        { language: "REST API", aliases: ["rest"] },
        { language: "Ruby", aliases: ["ruby", "rb", "gemspec", "podspec", "thor", "irb"], extensions: [".rb"] },
        { language: "SQL", aliases: ["sql"], extensions: [".sql"] },
        { language: "Scala", aliases: ["scala"], extensions: [".scala", ".sc"] },
        { language: "Solidity", aliases: ["solidity", "sol"] },
        { language: "Swift", aliases: ["swift"], extensions: [".swift"] },
        { language: "Transact-SQL", aliases: ["tsql"] },
        { language: "TypeScript", aliases: ["typescript", "ts"], extensions: [".ts", ".d.ts"] },
        { language: "VB.NET", aliases: ["vbnet", "vb"], extensions: [".vb", ".bas", ".vba"] },
        { language: "VB for Applications", aliases: ["vba"], extensions: [".vba"] },
        { language: "VBScript", aliases: ["vbscript", "vbs"], extensions: [".vbs"] },
        { language: "VSTS CLI", aliases: ["vstscli"] },
        { language: "XAML", aliases: ["xaml"], extensions: [".xaml"] },
        { language: "XML", aliases: ["xml", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"], extensions: [".xml", ".xhtml", ".rss", ".atom", ".xjb", ".xsd", ".xsl", ".plist", ".xml", ".csdl", ".edmx", ".xslt", ".wsdl"] },
        { language: "YAML", aliases: ["yml", "yaml"], extensions: ["yml", "yaml"] },
    ];

/**
 * All of the possible aliases concatenated together.
 */
const allAliases: string[] =
    languages.reduce((aliases, lang) => aliases.concat(lang.aliases), [""]);

/**
 * Validates whether or not a given language is going to render correctly with syntax highlighting.
 */
function isValidCodeLang(language: string) {
    return allAliases.some((alias) => alias === language.toLowerCase());
}

export async function insertLanguageIdentifier(range: Range) {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    const selection = range || editor.selection;
    if (selection) {
        const items = getLanguageIdentifierQuickPickItems();
        const item = await window.showQuickPick(items);
        if (item) {
            const language = languages.find((lang) => lang.language === item.label);
            if (language) {
                const alias = language.aliases[0];
                insertContentToEditor(editor, "insertLanguageIdentifier", alias, true, selection);
            }
        }
    } else {
        window.showWarningMessage("Please first make a selection to insert a language identifier.");
    }
}

export function getLanguageIdentifierQuickPickItems() {
    const items: QuickPickItem[] = [];
    const langs = getConfiguredLanguages();
    if (langs) {
        langs.forEach((lang) => {
            const item: QuickPickItem = {
                description: `Use the "${lang.language.trim()}" language identifer (alias: ${lang.aliases[0]}).`,
                label: lang.language,
            };
            items.push(item);
        });
    }

    return items;
}

function getLanguageIdentifierCompletionItems(range: Range | undefined, isCancellationRequested: boolean) {
    if (range) {
        const completionItems: CompletionItem[] = [];
        const langs = getConfiguredLanguages();
        if (langs) {
            langs.forEach((lang) => {
                const langId = lang.aliases[0];
                const markdownSample = new MarkdownString("Output:");
                markdownSample.appendCodeblock("", langId);

                const item = new CompletionItem(lang.language, CompletionItemKind.Value);
                item.detail = markdownSample.value;
                item.documentation = new MarkdownString(`Use the _${lang.language}_ language identifer (alias: _${langId}_).`);
                item.insertText = new SnippetString(`${langId}\n$0\n\`\`\``);
                item.sortText = lang.language;

                completionItems.push(item);
            });
        }

        return isCancellationRequested
            ? undefined
            : completionItems;
    }

    return undefined;
}

function getConfiguredLanguages() {
    const configuration = workspace.getConfiguration("markdown");
    if (!configuration) {
        return languages;
    }

    const docsetLanguages = configuration.docsetLanguages as string[];
    const result = configuration.allAvailableLanguages || !docsetLanguages || !docsetLanguages.length
        ? languages
        : languages.filter((lang) => docsetLanguages.some((langId) => langId === lang.language));

    result.sort((lang1, lang2) => naturalLanguageCompare(lang1.language, lang2.language));

    return result;
}

export const markdownCompletionItemsProvider: CompletionItemProvider = {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        const range = document.getWordRangeAtPosition(position, /```/);
        if (range) {
            const text = document.getText();
            if (text) {
                const TRIPLE_BACKTICK_RE = /```/gm;
                const results = matchAll(TRIPLE_BACKTICK_RE, text);
                if (results) {
                    for (let i = 0; i < results.length; ++i) {
                        if (i % 2 === 0) {
                            const match = results[i];
                            if (match) {
                                const index = match.index || -1;
                                const pos = document.positionAt(index);
                                const positionIsInRange =
                                    pos.line === range.start.line && pos.character >= range.start.character ||
                                    pos.line === range.end.line && pos.character <= range.end.character;
                                if (index >= 0 && positionIsInRange) {
                                    return getLanguageIdentifierCompletionItems(range, token.isCancellationRequested);
                                }
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    },
};

export const markdownCodeActionProvider: CodeActionProvider = {
    provideCodeActions(document: TextDocument, _: Range, context: CodeActionContext, token: CancellationToken) {
        const CODE_FENCE_RE = /`{3,4}(.*?[^```])$/gm;
        const text = document.getText();
        const results: CodeAction[] = [];
        for (const matches of matchAll(CODE_FENCE_RE, text).filter((ms) => !!ms)) {
            if (matches) {
                const lang = matches[1] || undefined;
                if (!!lang && lang !== "\r" && lang !== "\n") {
                    const index = matches.index || -1;
                    if (lang && index >= 0) {
                        if (!isValidCodeLang(lang)) {
                            const action =
                                new CodeAction(
                                    `Click to fix unrecognized "${lang}" code-fence language identifer`,
                                    CodeActionKind.QuickFix);

                            const indexWithOffset = index + 3; // Account for "```".
                            const startPosition = document.positionAt(indexWithOffset);
                            const endPosition = document.positionAt(indexWithOffset + lang.length);
                            const range = new Range(startPosition, endPosition);
                            const diagnostics =
                                new Diagnostic(
                                    range,
                                    "Select from available code-fence language identifiers",
                                    DiagnosticSeverity.Warning);
                            (action.diagnostics || (action.diagnostics = [])).push(diagnostics);

                            action.command = {
                                arguments: [range],
                                command: "insertLanguageIdentifier",
                                title: "Insert language identifier",
                                tooltip: "Select from the available language identifiers.",
                            };

                            results.push(action);
                        }
                    }
                }
            }
        }

        return token.isCancellationRequested
            ? undefined
            : results;
    },
};
