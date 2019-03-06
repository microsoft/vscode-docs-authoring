"use strict";

import * as vscode from "vscode";
import { reporter } from "../telemetry/telemetry";
import { window, workspace } from "vscode";
import { readdir, stat, unlinkSync, readFile, writeFile, write, readFileSync, writeFileSync } from "fs";
import { join, resolve, dirname, basename } from "path";
import { output } from "../extension";
const jsyaml = require("js-yaml");
const telemetryCommand: string = "applyCleanup";
const replace = require('replace-in-file');
const yaml = require('yaml')

export function applyCleanupCommand() {
    const commands = [
        { command: applyCleanup.name, callback: applyCleanup },
    ];
    return commands;
}

export function applyCleanup() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const opts: vscode.QuickPickOptions = { placeHolder: "Cleanup..." };
    const items: vscode.QuickPickItem[] = [];
    items.push({
        description: "",
        label: "Single-valued metadata",
    });
    items.push({
        description: "",
        label: "Microsoft links",
    });
    items.push({
        description: "",
        label: "Capitalization of metadata values",
    });

    window.showQuickPick(items).then((selection) => {
        if (!selection) {
            return;
        }

        switch (selection.label.toLowerCase()) {
            case "single-valued metadata":
                handleSingValuedMetadata();
                break;
            case "microsoft links":
                microsoftLinks();
                break;
            case "capitalization of metadata values":
                capaitalizationOfMetadata();
                break;
        }
    })
}

function handleSingValuedMetadata() {
    traverseConfigFiles(workspace.rootPath, function (err: any, res: any) {
        output.appendLine(res);
    })
}

function traverseConfigFiles(dir: any, done: any) {
    var results: any[];
    if (!dir.endsWith("node_modules")
        || !dir.endsWith(".github")
        || !dir.endsWith(".vs")
        || !dir.endsWith(".vscode"))
        readdir(dir, function (err, list) {
            if (err) {
                output.appendLine(`Error: ${err}`);
                return done(err);
            }
            var pending = list.length;
            if (!pending) {
                return done(null, results);
            }
            list.filter((file: string) => {
                if (!file.toLowerCase().endsWith("toc.yml")) {
                    return file
                }
            }).map(function (file: string) {
                file = resolve(dir, file);
                stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        traverseConfigFiles(file, function (err: any, res: any) {
                            results = results.concat(res);
                            if (!--pending) {
                                done(null, results);
                            }
                        });
                    } else {
                        if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                            fixMetadata(file);
                            if (!--pending) done(null, results);
                        }
                    }
                });
            });
        });
};

function fixMetadata(file: string) {
    readFile(file, "utf8", (err, data) => {
        if (err) {
            output.appendLine(`Error: ${err}`)
        }
        let yamlContent = jsyaml.load(data);
        let author = handleSingleItemArray(yamlContent.metadata["author"])
        if (author) {
            yamlContent.metadata["author"] = author;
        }
        let msAuthor = handleSingleItemArray(yamlContent.metadata["ms.author"])
        if (msAuthor) {
            yamlContent.metadata["ms.author"] = msAuthor;
        }
        let msComponent = handleSingleItemArray(yamlContent.metadata["ms.component"])
        if (msComponent) {
            yamlContent.metadata["ms.component"] = msComponent;
        }
        let msDate = handleSingleItemArray(yamlContent.metadata["ms.date"])
        if (msDate) {
            yamlContent.metadata["ms.date"] = msDate;
        }
        let msProd = handleSingleItemArray(yamlContent.metadata["ms.prod"])
        if (msProd) {
            yamlContent.metadata["ms.prod"] = msProd;
        }
        let msService = handleSingleItemArray(yamlContent.metadata["ms.service"])
        if (msService) {
            yamlContent.metadata["ms.service"] = msService;
        }
        let msSubservice = handleSingleItemArray(yamlContent.metadata["ms.subservice"])
        if (msSubservice) {
            yamlContent.metadata["ms.subservice"] = msSubservice;
        }
        let msTechnology = handleSingleItemArray(yamlContent.metadata["ms.technology"])
        if (msTechnology) {
            yamlContent.metadata["ms.technology"] = msTechnology;
        }
        let msTopic = handleSingleItemArray(yamlContent.metadata["ms.topic"])
        if (msTopic) {
            yamlContent.metadata["ms.topic"] = msTopic;
        }
        let msTitle = handleSingleItemArray(yamlContent.metadata["ms.title"])
        if (msTitle) {
            yamlContent.metadata["ms.title"] = msTitle;
        }
        yamlContent = jsyaml.dump(yamlContent, {
            'lineWidth': 1000,
            'noCompatMode': true,
            'noArrayIndent': true,
            'skipInvalid': true
        });

        yamlContent = "### YamlMime:YamlDocument\n" + yamlContent
        ////If we want to remove null
        // let regex = new RegExp(/(?!\: )null/g)
        // yamlContent = yamlContent.replace(regex, '')
        writeFile(file, yamlContent, function (err: any) {
            if (err) {
                output.appendLine(`Error: ${err}`);
            }
        });
    });
}

