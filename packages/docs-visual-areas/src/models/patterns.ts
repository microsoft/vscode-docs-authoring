import * as vscode from 'vscode';
import { Switchers } from './enums';
import { AreaPattern } from './interfaces';

type PatternSetType = {
  tabs: AreaPattern;
  zones: AreaPattern;
};

export const patterns: PatternSetType = {
  tabs: {
    /*
      A two part expression, separated by the OR (|) operator.

      == PART 1: ==== /# \[(.*)\] ====================
        Match all the tab definitions and captures
        the tab labels for display.
      ================================================
      # \[          a single pound sign, a single space, and an open square bracket
      \[            open square bracket
      (.*)          unlimited series of non-line break characters in a capture group (the tab label)
      \]            close square bracket

      == PART 2: ==== | ==============================
        The OR operator
      ================================================

      |             OR operator

      == PART 3: ==== (?<=(# [.\S\s]*))---[\n\r] ====
        Match "---", but skip metadata delimiters by
        only matching when "---" is preceded by "#".
      ================================================
      (?<=          open up a look behind expression
      (# [.\S\s]*)  require that "#" plus any other text is present
      )             close the look behind expression
      ---           match on three dashes
      [\n\r]        match on line break (\n) and carriage return (\r) -> necessary to ensure the pattern does not match on table definitions

      flags:        global and case insensitive
    */
    regex: /# \[(.*)\]|(?<=(# \[[.\S\s]*))---[\n\r]/gi,
    name: Switchers.tabs,
  },
  zones: {
    regex: /::: ?zone.pivot="(.*)"[\S\s.]|::: ?zone-end/gi,
    name: Switchers.zones,
  },
};

export function getPattern(text: string) {
  const { tabs, zones } = patterns;
  let areaPattern: AreaPattern = zones; // default

  if (zones.regex.test(text)) {
    areaPattern = zones;
    zones.regex.lastIndex = 0;
  } else if (tabs.regex.test(text)) {
    areaPattern = tabs;
    tabs.regex.lastIndex = 0;
  }

  return areaPattern;
}
