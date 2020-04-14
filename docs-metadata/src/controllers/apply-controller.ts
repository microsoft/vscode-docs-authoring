
import { commands, OpenDialogOptions, Uri, window } from "vscode";
import { getExtensionPath } from "../extension";
import { execPromise, metadataDirectory, openFolderInExplorerOrFinder } from "../util/common";

const outputChannel = window.createOutputChannel("docs-metadata");

export async function showApplyMetadataMessage(path: string) {
  if (path.indexOf(".csv") === -1) {
    window.showInformationMessage(`Please find a Metadata Update Tool file to apply...`,
      "Find MUT file", "Cancel")
      .then(async (selectedItem) => {
        if (selectedItem === "Find MUT file") {
          const filePath = await showChooseMetadataCsvDialog(path);
          if (filePath === "") {
            showApplyCancellationMessage();
          }
          applyMetadata(filePath);
        } else {
          // operation canceled.
          showApplyCancellationMessage();
        }
      });
  } else {
    window.showInformationMessage(`Apply Metadata Update Tool(MUT) file ${path}?`,
      "OK", "Change Location", "Cancel")
      .then(async (selectedItem) => {
        if (selectedItem === "OK") {
          applyMetadata(path);
        } else if (selectedItem === "Change Location") {
          const filePath = await showChooseMetadataCsvDialog(path);
          applyMetadata(filePath);
        } else {
          // operation canceled.
          showApplyCancellationMessage();
        }
      });
  }
}

async function applyMetadata(filePath: string) {
  const logFilePath = `${filePath.replace(".txt", "")}_log.txt`;
  const command = `dotnet "${getExtensionPath() + "//.muttools//"}mdapplycore.dll" "${filePath}" --nobackup -l "${logFilePath}"`;
  await execPromise(command).then(async (result) => {
    window.showInformationMessage(`Metadata apply completed. Check the "docs-metadata" output channel for details.`, "Open Folder").then(async (selectedItem) => {
      if (selectedItem === "Open Folder") {
        await openFolderInExplorerOrFinder(metadataDirectory);
      }
    });
    outputChannel.append(result.stdout);
    outputChannel.show(true);
  }).catch((result) => {
    if (result.stderr.indexOf(`'dotnet' is not recognized`) > -1) {
      window.showInformationMessage(`It looks like you need to install the DotNet runtime.`,
        "Install DotNet", "Cancel")
        .then(async (selectedItem) => {
          if (selectedItem === "Install DotNet") {
            commands.executeCommand("vscode.open", Uri.parse("https://dotnet.microsoft.com/download"));
          }
        });
    } else if (result.stdout.indexOf("used by another process") > -1) {
      window.showErrorMessage(`Couldn't apply metadata. Please make sure the csv file is not in use by another program, and try again.`);
    } else {
      window.showErrorMessage(`Couldn't apply metadata: ${result.stderr}`);
    }
  });
}

export function showApplyCancellationMessage() {
  window.showInformationMessage("Metadata apply cancelled.");
}

export async function showChooseMetadataCsvDialog(folderPath: string) {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    defaultUri: Uri.file(folderPath),
    openLabel: "Apply Metadata",
    // tslint:disable-next-line: object-literal-sort-keys
    filters: {
      "Supported files": ["csv", "xls", "txt"],
    },
  };

  let filePath = "";
  await window.showOpenDialog(options).then((fileUri) => {
    if (fileUri && fileUri[0]) {
      filePath = fileUri[0].fsPath;
    }
  });
  return filePath;
}