function handleSingleItemArray(content: string | undefined) {
    if (content && Array.isArray(content) && content.length == 1) {
        return content[0];
    }
}

function microsoftLinks() {
    let walk = function (dir: any, done: any) {
        var results: any[];
        if (!dir.endsWith("node_modules")
            || !dir.endsWith(".github")
            || !dir.endsWith(".vs")
            || !dir.endsWith(".vscode"))
            readdir(dir, function (err, list) {
                if (err) {
                    output.appendLine(`Error: ${err}`);
                    return done(err);
                }
                var pending = list.length;
                if (!pending) {
                    return done(null, results);
                }
                list.map(function (file: string) {
                    file = resolve(dir, file);
                    stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function (err: any, res: any) {
                                results = results.concat(res);
                                if (!--pending) {
                                    done(null, results);
                                }
                            });
                        } else {
                            if (file.endsWith(".md")) {
                                replace({
                                    files: file,
                                    from: /^http:\/\//g,
                                    to: 'https://',
                                }).then((changes: any) => {
                                    console.log('Modified files:', changes.join(', '));
                                }).catch((error: any) => {
                                    console.error('Error occurred:', error);
                                });
                                replace({
                                    files: file,
                                    from: /https:\/\/docs.microsoft.com\/en-us/g,
                                    to: 'https://docs.microsoft.com',
                                }).catch((error: any) => {
                                    console.error('Error occurred:', error);
                                });
                                replace({
                                    files: file,
                                    from: /https:\/\/azure.microsoft.com\/en-us/g,
                                    to: 'https://azure.microsoft.com',
                                }).catch((error: any) => {
                                    console.error('Error occurred:', error);
                                });
                                replace({
                                    files: file,
                                    from: /https:\/\/msdn.microsoft.com\/en-us/g,
                                    to: 'https://msdn.microsoft.com',
                                }).catch((error: any) => {
                                    console.error('Error occurred:', error);
                                });
                                replace({
                                    files: file,
                                    from: /https:\/\/technet.microsoft.com\/en-us/g,
                                    to: 'https://technet.microsoft.com',
                                }).catch((error: any) => {
                                    console.error('Error occurred:', error);
                                });
                                if (!--pending) done(null, results);
                            }
                        }
                    });
                });
            });
    };
    walk(workspace.rootPath, function (err: any, res: any) {
        output.appendLine(res);
    })
}

