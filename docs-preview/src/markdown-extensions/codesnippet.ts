import { resolve } from "path";
import { readFileSync, open } from "fs";
import { output as outputChannel } from "../extension";
import { workspace, window, Position } from "vscode";
import Axios from "axios";
import { Base64 } from "js-base64"
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

export const CODE_RE = /\[!code-(.+?)\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const ROOTPATH_RE = /.*~/gmi;
export function codeSnippets(md, options) {
  const replaceCodeSnippetWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = CODE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      let filePath = resolve(rootdir, captureGroup[2].trim());
      if (filePath.includes("~")) {
        filePath = filePath.replace(ROOTPATH_RE, repoRoot);
      }
      let mdSrc = readFileSync(filePath, "utf8");
      mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``;
      src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const importCodeSnippet = (state) => {
    try {
      state.src = replaceCodeSnippetWithContents(state.src, options.root);
    } catch (error) {
      outputChannel.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importCodeSnippet);
}

// // C# code snippet comment block: // <[/]snippetname>
// const CFamilyCodeSnippetCommentStartLineTemplate = /\/\/<{tagname}>/g;
// const CFamilyCodeSnippetCommentEndLineTemplate = /\/\/<\/{tagname}>/g;

// // C# code snippet region block: start -> #region snippetname, end -> #endregion
// const CSharpCodeSnippetRegionStartLineTemplate = /#region{tagname}/g;
// const CSharpCodeSnippetRegionEndLineTemplate = /#endregion/g;

// // VB code snippet comment block: ' <[/]snippetname>
// const BasicFamilyCodeSnippetCommentStartLineTemplate = /'<{tagname}>/g;
// const BasicFamilyCodeSnippetCommentEndLineTemplate = /'<\/{tagname}>/g;

// // VB code snippet Region block: start -> # Region /snippetname/, end -> # End Region
// const VBCodeSnippetRegionRegionStartLineTemplate = /#region {tagname}/g;
// const VBCodeSnippetRegionRegionEndLineTemplate = /#endregion/g;

// // XML code snippet block: <!-- <[/]snippetname> -->
// const MarkupLanguageFamilyCodeSnippetCommentStartLineTemplate = /<!--<{tagname}>-->/g;
// const MarkupLanguageFamilyCodeSnippetCommentEndLineTemplate = /<!--<\/{tagname}>-->/g;

// // Sql code snippet block: -- <[/]snippetname>
// const SqlFamilyCodeSnippetCommentStartLineTemplate = /--<{tagname}>/g;
// const SqlFamilyCodeSnippetCommentEndLineTemplate = /--<\/{tagname}>/g;

// // Python code snippet comment block: # <[/]snippetname>
// const ScriptFamilyCodeSnippetCommentStartLineTemplate = /#<{tagname}>/g;
// const ScriptFamilyCodeSnippetCommentEndLineTemplate = /#<\/{tagname}>/g;

// // Batch code snippet comment block: rem <[/]snippetname>
// const BatchFileCodeSnippetRegionStartLineTemplate = /rem<{tagname}>/g;
// const BatchFileCodeSnippetRegionEndLineTemplate = /rem<\/{tagname}>/g;

// // Erlang code snippet comment block: % <[/]snippetname>
// const ErlangCodeSnippetRegionStartLineTemplate = /%<{tagname}>/g;
// const ErlangCodeSnippetRegionEndLineTemplate = /%<{tagname}>/g;

// // Lisp code snippet comment block: ; <[/]snippetname>
// const LispCodeSnippetRegionStartLineTemplate = /;<{tagname}>/g;
// const LispCodeSnippetRegionEndLineTemplate = /;<{tagname}>/g;

const dict = [
  { actionscript: [".as"] },
  { arduino: [".ino"] },
  { assembly: ["nasm", ".asm"] },
  // { batchfile: [".bat", ".cmd"] },
  // { cpp: ["c", "c++", "objective-c", "obj-c", "objc", "objectivec", ".c", ".cpp", ".h", ".hpp", ".cc"] },
  // { csharp: ["cs", ".cs"] },
  { cuda: [".cu", ".cuh"] },
  { d: ["dlang", ".d"] },
  // { erlang: [".erl"] },
  // { fsharp: ["fs", ".fs", ".fsi", ".fsx"] },
  // { go: ["golang", ".go"] },
  { haskell: [".hs"] },
  // { html: [".html", ".jsp", ".asp", ".aspx", ".ascx"] },
  { cshtml: [".cshtml", "aspx-cs", "aspx-csharp"] },
  { vbhtml: [".vbhtml", "aspx-vb"] },
  // { java: [".java"] },
  // { javascript: ["js", "node", ".js"] },
  // { lisp: [".lisp", ".lsp"] },
  { lua: [".lua"] },
  { matlab: [".matlab"] },
  { pascal: [".pas"] },
  { perl: [".pl"] },
  // { php: [".php"] },
  // { powershell: ["posh", ".ps1"] },
  { processing: [".pde"] },
  // { python: [".py"] },
  { r: [".r"] },
  // { ruby: ["ru", ".ru", ".ruby"] },
  // { rust: [".rs"] },
  { scala: [".scala"] },
  // { shell: ["sh", "bash", ".sh", ".bash"] },
  { smalltalk: [".st"] },
  // { sql: [".sql"] },
  { swift: [".swift"] },
  // { typescript: ["ts", ".ts"] },
  { xaml: [".xaml"] },
  // { xml: ["xsl", "xslt", "xsd", "wsdl", ".xml", ".csdl", ".edmx", ".xsl", ".xslt", ".xsd", ".wsdl"] },
  // { vb: ["vbnet", "vbscript", ".vb", ".bas", ".vbs", ".vba"] }
]
let codeSnippetContent = "";
let firstIteration = true;
export const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"(\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+)?)?:::/g;
export function tripleColonCodeSnippets(md, options) {
  const replaceTripleColonCodeSnippetWithContents = async (src: string, rootdir: string) => {
    // let captureGroup;
    const matches = src.match(TRIPLE_COLON_CODE_RE);

    for (const match of matches) {
      const position = src.indexOf(match);
      // while ((captureGroup = TRIPLE_COLON_CODE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      const SOURCE_RE = /source="(.*?)"/g;
      // const source = SOURCE_RE.exec(captureGroup[0]);
      const source = SOURCE_RE.exec(match);
      const LANGUAGE_RE = /language="(.*?)"/g;
      // let languageMatch = LANGUAGE_RE.exec(captureGroup[0]);
      let languageMatch = LANGUAGE_RE.exec(match);
      let language = ""
      if (languageMatch) {
        language = languageMatch[1].trim()
      }
      let output = "";
      const lineArr: string[] = [];
      let file
      let filePath = resolve(repoRoot, source[1].trim());
      let path = source[1].trim();
      if (path.includes("~")) {
        // get openpublishing.json
        let position = 0
        let repoPath = "";
        const openPublishingFilePath = resolve(repoRoot, ".openpublishing.publish.config.json")
        const openPublishingFile = await readFile(openPublishingFilePath, "utf8")
        // filePath = filePath.replace(ROOTPATH_RE, repoRoot);
        const openPublishingJson = JSON.parse(openPublishingFile)
        const repos = openPublishingJson["dependent_repositories"]
        const parts = path.split("/")
        if (repos) {
          repos.map(repo => {
            if (parts) {
              parts.map((part, index) => {
                if (repo.path_to_root === part) {
                  position = index;
                  repoPath = repo.url;
                  return;
                }
              });
            }
          });
          path = buildRepoPath(repoPath, position, parts)
        }
        const apiUrl = path;
        try {
          await Axios.get(apiUrl)
            .then(response => {
              if (response) {
                file = Base64.decode(response.data.content);
              }
            });
        } catch (error) {
          outputChannel.appendLine(error);
        }
      } else {
        file = await readFile(filePath, "utf8")
      }

      if (file) {
        const data = file.split("\n");
        const RANGE_RE = /range="(.*?)"/g;
        // const range = RANGE_RE.exec(captureGroup[0]);
        const range = RANGE_RE.exec(match);
        const ID_RE = /id="(.*?)"/g;
        // const idMatch = ID_RE.exec(captureGroup[0]);
        const idMatch = ID_RE.exec(match);
        if (idMatch) {
          const id = idMatch[1].trim();
          let startLine = 0;
          let endLine = 0;
          let START_RE
          let START_SPACE_RE
          let END_RE
          let END_SPACE_RE
          // logic for id.
          // get language to know what type of comment to expect
          switch (language) {
            case "cpp":
            case "vb":
            case "java":
            case "javascript":
            case "js":
            case "fsharp":
            case "typescript":
            case "go":
            case "php":
            case "rust":
            case "objectivec":
              START_RE = new RegExp(`\/\/<${id}>`)
              START_SPACE_RE = new RegExp(`\/\/ <${id}>`);;
              END_RE = new RegExp(`\/\/<\/${id}>`)
              END_SPACE_RE = new RegExp(`\/\/ <\/${id}>`);
              break;
            case "cs":
            case "csharp":
              START_RE = new RegExp(`#region${id}`)
              START_SPACE_RE = new RegExp(`#region ${id}`);
              END_RE = new RegExp(`#endregion`);
              END_SPACE_RE = new RegExp(`#endregion`);
              break;
            case "xml":
            case "html":
              START_RE = new RegExp(`<!--<${id}>-->`)
              START_SPACE_RE = new RegExp(`<!-- <${id}> -->`)
              END_RE = new RegExp(`<!--<\/${id}>-->`)
              END_SPACE_RE = new RegExp(`<!-- </${id}> -->`)
              break;
            case "sql":
              START_RE = new RegExp(`--<${id}>`)
              START_SPACE_RE = new RegExp(`-- <${id}>`);
              END_RE = new RegExp(`-- <\/${id}>`)
              END_SPACE_RE = new RegExp(`--<\/${id}>`);
              break;
            case "python":
            case "powershell":
            case "shell":
            case "ruby":
              START_RE = new RegExp(`#<${id}>`);
              START_SPACE_RE = new RegExp(`# <${id}>`);
              END_RE = new RegExp(`#<\/${id}>`);
              END_SPACE_RE = new RegExp(`# <\/${id}>`);
              break;
            case "batchfile":
              START_RE = new RegExp(`rem<${id}>`, "i");
              START_SPACE_RE = new RegExp(`rem <${id}>`, "i");
              END_RE = new RegExp(`rem<\/${id}>`, "i");
              END_SPACE_RE = new RegExp(`rem <\/${id}>`, "i");
              break;
            case "erlang":
              START_RE = new RegExp(`%<${id}>`);
              START_SPACE_RE = new RegExp(`% <${id}>`);
              END_RE = new RegExp(`%</${id}>`);
              END_SPACE_RE = new RegExp(`% </${id}>`);
              break;
            case "lisp":
              START_RE = new RegExp(`;<${id}>`);
              START_SPACE_RE = new RegExp(`; <${id}>`);
              END_RE = new RegExp(`;</${id}>`);
              END_SPACE_RE = new RegExp(`; </${id}>`);
              break;
            default:
              // get all lines
              startLine = 0;
              endLine = data.length;
              break;
          }
          for (let index = 0; index < data.length; index++) {
            if (START_RE.exec(data[index])) {
              startLine = index;
            } else if (START_SPACE_RE.exec(data[index])) {
              startLine = index;
            }
            if (END_RE.exec(data[index])) {
              endLine = index;
              break;
            } else if (END_SPACE_RE.exec(data[index])) {
              endLine = index;
              break;
            }
            if (index + 1 === data.length) {
              endLine = data.length;
              break;
            }
          }
          data.map((x, index) => {
            if (index > startLine && index < endLine) {
              lineArr.push(x);
            }
          })
          output = lineArr.join("\n");

        } else if (range) {

          const rangeArr: number[] = [];
          const rangeList = range[1].split(",");
          rangeList.forEach((element) => {
            if (element.indexOf("-") > 0) {
              const rangeThru = element.split("-");
              const startRange = parseInt(rangeThru[0], 10);
              const endRange = parseInt(rangeThru.pop(), 10);
              for (let index = startRange; index <= endRange; index++) {
                rangeArr.push(index);
              }
            } else {
              rangeArr.push(parseInt(element, 10));
            }
          });
          rangeArr.sort();
          data.map((line, index) => {
            rangeArr.filter((x) => {
              if (x === index + 1) {
                lineArr.push(line);
              }
            });
          });
          output = lineArr.join("\n");
        } else {
          output = readFileSync(filePath, "utf8");
        }
        output = `\`\`\`${language}\r\n${output}\r\n\`\`\``;
        src = src.slice(0, position) + output + src.slice(position + match.length, src.length);
        // src = src.slice(0, captureGroup.index) + output + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        // }
        codeSnippetContent = src;
        const matchesRemaining = codeSnippetContent.match(TRIPLE_COLON_CODE_RE);
        if (matchesRemaining) {
          if (firstIteration) {
            firstIteration = false;
            updateEditorToRefreshChanges();
          }
        }
      }
    }
  };

  const importTripleColonCodeSnippets = (state) => {
    try {
      replaceTripleColonCodeSnippetWithContents(state.src, options.root);
      state.src = codeSnippetContent;
    } catch (error) {
      outputChannel.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importTripleColonCodeSnippets);
}

function updateEditorToRefreshChanges() {
  const editor = window.activeTextEditor;
  const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
  const position = new Position(editor.document.lineCount - 1, lastLine.range.end.character);
  editor.edit((update) => {
    update.insert(position, " ");
  }).then(() => {
    editor.edit((update) => {
      const range = editor.document.getWordRangeAtPosition(position, /[ ]+/g);
      update.delete(range);
    })
  });
}

function buildRepoPath(repo, position, parts) {
  let fullPath = [];
  repo = repo.replace("https://github.com/", "https://api.github.com/repos/")
  fullPath.push(repo);
  fullPath.push("contents")
  for (let index = position + 1; index < parts.length; index++) {
    const path = parts[index];
    fullPath.push(path);
  }
  return fullPath.join("/");
}