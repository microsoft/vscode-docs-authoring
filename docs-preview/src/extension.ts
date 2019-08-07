"use strict";

import { rename } from "fs";
import { basename } from "path";
import { commands, ExtensionContext, TextDocument, window } from "vscode";
import { codeSnippets } from "./codesnippets/codesnippet";
import { sendTelemetryData } from "./helper/common";
import { Reporter } from "./helper/telemetry";
import { xref } from "./xref/xref";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
export const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const telemetryCommand: string = "preview";

export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    const disposableSidePreview = commands.registerCommand("docs.showPreviewToSide", (uri) => {
        commands.executeCommand("markdown.showPreviewToSide");
        const commandOption = "show-preview-to-side";
        sendTelemetryData(telemetryCommand, commandOption);
    });
    const disposableStandalonePreview = commands.registerCommand("docs.showPreview", (uri) => {
        commands.executeCommand("markdown.showPreview");
        const commandOption = "show-preview-tab";
        sendTelemetryData(telemetryCommand, commandOption);
    });
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview);
    return {
        extendMarkdownIt(md) {
            const filePath = window.activeTextEditor.document.fileName;
            const workingPath = filePath.replace(basename(filePath), "");
            return md.use(require("markdown-it-include"), { root: workingPath, includeRe: INCLUDE_RE })
                .use(codeSnippets, { root: workingPath })
                .use(xref)
                .use(custom_codeblock)
                .use(container_plugin, "row", {
                    marker: ":",
                    validate(params) {
                        return params.trim().match(/row:::/g) || params.trim().match(/row-end:::/g);
                    },
                    render(tokens, idx) {
                        if (tokens[idx].info.trim().match(/row:::/g)) {
                            // opening tag
                            return "<div class='row'>";
                        } else {
                            // closing tag
                            return "</div>";
                        }
                    },
                })
                .use(container_plugin, "column", {
                    marker: ":",
                    validate(params) {
                        return params.trim().match(/column(\s+span="([1-9]+)?")?:::/g) || params.trim().match(/column-end:::/g);
                    },
                    render(tokens, idx) {
                        const RE = /column((\s+)span="([1-9]+)?")?:::/g;
                        const start = RE.exec(tokens[idx].info.trim());
                        if (start) {
                            if (start[3]) {
                                return `<div class='column span${start[3]}'>`;
                            } else {
                                // opening tag
                                return "<div class='column'>";
                            }
                        } else {
                            // closing tag
                            return "</div>";
                        }
                    },
                });
        },
    };
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"; // prevent processing of own documents
}

export function container_plugin(md, name, options) {
    options = options || {};
    let min_markers = 3,
        marker_str = options.marker,
        marker_len = marker_str.length,
        marker_char = marker_str.charCodeAt(0),
        validate = options.validate,
        render = options.render;

    function container(state, startLine, endLine, silent) {
        let pos, nextLine, marker_count, markup, params, token,
            old_parent, old_line_max,
            auto_closed = false,
            start = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];

        // Check out the first character quickly,
        // this should filter out most of non-containers
        //
        if (marker_char !== state.src.charCodeAt(start)) { return false; }

        // Check out the rest of the marker string
        //
        for (pos = start; pos <= max; pos++) {
            if (":" !== state.src[pos]) {
                break;
            }
        }
        // marker_count = Math.floor((pos - start) / marker_len);
        // if (marker_count < min_markers) { return false; }

        pos -= (pos - start) % marker_len;

        markup = state.src.slice(start, pos);
        params = state.src.slice(pos, max);
        if (!validate(params)) { return false; }

        // Since start is found, we can report success here in validation mode
        //
        if (silent) { return true; }

        // Search for the end of the block
        //
        nextLine = startLine;

        for (; ;) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            // if (start < max && state.sCount[nextLine] < state.blkIndent) {
            //     // non-empty line with negative indent should stop the list:
            //     // - ```
            //     //  test
            //     break;
            // }

            if (marker_char !== state.src.charCodeAt(start)) { continue; }

            if (state.sCount[nextLine] - state.blkIndent >= 4) {
                // closing fence should be indented less than 4 spaces
                continue;
            }

            for (pos = start; pos <= max; pos++) {
                if (":" !== state.src[pos]) {
                    break;
                }
            }

            // closing code fence must be at least as long as the opening one
            if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

            // make sure tail has spaces only
            pos -= (pos - start) % marker_len;
            pos = state.skipSpaces(pos);

            if (pos < max) { continue; }

            // found!
            auto_closed = true;
            break;
        }

        old_parent = state.parentType;
        old_line_max = state.lineMax;
        state.parentType = "container";

        // this will prevent lazy continuations from ever going past our end marker
        state.lineMax = nextLine;

        token = state.push("container_" + name + "_open", "div", 1);
        token.markup = markup;
        token.block = true;
        token.info = params;
        token.map = [startLine, nextLine];

        state.md.block.tokenize(state, startLine + 1, nextLine);

        token = state.push("container_" + name + "_close", "div", -1);
        token.markup = state.src.slice(start, pos);
        token.block = true;

        state.parentType = old_parent;
        state.lineMax = old_line_max;
        state.line = nextLine + (auto_closed ? 1 : 0);

        return true;
    }

    md.block.ruler.before("code", "container_" + name, container, {
        alt: [],
    });
    md.renderer.rules["container_" + name + "_open"] = render;
    md.renderer.rules["container_" + name + "_close"] = render;
}

export function custom_codeblock(md, options) {
    const CODEBLOCK_RE = /([ ]{4})/g;
    const replaceCodeSnippetWithContents = (src: string) => {
        let captureGroup;
        while ((captureGroup = CODEBLOCK_RE.exec(src))) {
            src = src.slice(0, captureGroup.index) + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        }
        return src;
    };

    const removeClodeblock = (state) => {
        try {
            state.src = replaceCodeSnippetWithContents(state.src);
        } catch (error) {
            output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "codesnippet", removeClodeblock);
}