function capaitalizationOfMetadata() {
    let walk = function (dir: any, done: any) {
        var results: any[];
        if (!dir.endsWith("node_modules")
            || !dir.endsWith(".github")
            || !dir.endsWith(".vs")
            || !dir.endsWith(".vscode"))
            readdir(dir, function (err, list) {
                if (err) {
                    output.appendLine(`Error: ${err}`);
                    return done(err);
                }
                var pending = list.length;
                if (!pending) {
                    return done(null, results);
                }
                list.map(function (file: string) {
                    file = resolve(dir, file);
                    stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function (err: any, res: any) {
                                results = results.concat(res);
                                if (!--pending) {
                                    done(null, results);
                                }
                            });
                        } else {
                            if (file.endsWith(".md")) {
                                let data = readFileSync(file, "utf8")
                                let regex = new RegExp(`^(---\\s)([^]+)(\\s---)`, 'gm');
                                let metadataMatch = data.match(regex)
                                if (metadataMatch) {
                                    let metadata = data.substr(3, metadataMatch[0].length - 6)
                                    let yamlMetadata = jsyaml.load(metadata);
                                    let msAuthor = yamlMetadata["ms.author"]
                                    if (msAuthor) {
                                        yamlMetadata["ms.author"] = msAuthor.toLowerCase();
                                    }
                                    let author = yamlMetadata["author"]
                                    if (author) {
                                        yamlMetadata["author"] = author.toLowerCase();
                                    }
                                    let msProd = yamlMetadata["ms.prod"]
                                    if (msProd) {
                                        yamlMetadata["ms.prod"] = msProd.toLowerCase();
                                    }
                                    let msService = yamlMetadata["ms.service"]
                                    if (msService) {
                                        yamlMetadata["ms.service"] = msService.toLowerCase();
                                    }
                                    let msSubservice = yamlMetadata["ms.subservice"]
                                    if (msSubservice) {
                                        yamlMetadata["ms.subservice"] = msSubservice.toLowerCase();
                                    }
                                    let msTechnology = yamlMetadata["ms.technology"]
                                    if (msTechnology) {
                                        yamlMetadata["ms.technology"] = msTechnology.toLowerCase();
                                    }
                                    let msTopic = yamlMetadata["ms.topic"]
                                    if (msTopic) {
                                        yamlMetadata["ms.topic"] = msTopic.toLowerCase();
                                    }
                                    let yamlString = `---\r\n${jsyaml.dump(yamlMetadata, {
                                        'lineWidth': 1000,
                                        'noCompatMode': true,
                                        'noArrayIndent': true,
                                        'skipInvalid': true
                                    })}\r\n---`;
                                    let update = data.replace(regex, yamlString)
                                    writeFileSync(file, update)
                                }
                                // var data = readFileSync(file, "utf8")
                                // lowerCaseMetadata(file, data, "ms.author")
                                // lowerCaseMetadata(file, data, "author")
                                // lowerCaseMetadata(file, data, "ms.prod")
                                // lowerCaseMetadata(file, data, "ms.service")
                                // lowerCaseMetadata(file, data, "ms.subservice")
                                // lowerCaseMetadata(file, data, "ms.technology")
                                // lowerCaseMetadata(file, data, "ms.topic")
                                if (!--pending) done(null, results);
                            }
                        }
                    });
                });
            });
    };
    // let file = "C:/users/brharney/source/repos/samples/azure-docs/articles/azure-glossary-cloud-terminology.md"
    // readFile(file, "utf8", (err, data) => {
    //     lowerCaseMetadata(file, data, "ms.author")
    //     lowerCaseMetadata(file, data, "author")
    //     lowerCaseMetadata(file, data, "ms.prod")
    //     lowerCaseMetadata(file, data, "ms.service")
    //     lowerCaseMetadata(file, data, "ms.subservice")
    //     lowerCaseMetadata(file, data, "ms.technology")
    //     lowerCaseMetadata(file, data, "ms.topic")
    // })
    walk(workspace.rootPath, function (err: any, res: any) {
        output.appendLine(res);
    })
}
function lowerCaseMetadata(file: string, data: any, variable: string) {
    let regex = new RegExp(`^(${variable}:\\s?)(.*\\s)`, 'gm');
    let metadata = data.match(regex)
    if (metadata) {
        let captureParts = regex.exec(data);
        let value = ''
        if (captureParts && captureParts.length > 2) {
            value = captureParts[2].toLowerCase();
            try {
                const changes = replace.sync({
                    files: file,
                    from: regex,
                    to: `${variable}: ${value}`,
                });
                console.log('Modified files:', changes.join(', '));
            }
            catch (error) {
                console.error('Error occurred:', error);
            }
        }
    }
}

// function lowerCaseMeta()
// {
//     let variable = "ms.author"
//                                         let regex = new RegExp(`^(---\\s)([^]+)(\\s---)`, 'gm');
//                                         let metadataMatch = data.match(regex)
//                                         if (metadataMatch) {
//                                             let metadata = data.substr(3, metadataMatch[0].length - 6)
//                                             let yamlMetadata = yaml.parse(metadata);
//                                             yamlMetadata[variable] = yamlMetadata[variable].toLowerCase();
//                                             metadataMatch[0] = `---\r\n${yaml.stringify(yamlMetadata)}\r\n---`
//                                             writeFile(file, data, function (err) {
//                                                 if (err) {
//                                                     output.appendLine(`Error: ${err}`)
//                                                 }
//                                             })
//                                         }
// }