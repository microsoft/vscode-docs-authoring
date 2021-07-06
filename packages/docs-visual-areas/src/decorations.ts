import { ServerStreamFileResponseOptionsWithError } from 'http2';
import {
  DecorationOptions,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window,
} from 'vscode';
import {
  getGutterIndicatorHeight,
  getGutterIndicatorOffset,
  getGutterIndicatorOpacity,
  getGutterIndicatorWidth,
} from './configuration';
import { isValidFile } from './document';
import { Logger } from './logging';
import { colors, GutterSVGs, getPattern, AreaDecoration, Switchers, patterns } from './models';

let nextColorIndex = 0;
let scopeDecorations: TextEditorDecorationType[] = [];
let timeout: NodeJS.Timer | undefined = undefined;

setDecorationFunctions();

/**
 * @description Trigger the decorations after a timeout delay
 */
export function triggerUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  timeout = setTimeout(updateDecorations, 500);
}

/**
 * @description Find the matches for the tokens. Create a range using the line numbers. Then decorate the range using the pre-defined colors.
 */
function updateDecorations() {
  let { activeTextEditor } = window;
  disposeScopeDecorations();
  nextColorIndex = 0;

  if (!activeTextEditor || !isValidFile()) {
    console.log('not a valid file');
    return;
  }

  const fileName = activeTextEditor.document.fileName;
  const text = activeTextEditor.document.getText();
  const pattern = getPattern(text);
  const regEx = pattern.regex;
  regEx.lastIndex = 0; // Reset for searching
  let decorations: AreaDecoration[] = [];
  let match;

  Logger.info(`Decorating gutters on: ${fileName}`);

  let previousDecoration = undefined;
  if (pattern.getDecorations) {
    while ((match = regEx.exec(text))) {
      const { decorationOptions, decorationType, color, isEnd } = pattern.getDecorations(
        activeTextEditor,
        match,
        previousDecoration,
      );
      const decoration: AreaDecoration = {
        decorationOptions,
        decorationType,
        color,
        isEnd,
      };
      decorations.push(decoration);
      previousDecoration = decoration;
    }
    decorations = extendAreaToCoverEntireRange(decorations);
    applyGutters(decorations);
  }
}

/**
 * @description The decorator functions cannot be set until the code for this module starts. So we do that here.
 */
function setDecorationFunctions() {
  for (const key in Switchers) {
    patterns[key as Switchers].getDecorations = getDecorationsFunction(key as Switchers);
  }

  function getDecorationsFunction(switcherType: Switchers) {
    switch (switcherType) {
      case Switchers.zones:
        return getDecorationsForZones;

      case Switchers.tabs:
      default:
        return getDecorationsForTabs;
    }
  }
}

/**
 * @description Find the start and end positions where we match the regEx for the zone area.
 * @param activeTextEditor
 * @param match The regEx to match
 * @returns
 */
function getDecorationsForZones(
  activeTextEditor: TextEditor,
  match: RegExpExecArray,
  previousDecoration?: AreaDecoration,
): AreaDecoration {
  // TODO: implement decorations for zone pivots
  const { positionAt } = activeTextEditor.document;
  const startPos = positionAt(match.index);
  const endPos = positionAt(match.index + match[0].length - 1);

  const hoverMessage = match.length > 1 ? match[1] : match[0];
  const isEnd = !hoverMessage;

  // Create the deco options using the range.
  const decorationOptions: DecorationOptions = {
    range: new Range(startPos, endPos),
    hoverMessage: hoverMessage,
  };

  const color = (isEnd ? previousDecoration?.color : getColor()) ?? getColor();

  // Set the color for the gutterIcon to rotate through our color constants.
  const decorationType = window.createTextEditorDecorationType({
    gutterIconPath: createIcon(color, GutterSVGs.startIcon),
    gutterIconSize: 'auto',
  });

  const decoration: AreaDecoration = {
    decorationOptions,
    decorationType,
    color,
    isEnd,
  };
  return decoration;
}

/**
 * @description Find the start and end positions where we match the regEx for the tab area.
 * @param activeTextEditor
 * @param match The regEx to match
 * @returns
 */
