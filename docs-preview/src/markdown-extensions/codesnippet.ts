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
const fileMap = new Map();
const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"(\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+)?)?:::/g;
const SOURCE_RE = /source="(.*?)"/i;
const LANGUAGE_RE = /language="(.*?)"/i;
const RANGE_RE = /range="(.*?)"/i;
const ID_RE = /id="(.*?)"/i;

export function tripleColonCodeSnippets(md, options) {
  const replaceTripleColonCodeSnippetWithContents = async (src: string, rootdir: string) => {
    const matches = src.match(TRIPLE_COLON_CODE_RE);
    for (const match of matches) {
      let file;
      let filePath;
      let shouldUpdate = false;
      let output = "";
      const lineArr: string[] = [];
      const position = src.indexOf(match);
      const source = match.match(SOURCE_RE);
      const path = source[1].trim();
      if (path) {
        file = fileMap.get(path);
        if (!file) {
          shouldUpdate = true;
          const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
          if (path.includes("~")) {
            let apiUrl;
            // get openpublishing.json at root
            const openPublishingRepos = await getOpenPublishingFile(repoRoot)
            if (openPublishingRepos) {
              apiUrl = buildRepoPath(openPublishingRepos, path);
            }
            try {
              await Axios.get(apiUrl)
                .then(response => {
                  if (response) {
                    if (response.status === 403) {
                      outputChannel.appendLine("Github Rate Limit has been reached. 60 calls per hour are allowed.")
                    } else if (response.status === 404) {
                      outputChannel.appendLine("Resource not Found.")
                    } else if (response.status === 200) {
                      file = Base64.decode(response.data.content);
                      fileMap.set(path, file)
                    }
                  }
                });
            } catch (error) {
              outputChannel.appendLine(error);
            }
          } else {
            filePath = resolve(rootdir, path);
            file = await readFile(filePath, "utf8")
            fileMap.set(path, file)
          }
        }
      }
      if (file) {
        const data = file.split("\n");
        const language = checkLanguageMatch(match);
        const range = match.match(RANGE_RE)
        const idMatch = match.match(ID_RE);
        if (idMatch) {
          output = idToOutput(idMatch, lineArr, data, language)
        } else if (range) {
          output = rangeToOutput(lineArr, data, range);
        } else {
          output = file;
        }
        output = `\`\`\`${language}\r\n${output}\r\n\`\`\``;
        src = src.slice(0, position) + output + src.slice(position + match.length, src.length);

        codeSnippetContent = src;

        if (shouldUpdate) {
          updateEditorToRefreshChanges();
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

function buildRepoPath(repos, path) {
  let position = 0
  let repoPath = "";
  const parts = path.split("/")
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
  let fullPath = [];
  repoPath = repoPath.replace("https://github.com/", "https://api.github.com/repos/")
  fullPath.push(repoPath);
  fullPath.push("contents")
  for (let index = position + 1; index < parts.length; index++) {
    const path = parts[index];
    fullPath.push(path);
  }
  return fullPath.join("/");
}

async function getOpenPublishingFile(repoRoot) {
  const openPublishingFilePath = resolve(repoRoot, ".openpublishing.publish.config.json")
  const openPublishingFile = await readFile(openPublishingFilePath, "utf8")
  // filePath = filePath.replace(ROOTPATH_RE, repoRoot);
  const openPublishingJson = JSON.parse(openPublishingFile)
  return openPublishingJson["dependent_repositories"]
}

function checkLanguageMatch(match) {
  let languageMatch = LANGUAGE_RE.exec(match);
  let language = ""
  if (languageMatch) {
    language = languageMatch[1].trim()
  }
  return language;
}

function rangeToOutput(lineArr, data, range) {
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
  return lineArr.join("\n");
}

function idToOutput(idMatch, lineArr, data, language) {
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
  return lineArr.join("\n");
}