import { resolve } from "path";
import { readFileSync } from "fs";
import { output } from "../extension";
import { workspace, window, Position } from "vscode";

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
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importCodeSnippet);
}

// C# code snippet comment block: // <[/]snippetname>
const CFamilyCodeSnippetCommentStartLineTemplate = /\/\/<{tagname}>/g;
const CFamilyCodeSnippetCommentEndLineTemplate = /\/\/<\/{tagname}>/g;

// C# code snippet region block: start -> #region snippetname, end -> #endregion
const CSharpCodeSnippetRegionStartLineTemplate = /#region{tagname}/g;
const CSharpCodeSnippetRegionEndLineTemplate = /#endregion/g;

// VB code snippet comment block: ' <[/]snippetname>
const BasicFamilyCodeSnippetCommentStartLineTemplate = /'<{tagname}>/g;
const BasicFamilyCodeSnippetCommentEndLineTemplate = /'<\/{tagname}>/g;

// VB code snippet Region block: start -> # Region /snippetname/, end -> # End Region
const VBCodeSnippetRegionRegionStartLineTemplate = /#region{tagname}/g;
const VBCodeSnippetRegionRegionEndLineTemplate = /#endregion/g;

// XML code snippet block: <!-- <[/]snippetname> -->
const MarkupLanguageFamilyCodeSnippetCommentStartLineTemplate = /<!--<{tagname}>-->/g;
const MarkupLanguageFamilyCodeSnippetCommentEndLineTemplate = /<!--<\/{tagname}>-->/g;

// Sql code snippet block: -- <[/]snippetname>
const SqlFamilyCodeSnippetCommentStartLineTemplate = /--<{tagname}>/g;
const SqlFamilyCodeSnippetCommentEndLineTemplate = /--<\/{tagname}>/g;

// Python code snippet comment block: # <[/]snippetname>
const ScriptFamilyCodeSnippetCommentStartLineTemplate = /#<{tagname}>/g;
const ScriptFamilyCodeSnippetCommentEndLineTemplate = /#<\/{tagname}>/g;

// Batch code snippet comment block: rem <[/]snippetname>
const BatchFileCodeSnippetRegionStartLineTemplate = /rem<{tagname}>/g;
const BatchFileCodeSnippetRegionEndLineTemplate = /rem<\/{tagname}>/g;

// Erlang code snippet comment block: % <[/]snippetname>
const ErlangCodeSnippetRegionStartLineTemplate = /%<{tagname}>/g;
const ErlangCodeSnippetRegionEndLineTemplate = /%<{tagname}>/g;

// Lisp code snippet comment block: ; <[/]snippetname>
const LispCodeSnippetRegionStartLineTemplate = /;<{tagname}>/g;
const LispCodeSnippetRegionEndLineTemplate = /;<{tagname}>/g;
const dict = [
  { actionscript: [".as"] },
  { arduino: [".ino"] },
  { assembly: ["nasm", ".asm"] },
  { batchfile: [".bat", ".cmd"] },
  { cpp: ["c", "c++", "objective-c", "obj-c", "objc", "objectivec", ".c", ".cpp", ".h", ".hpp", ".cc"] },
  { csharp: ["cs", ".cs"] },
  { cuda: [".cu", ".cuh"] },
  { d: ["dlang", ".d"] },
  { erlang: [".erl"] },
  { fsharp: ["fs", ".fs", ".fsi", ".fsx"] },
  { go: ["golang", ".go"] },
  { haskell: [".hs"] },
  { html: [".html", ".jsp", ".asp", ".aspx", ".ascx"] },
  { cshtml: [".cshtml", "aspx-cs", "aspx-csharp"] },
  { vbhtml: [".vbhtml", "aspx-vb"] },
  { java: [".java"] },
  { javascript: ["js", "node", ".js"] },
  { lisp: [".lisp", ".lsp"] },
  { lua: [".lua"] },
  { matlab: [".matlab"] },
  { pascal: [".pas"] },
  { perl: [".pl"] },
  { php: [".php"] },
  { powershell: ["posh", ".ps1"] },
  { processing: [".pde"] },
  { python: [".py"] },
  { r: [".r"] },
  { ruby: ["ru", ".ru", ".ruby"] },
  { rust: [".rs"] },
  { scala: [".scala"] },
  { shell: ["sh", "bash", ".sh", ".bash"] },
  { smalltalk: [".st"] },
  { sql: [".sql"] },
  { swift: [".swift"] },
  { typescript: ["ts", ".ts"] },
  { xaml: [".xaml"] },
  { xml: ["xsl", "xslt", "xsd", "wsdl", ".xml", ".csdl", ".edmx", ".xsl", ".xslt", ".xsd", ".wsdl"] },
  { vb: ["vbnet", "vbscript", ".vb", ".bas", ".vbs", ".vba"] }]

