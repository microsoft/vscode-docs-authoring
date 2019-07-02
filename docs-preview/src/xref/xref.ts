
import Axios from "axios";
import { window } from "vscode";

export const output = window.createOutputChannel("docs-preview");

const apiUrl = "https://xref.docs.microsoft.com/query?uid=";
const XREF_RE = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9]+)(\?displayProperty=.+)?>/i;
export function xref(md) {
  const replaceXrefWithContents = async (src: string) => {
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
    return src;
  };
  let content = ""
  const xref = async (state) => {
    try {
      content = await replaceXrefWithContents(state.src);
      state.src = content;

    } catch (error) {
      output.appendLine(error);
    }

  };

  md.core.ruler.before("normalize", "xref", xref);
}

function decodeSpecialCharacters(content) {
  content = content.replace("%2A", "*")
  content = content.replace("%23", "#")
  content = content.replace("%60", "`")
  return content;
}