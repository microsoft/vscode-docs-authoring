"use strict";

// const telemetryCommand: string = "applyTemplate";

export function yamlCommands() {
  const commands = [{ command: insertTocEntry.name, callback: insertTocEntry }];
  return commands;
}

export function insertTocEntry() {
  console.log(`TOC function`);
}
