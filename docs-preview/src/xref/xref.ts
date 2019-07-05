
import Axios from "axios";
import { window, Position, Range } from "vscode";

export const output = window.createOutputChannel("docs-preview");

const apiUrl = "https://xref.docs.microsoft.com/query?uid=";
const XREF_RE = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9]+)(\?displayProperty=.+)?>/i;
export function xref(md) {
  const xref = (state) => {
    try {
      // var xrefMatches = state.src.match(XREF_RE);
      if (!updateFlag) {
        updateXrefContent(md, state.src);
      } else {
        state.src = xrefContent;
      }
    } catch (error) {
      output.appendLine(error);
    }
  };

  md.core.ruler.before("normalize", "xref", xref);
}

let xrefContent = "";
async function updateXrefContent(md: any, src: string) {
  updateFlag = true;
  let mdSrc = "";
  let captureGroup;
  while ((captureGroup = XREF_RE.exec(src))) {
    // const uid = decodeSpecialCharacters(captureGroup[1].trim());
    const uid = captureGroup[1].trim();
    await Axios.get(apiUrl + uid)
      .then(response => {
        if (response) {
          let xref = response.data[0];
          mdSrc = `[${xref.fullName}](${xref.href})`;
          src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        }
      });
  }
  xrefContent = src;
  //md.parse(xrefContent);
  updateEditorToRefreshChanges();
}

function decodeSpecialCharacters(content) {
  content = content.replace("%2A", "*")
  content = content.replace("%23", "#")
  content = content.replace("%60", "`")
  return content;
}

function updateEditorToRefreshChanges() {
  const position = new Position(0, 0);
  const range = new Range(position, new Position(0, 1));
  const editor = window.activeTextEditor;
  editor.edit((update) => {
    update.insert(position, " ");
  });

  function deleteNewRefreshContent() {
    editor.edit((update) => {
      update.delete(range);
    });
  }
  setTimeout(deleteNewRefreshContent, 100);
  setTimeout(() => {
    updateFlag = false;
  }, 500);
}
let updateFlag = false;


