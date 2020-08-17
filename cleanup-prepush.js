//@ts-check
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "./.git/hooks/pre-push");

if (fs.existsSync(file)) {
  const contents = fs.readFileSync(file);
  if (contents.indexOf("msdocs-pre-push") !== -1) {
    console.log("Deleting old pre-push hook.");
    fs.unlinkSync(file);
  } else {
    console.log(
      "Cleanup script determined your pre-push hook is already up to date. Nothing to do."
    );
  }
} else {
  console.log("Found nothing here:", file);
}