function getDecorationsForTabs(
  activeTextEditor: TextEditor,
  match: RegExpExecArray,
  previousDecoration?: AreaDecoration,
): AreaDecoration {
  const { positionAt } = activeTextEditor.document;
  const startPos = positionAt(match.index);
  const endPos = positionAt(match.index + match[0].length - 1);

  const hoverMessage = match.length > 1 ? match[1] : match[0];
  const isEnd = !hoverMessage;

  // Create the deco options using the range.
  const decorationOptions: DecorationOptions = {
    range: new Range(startPos, endPos),
    hoverMessage: hoverMessage,
  };

  const color = getColor();

  // Set the color for the gutterIcon to rotate through our color constants.
  const decorationType = window.createTextEditorDecorationType({
    gutterIconPath: createIcon(color, GutterSVGs.startIcon),
    gutterIconSize: 'auto',
  });

  const decoration: AreaDecoration = {
    decorationOptions,
    decorationType,
    color,
    isEnd,
  };
  return decoration;
}

/**
 * Get the next color in the constants array
 * @returns The next color
 */
function getColor() {
  const index = nextColorIndex % colors.length;
  nextColorIndex++;
  return colors[index].value;
}

/**
 * @description Sets the decorations to the gutter.
 * @param decorations The areas (ranges and decorations) to apply to the gutters
 */
function applyGutters(decorations: AreaDecoration[]) {
  let { activeTextEditor } = window;
  decorations.forEach(area => {
    scopeDecorations.push(area.decorationType);
    activeTextEditor?.setDecorations(area.decorationType, [area.decorationOptions]);
  });
}

/**
 * @description Create the gutter icon.
 * @param color Icon color
 * @returns The Uri for the SVG icon
 */
function createIcon(color: string, gutterSVG: GutterSVGs): Uri {
  const height = getGutterIndicatorHeight();
  const width = getGutterIndicatorWidth();
  const offset = getGutterIndicatorOffset();
  const opacity = getGutterIndicatorOpacity();
  let svg = '';

  switch (gutterSVG) {
    case GutterSVGs.startIcon:
      svg =
        `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="${offset + width}" y="0" width="${
          height - width
        }" height="${width}" style="fill: ${color}${opacity};"></rect>;` +
        `<rect x="${offset}" y="0" width="${width}" height="${height}" style="fill: ${color}${opacity};"></rect>;` +
        `</svg>`;
      break;

    case GutterSVGs.defaultIcon:
      svg =
        `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="${offset}" y="0" width="${width}" height="${height}" style="fill: ${color}${opacity};"></rect>;` +
        `</svg>`;
      break;
  }

  const encodedSVG = encodeURIComponent(svg);
  const URI = 'data:image/svg+xml;utf8,' + encodedSVG;
  return Uri.parse(URI);
}

/**
 * Remove all scope decorations.
 * This is required so we can constantly update the gutter.
 */
function disposeScopeDecorations() {
  for (const decoration of scopeDecorations) {
    decoration.dispose();
  }

  scopeDecorations = [];
}

/**
 * @description Extend the ranges of each match in the array to the next match. This is what decorates the entire range in the gutter.
 * @param decorations array of the styles and ranges for the gutter
 * @returns a fresh copy of the areas array
 */
function extendAreaToCoverEntireRange(decorations: AreaDecoration[]) {
  let previousArea: AreaDecoration;
  decorations.forEach(area => {
    const { line } = area.decorationOptions.range.start;

    if (previousArea && !previousArea.isEnd) {
      const { line: startLine } = previousArea.decorationOptions.range.start;

      // Create the deco options using the range.
      const decorationOptions = {
        range: new Range(startLine + 1, 0, line - 1, 0),
        hoverMessage: previousArea.decorationOptions.hoverMessage,
      };

      // Set the color for the gutterIcon to rotate through our color constants.
      const { color, isEnd } = previousArea;
      const decorationType = window.createTextEditorDecorationType({
        gutterIconPath: createIcon(color, GutterSVGs.defaultIcon),
        gutterIconSize: 'auto',
      });

      const decoration: AreaDecoration = {
        decorationOptions,
        decorationType,
        color,
        isEnd,
      };

      decorations.push(decoration);
    }

    previousArea = area;
  });
  return decorations;
}