export const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"\s+((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?")?(\s+)?:::/i;
export function tripleColonCodeSnippets(md, options) {
  const replaceTripleColonCodeSnippetWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = TRIPLE_COLON_CODE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      const SOURCE_RE = /source="(.*?)"/g;
      const source = SOURCE_RE.exec(captureGroup[0]);
      const LANGUAGE_RE = /language="(.*?)"/g;
      let languageMatch = LANGUAGE_RE.exec(captureGroup[0]);
      let language = ""
      if (languageMatch) {
        language = languageMatch[1].trim()
      }
      let output = "";
      const lineArr: string[] = [];

      let filePath = resolve(rootdir, source[1].trim());
      if (filePath.includes("~")) {
        filePath = filePath.replace(ROOTPATH_RE, repoRoot);
      }
      const data = readFileSync(filePath, "utf8")
        .split("\n")
        .filter(Boolean);
      const RANGE_RE = /range="(.*?)"/g;
      const range = RANGE_RE.exec(captureGroup[0]);
      const ID_RE = /id="(.*?)"/g;
      const idMatch = ID_RE.exec(captureGroup[0]);
      if (idMatch) {
        const id = idMatch[1].trim();
        let startLine = 0;
        let endLine = 0;
        // logic for id.
        // get language to know what type of comment to expect
        switch (language) {
          case "cpp":
            data.map((x, index) => {
              const startMatch = new RegExp(`\/\/<${id}>`).exec(x);
              if (startMatch) {
                startLine = index;
              }
              const endMatch = new RegExp(`\/\/<\/${id}>`).exec(x);
              if (endMatch) {
                endLine = index;
                return;
              }
            });
            break;
          case "cs":
            data.map((x, index) => {
              const startMatch = new RegExp(`#region${id}`).exec(x);
              if (startMatch) {
                startLine = index;
              }
              const endMatch = new RegExp(`#endregion`).exec(x);
              if (endMatch) {
                endLine = index;
                return;
              }
            });
            break;

          default:
            break;
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
            const startRange = parseInt(rangeThru[0]);
            const endRange = parseInt(rangeThru.pop());
            for (let index = startRange; index <= endRange; index++) {
              rangeArr.push(index);
            }
          } else {
            rangeArr.push(parseInt(element));
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
      src = src.slice(0, captureGroup.index) + output + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const importTripleColonCodeSnippets = (state) => {
    try {
      state.src = replaceTripleColonCodeSnippetWithContents(state.src, options.root);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importTripleColonCodeSnippets);
}


export function custom_codeblock(md, options) {
  const CODEBLOCK_RE = /([ ]{5})/g;
  const removeCodeblockSpaces = (src: string) => {
    let captureGroup;
    while ((captureGroup = CODEBLOCK_RE.exec(src))) {
      src = src.slice(0, captureGroup.index) + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const customCodeBlock = (state) => {
    try {
      state.src = removeCodeblockSpaces(state.src);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "custom_codeblock", customCodeBlock);
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