import Axios from "axios";
import { Position, Range, window } from "vscode";
import { output } from "../extension";

/* tslint:disable: no-conditional-assignment */

const apiUrl = "https://xref.docs.microsoft.com/query?uid=";
// Sadly because of the bug with global regexes, I need two versions. One with global, one without. - Adam
const XREF_RE_WITH_GLOBAL = /<xref:(.*?)(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?>/gmi;
const XREF_RE = /<xref:(.*?)(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?>/mi;
const XREF_MD_LINK_RE_WITH_GLOBAL = /\(xref:(.*?)(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?\)/gmi;
const XREF_MD_LINK_RE = /\(xref:(.*?)(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?\)/mi;
let xrefContent = "";

export function xref(md) {
  const xrefReference = (state) => {
    try {
      updateXrefContent(md, state.src);
      state.src = xrefContent;
    } catch (error) {
      output.appendLine(error);
    }
  };

  md.core.ruler.before("normalize", "xref", xrefReference);
}

const xrefMap = new Map();
async function updateXrefContent(md: any, src: string) {
  xrefContent = src;
  let mdSrc = "";
  let captureGroup;
  let xrefTagCacheIsReady = true;
  let xrefMdLinkCacheIsReady = true;
  // check for matches, to see if there are any outside of our map.
  const xrefTagMatches = src.match(XREF_RE_WITH_GLOBAL);
  if (xrefTagMatches) {
    xrefTagCacheIsReady = xrefTagMatches.every((match) => {
      if (XREF_RE.test(match)) {
        return xrefMap.has(match);
      } else {
        return true;
      }
    });
  }

  const xrefMdLinkMatches = src.match(XREF_MD_LINK_RE_WITH_GLOBAL);
  if (xrefMdLinkMatches) {
    xrefMdLinkCacheIsReady = xrefMdLinkMatches.every((match) => {
      if (XREF_MD_LINK_RE.test(match)) {
        return xrefMap.has(match);
      } else {
        return true;
      }
    });
  }

  if (xrefMdLinkCacheIsReady) {
    while ((captureGroup = XREF_MD_LINK_RE.exec(src))) {
      mdSrc = xrefMap.get(captureGroup[0]);
      src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    xrefContent = src;
  }
  if (xrefTagCacheIsReady) {
    while ((captureGroup = XREF_RE.exec(src))) {
      mdSrc = xrefMap.get(captureGroup[0]);
      src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    xrefContent = src;
  }

  if (xrefTagCacheIsReady && xrefMdLinkCacheIsReady) {
    return;
  }

  while ((captureGroup = XREF_MD_LINK_RE.exec(src))) {
    const uidWithParams = captureGroup[1].trim();
    const uid = uidWithParams.split("?")[0];
    try {
      await Axios.get(apiUrl + uid)
        .then((response) => {
          if (response) {
            if (response.data[0]) {
              const xrefResponse = response.data[0];
              mdSrc = `(${xrefResponse.href})`;
            } else {
              mdSrc = `(${uid})`;
            }
            src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
            xrefMap.set(captureGroup[0], mdSrc);
          }
        });
    } catch (error) {
      output.appendLine(error);
    }
  }
  while ((captureGroup = XREF_RE.exec(src))) {
    const uidWithParams = captureGroup[1].trim();
    const uid = uidWithParams.split("?")[0];
    try {
      await Axios.get(apiUrl + uid)
        .then((response) => {
          if (response) {
            if (response.data[0]) {
              const xrefResponse = response.data[0];
              const displayProperty = captureGroup[3];
              if (displayProperty) {
                if (displayProperty === "fullName") {
                  mdSrc = `[${xrefResponse.fullName}](${xrefResponse.href})`;
                } else if (displayProperty === "nameWithType") {
                  mdSrc = `[${xrefResponse.nameWithType}](${xrefResponse.href})`;
                }
              } else {
                mdSrc = `[${xrefResponse.name}](${xrefResponse.href})`;
              }
            } else {
              mdSrc = `[${uid}](${uid})`;
            }
            src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
            xrefMap.set(captureGroup[0], mdSrc);
          }
        });
    } catch (error) {
      output.appendLine(error);
    }
  }

  xrefContent = src;
  updateEditorToRefreshChanges();
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
    });
  });
}
