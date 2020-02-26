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
const vscode_1 = require("vscode");
const common_1 = require("./common");
function insertLanguageCommands() {
    return [
        { command: insertLanguageIdentifier.name, callback: insertLanguageIdentifier },
    ];
}
exports.insertLanguageCommands = insertLanguageCommands;
/**
 * The various syntax highlighting languages available.
 * Source langs: https://raw.githubusercontent.com/DuncanmaMSFT/highlight.js/master/README.md
 * If this changes, we need to update "contributes/configuration/markdown.docsetLanguages" schema.
 */
exports.languages = [
    { language: ".NET Core CLI", aliases: ["dotnetcli"] },
    { language: "1C", aliases: ["1c"] },
    { language: "ABNF", aliases: ["abnf"] },
    { language: "Access logs", aliases: ["accesslog"] },
    { language: "Ada", aliases: ["ada"] },
    { language: "ARM assembler", aliases: ["armasm", "arm"] },
    { language: "AVR assembler", aliases: ["avrasm"] },
    { language: "ActionScript", aliases: ["actionscript", "as"], extensions: [".as"] },
    { language: "Alan", aliases: ["alan", "i"] },
    { language: "AngelScript", aliases: ["angelscript", "asc"] },
    { language: "ANTLR", aliases: ["antlr"] },
    { language: "Apache", aliases: ["apache", "apacheconf"] },
    { language: "AppleScript", aliases: ["applescript", "osascript"] },
    { language: "Arcade", aliases: ["arcade"] },
    { language: "AsciiDoc", aliases: ["asciidoc", "adoc"] },
    { language: "AspectJ", aliases: ["aspectj"] },
    { language: "ASPX", aliases: ["aspx"] },
    { language: "ASP.NET (C#)", aliases: ["aspx-csharp"] },
    { language: "ASP.NET (VB)", aliases: ["aspx-vb"] },
    { language: "AutoHotkey", aliases: ["autohotkey"] },
    { language: "AutoIt", aliases: ["autoit"] },
    { language: "Awk", aliases: ["awk", "mawk", "nawk", "gawk"] },
    { language: "Axapta", aliases: ["axapta"] },
    { language: "AzCopy", aliases: ["azcopy"] },
    { language: "Azure CLI", aliases: ["azurecli"] },
    { language: "Azure CLI (Interactive)", aliases: ["azurecli-interactive"] },
    { language: "Azure Powershell", aliases: ["azurepowershell"] },
    { language: "Azure Powershell (Interactive)", aliases: ["azurepowershell-interactive"] },
    { language: "Bash", aliases: ["bash", "sh", "zsh"], extensions: [".sh", ".bash"] },
    { language: "Basic", aliases: ["basic"] },
    { language: "BNF", aliases: ["bnf"] },
    { language: "C", aliases: ["c"], extensions: [".c"] },
    { language: "C#", aliases: ["csharp", "cs"], extensions: [".cs"] },
    { language: "C# (Interactive)", aliases: ["csharp-interactive"] },
    { language: "C++", aliases: ["cpp", "c", "cc", "h", "c++", "h++", "hpp"], extensions: [".cpp", ".h", ".hpp", ".cc"] },
    { language: "C++/CX", aliases: ["cppcx"] },
    { language: "C++/WinRT", aliases: ["cppwinrt"] },
    { language: "C/AL", aliases: ["cal"] },
    { language: "Cache Object Script", aliases: ["cos", "cls"] },
    { language: "CMake", aliases: ["cmake", "cmake.in"] },
    { language: "Coq", aliases: ["coq"] },
    { language: "CSP", aliases: ["csp"] },
    { language: "CSS", aliases: ["css"] },
    { language: "Cap’n Proto", aliases: ["capnproto", "capnp"] },
    { language: "Clojure", aliases: ["clojure", "clj"] },
    { language: "CoffeeScript", aliases: ["coffeescript", "coffee", "cson", "iced"] },
    { language: "Crmsh", aliases: ["crmsh", "crm", "pcmk"] },
    { language: "Crystal", aliases: ["crystal", "cr"] },
    { language: "Cypher (Neo4j)", aliases: ["cypher"] },
    { language: "D", aliases: ["d"], extensions: [".d"] },
    { language: "DAX Power BI", aliases: ["dax"] },
    { language: "DNS Zone file", aliases: ["dns", "zone", "bind"] },
    { language: "DOS", aliases: ["dos", "bat", "cmd"], extensions: [".bat", ".cmd"] },
    { language: "Dart", aliases: ["dart"] },
    { language: "Delphi", aliases: ["delphi", "dpr", "dfm", "pas", "pascal", "freepascal", "lazarus", "lpr", "lfm"] },
    { language: "Diff", aliases: ["diff", "patch"] },
    { language: "Django", aliases: ["django", "jinja"] },
    { language: "Dockerfile", aliases: ["dockerfile", "docker"] },
    { language: "dsconfig", aliases: ["dsconfig"] },
    { language: "DTS (Device Tree)", aliases: ["dts"] },
    { language: "Dust", aliases: ["dust", "dst"] },
    { language: "Dylan", aliases: ["dylan"] },
    { language: "EBNF", aliases: ["ebnf"] },
    { language: "Elixir", aliases: ["elixir"] },
    { language: "Elm", aliases: ["elm"] },
    { language: "Erlang", aliases: ["erlang", "erl"], extensions: [".erl"] },
    { language: "Excel", aliases: ["excel", "xls", "xlsx"] },
    { language: "Extempore", aliases: ["extempore", "xtlang", "xtm"] },
    { language: "F#", aliases: ["fsharp", "fs"], extensions: [".fs", ".fsi", ".fsx"] },
    { language: "FIX", aliases: ["fix"] },
    { language: "Fortran", aliases: ["fortran", "f90", "f95"] },
    { language: "G-Code", aliases: ["gcode", "nc"] },
    { language: "Gams", aliases: ["gams", "gms"] },
    { language: "GAUSS", aliases: ["gauss", "gss"] },
    { language: "GDScript", aliases: ["godot", "gdscript"] },
    { language: "Gherkin", aliases: ["gherkin"] },
    { language: "GN for Ninja", aliases: ["gn", "gni"] },
    { language: "Go", aliases: ["go", "golang"], extensions: [".go"] },
    { language: "Golo", aliases: ["golo", "gololang"] },
    { language: "Gradle", aliases: ["gradle"] },
    { language: "Groovy", aliases: ["groovy"] },
    { language: "HTML", aliases: ["html", "xhtml"], extensions: [".html", ".xhtml"] },
    { language: "HTTP", aliases: ["http", "https"] },
    { language: "Haml", aliases: ["haml"] },
    { language: "Handlebars", aliases: ["handlebars", "hbs", "html.hbs", "html.handlebars"] },
    { language: "Haskell", aliases: ["haskell", "hs"] },
    { language: "Haxe", aliases: ["haxe", "hx"] },
    { language: "Hy", aliases: ["hy", "hylang"] },
    { language: "Ini", aliases: ["ini"], extensions: [".ini"] },
    { language: "Inform7", aliases: ["inform7", "i7"] },
    { language: "IRPF90", aliases: ["irpf90"] },
    { language: "JSON", aliases: ["json"], extensions: [".json"] },
    { language: "Java", aliases: ["java", "jsp"], extensions: [".java", ".jsp"] },
    { language: "JavaScript", aliases: ["javascript", "js", "jsx"], extensions: [".js", ".jsx"] },
    { language: "Kotlin", aliases: ["kotlin", "kt"] },
    { language: "Kusto", aliases: ["kusto"] },
    { language: "Leaf", aliases: ["leaf"] },
    { language: "Lasso", aliases: ["lasso", "ls", "lassoscript"] },
    { language: "Less", aliases: ["less"], extensions: [".less"] },
    { language: "LDIF", aliases: ["ldif"] },
    { language: "Lisp", aliases: ["lisp"], extensions: [".lisp", ".lsp"] },
    { language: "LiveCode Server", aliases: ["livecodeserver"] },
    { language: "LiveScript", aliases: ["livescript", "ls"] },
    { language: "Lua", aliases: ["lua"], extensions: [".lua"] },
    { language: "Makefile", aliases: ["makefile", "mk", "mak"], extensions: [".gmk", ".mk", ".mak"] },
    { language: "Markdown", aliases: ["markdown", "md", "mkdown", "mkd"], extensions: [".md", ".markdown", ".mdown", ".mkd", ".mdwn", ".mdtxt", ".mdtext", ".rmd"] },
    { language: "Mathematica", aliases: ["mathematica", "mma", "wl"] },
    { language: "Matlab", aliases: ["matlab"], extensions: [".matlab"] },
    { language: "Maxima", aliases: ["maxima"] },
    { language: "Maya Embedded Language", aliases: ["mel"] },
    { language: "Mercury", aliases: ["mercury"] },
    { language: "mIRC Scripting Language", aliases: ["mirc", "mrc"] },
    { language: "Mizar", aliases: ["mizar"] },
    { language: "Managed Object Format", aliases: ["mof"] },
    { language: "Mojolicious", aliases: ["mojolicious"] },
    { language: "Monkey", aliases: ["monkey"] },
    { language: "Moonscript", aliases: ["moonscript", "moon"] },
    { language: "MS Graph (Interactive)", aliases: ["msgraph-interactive"] },
    { language: "N1QL", aliases: ["n1ql"] },
    { language: "NSIS", aliases: ["nsis"] },
    { language: "Nginx", aliases: ["nginx", "nginxconf"] },
    { language: "Nimrod", aliases: ["nimrod", "nim"] },
    { language: "Nix", aliases: ["nix"] },
    { language: "OCaml", aliases: ["ocaml", "ml"] },
    { language: "Objective C", aliases: ["objectivec", "mm", "objc", "obj-c"], extensions: [".m", ".h"] },
    { language: "OpenGL Shading Language", aliases: ["glsl"] },
    { language: "OpenSCAD", aliases: ["openscad", "scad"] },
    { language: "Oracle Rules Language", aliases: ["ruleslanguage"] },
    { language: "Oxygene", aliases: ["oxygene"] },
    { language: "PF", aliases: ["pf", "pf.conf"] },
    { language: "PHP", aliases: ["php", "php3", "php4", "php5", "php6"], extensions: [".php", ".php3", ".php4", ".php5", ".phtml"] },
    { language: "Parser3", aliases: ["parser3"] },
    { language: "Perl", aliases: ["perl", "pl", "pm"], extensions: [".pl"] },
    { language: "Plaintext no highlight", aliases: ["plaintext"] },
    { language: "Pony", aliases: ["pony"] },
    { language: "PostgreSQL & PL/pgSQL", aliases: ["pgsql", "postgres", "postgresql"] },
    { language: "PowerShell", aliases: ["powershell", "ps"], extensions: [".ps", ".ps1", ".psd1", ".psm1"] },
    { language: "PowerShell (Interactive)", aliases: ["powershell-interactive"] },
    { language: "Processing", aliases: ["processing"] },
    { language: "Prolog", aliases: ["prolog"] },
    { language: "Properties", aliases: ["properties"] },
    { language: "Protocol Buffers", aliases: ["protobuf"] },
    { language: "Puppet", aliases: ["puppet", "pp"] },
    { language: "Python", aliases: ["python", "py", "gyp"], extensions: [".py"] },
    { language: "Python profiler results", aliases: ["profile"] },
    { language: "Q#", aliases: ["qsharp"] },
    { language: "Q", aliases: ["k", "kdb"] },
    { language: "QML", aliases: ["qml"] },
    { language: "R", aliases: ["r"], extensions: [".r"] },
    { language: "Razor CSHTML", aliases: ["cshtml", "razor", "razor-cshtml"], extensions: [".cshtml", ".razor"] },
    { language: "ReasonML", aliases: ["reasonml", "re"] },
    { language: "RenderMan RIB", aliases: ["rib"] },
    { language: "RenderMan RSL", aliases: ["rsl"] },
    { language: "Roboconf", aliases: ["graph", "instances"] },
    { language: "Robot Framework", aliases: ["robot", "rf"] },
    { language: "RPM spec files", aliases: ["rpm-specfile", "rpm", "spec", "rpm-spec", "specfile"] },
    { language: "Ruby", aliases: ["ruby", "rb", "gemspec", "podspec", "thor", "irb"], extensions: [".rb"] },
    { language: "Rust", aliases: ["rust", "rs"], extensions: [".rs", ".rust"] },
    { language: "SAS", aliases: ["SAS", "sas"] },
    { language: "SCSS", aliases: ["scss"], extensions: [".scss"] },
    { language: "SQL", aliases: ["sql"], extensions: [".sql"] },
    { language: "STEP Part 21", aliases: ["p21", "step", "stp"] },
    { language: "Scala", aliases: ["scala"], extensions: [".scala", ".sc"] },
    { language: "Scheme", aliases: ["scheme"] },
    { language: "Scilab", aliases: ["scilab", "sci"] },
    { language: "Shape Expressions", aliases: ["shexc"] },
    { language: "Shell", aliases: ["shell", "console"] },
    { language: "Smali", aliases: ["smali"] },
    { language: "Smalltalk", aliases: ["smalltalk", "st"] },
    { language: "Solidity", aliases: ["solidity", "sol"] },
    { language: "Stan", aliases: ["stan"] },
    { language: "Stata", aliases: ["stata"] },
    { language: "Structured Text", aliases: ["iecst", "scl", "stl", "structured-text"] },
    { language: "Stylus", aliases: ["stylus", "styl"] },
    { language: "SubUnit", aliases: ["subunit"] },
    { language: "Supercollider", aliases: ["supercollider", "sc"] },
    { language: "Swift", aliases: ["swift"], extensions: [".swift"] },
    { language: "Tcl", aliases: ["tcl", "tk"] },
    { language: "Terraform (HCL)", aliases: ["terraform", "tf", "hcl"] },
    { language: "Test Anything Protocol", aliases: ["tap"] },
    { language: "TeX", aliases: ["tex"] },
    { language: "Thrift", aliases: ["thrift"] },
    { language: "TOML", aliases: ["toml"], extensions: [".toml"] },
    { language: "TP", aliases: ["tp"] },
    { language: "Twig", aliases: ["twig", "craftcms"] },
    { language: "TypeScript", aliases: ["typescript", "ts"], extensions: [".ts", ".d.ts"] },
    { language: "VB.NET", aliases: ["vbnet", "vb"], extensions: [".vb", ".bas", ".vba"] },
    { language: "VBScript", aliases: ["vbscript", "vbs"], extensions: [".vbs"] },
    { language: "VHDL", aliases: ["vhdl"] },
    { language: "Vala", aliases: ["vala"] },
    { language: "Verilog", aliases: ["verilog", "v"] },
    { language: "Vim Script", aliases: ["vim"] },
    { language: "X++", aliases: ["xpp"], extensions: [".xpp"] },
    { language: "x86 Assembly", aliases: ["x86asm"] },
    { language: "XL", aliases: ["xl", "tao"] },
    { language: "XQuery", aliases: ["xquery", "xpath", "xq"] },
    { language: "XAML", aliases: ["xaml"], extensions: [".xaml"] },
    { language: "XML", aliases: ["xml", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"], extensions: [".xml", ".xhtml", ".rss", ".atom", ".xjb", ".xsd", ".xsl", ".plist", ".xml", ".csdl", ".edmx", ".xslt", ".wsdl"] },
    { language: "YAML", aliases: ["yml", "yaml"], extensions: ["yml", "yaml"] },
    { language: "Zephir", aliases: ["zephir", "zep"] },
];
/**
 * All of the possible aliases concatenated together.
 */
const allAliases = exports.languages.reduce((aliases, lang) => aliases.concat(lang.aliases), [""]);
/**
 * Validates whether or not a given language is going to render correctly with syntax highlighting.
 */
function isValidCodeLang(language) {
    return allAliases.some((alias) => alias === language.toLowerCase());
}
function insertLanguageIdentifier(range) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        const selection = range || editor.selection;
        if (selection) {
            const items = getLanguageIdentifierQuickPickItems();
            const item = yield vscode_1.window.showQuickPick(items);
            if (item) {
                const language = exports.languages.find((lang) => lang.language === item.label);
                if (language) {
                    const alias = language.aliases[0];
                    common_1.insertContentToEditor(editor, "insertLanguageIdentifier", alias, true, selection);
                }
            }
        }
        else {
            vscode_1.window.showWarningMessage("Please first make a selection to insert a language identifier.");
        }
    });
}
exports.insertLanguageIdentifier = insertLanguageIdentifier;
function getLanguageIdentifierQuickPickItems() {
    const items = [];
    const langs = getConfiguredLanguages();
    if (langs) {
        langs.forEach((lang) => {
            const item = {
                description: `Use the "${lang.language.trim()}" language identifer (alias: ${lang.aliases[0]}).`,
                label: lang.language,
            };
            items.push(item);
        });
    }
    return items;
}
exports.getLanguageIdentifierQuickPickItems = getLanguageIdentifierQuickPickItems;
function getLanguageIdentifierCompletionItems(range, isCancellationRequested) {
    if (range) {
        const completionItems = [];
        const langs = getConfiguredLanguages();
        if (langs) {
            langs.forEach((lang) => {
                const langId = lang.aliases[0];
                const markdownSample = new vscode_1.MarkdownString();
                markdownSample.appendText("*Output:*");
                markdownSample.appendCodeblock("", langId);
                const item = new vscode_1.CompletionItem(lang.language, vscode_1.CompletionItemKind.Value);
                item.detail = markdownSample.value;
                item.documentation = new vscode_1.MarkdownString(`Use the _${lang.language}_ language identifer (alias: _${langId}_).`);
                item.insertText = new vscode_1.SnippetString(`${langId}\n$0\n\`\`\``);
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
    const configuration = vscode_1.workspace.getConfiguration("markdown");
    if (!configuration) {
        return exports.languages;
    }
    const docsetLanguages = configuration.docsetLanguages;
    const result = configuration.allAvailableLanguages || !docsetLanguages || !docsetLanguages.length
        ? exports.languages
        : exports.languages.filter((lang) => docsetLanguages.some((langId) => langId === lang.language));
    result.sort((lang1, lang2) => common_1.naturalLanguageCompare(lang1.language, lang2.language));
    return result;
}
exports.markdownCompletionItemsProvider = {
    provideCompletionItems(document, position, token, context) {
        const range = document.getWordRangeAtPosition(position, /```/);
        if (range) {
            const text = document.getText();
            if (text) {
                const TRIPLE_BACKTICK_RE = /```/gm;
                const results = common_1.matchAll(TRIPLE_BACKTICK_RE, text);
                if (results) {
                    for (let i = 0; i < results.length; ++i) {
                        if (i % 2 === 0) {
                            const match = results[i];
                            if (match) {
                                const index = match.index || -1;
                                const pos = document.positionAt(index);
                                const positionIsInRange = pos.line === range.start.line && pos.character >= range.start.character ||
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
exports.markdownCodeActionProvider = {
    provideCodeActions(document, _, context, token) {
        const CODE_FENCE_RE = /`{3,4}(.*?[^```])$/gm;
        const text = document.getText();
        const results = [];
        for (const matches of common_1.matchAll(CODE_FENCE_RE, text).filter((ms) => !!ms)) {
            if (matches) {
                const lang = matches[1] || undefined;
                if (!!lang && lang !== "\r" && lang !== "\n") {
                    const index = matches.index || -1;
                    if (lang && index >= 0) {
                        if (!isValidCodeLang(lang)) {
                            const action = new vscode_1.CodeAction(`Click to fix "${lang}" unrecognized code-fence language identifer`, vscode_1.CodeActionKind.QuickFix);
                            const indexWithOffset = index + 3; // Account for "```".
                            const startPosition = document.positionAt(indexWithOffset);
                            const endPosition = document.positionAt(indexWithOffset + lang.length);
                            const range = new vscode_1.Range(startPosition, endPosition);
                            const diagnostics = new vscode_1.Diagnostic(range, "Select from available code-fence language identifiers", vscode_1.DiagnosticSeverity.Warning);
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
//# sourceMappingURL=highlight-langs.js.map