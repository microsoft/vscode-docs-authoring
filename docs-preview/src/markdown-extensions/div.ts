/* tslint:disable: one-variable-per-declaration prefer-const variable-name */

export function div_plugin(md, name, options) {
    options = options || {};
    let min_markers = 1,
        marker_str = options.marker,
        marker_len = marker_str.length,
        marker_char = marker_str.charCodeAt(0),
        validate = options.validate,
        render = options.render;

    function container(state, startLine, endLine, silent) {
        let pos, nextLine, marker_count, markup, params, token,
            old_parent, old_line_max,
            auto_closed = false,
            start = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];

        // Check out the first character quickly,
        // this should filter out most of non-containers
        //
        if (marker_char !== state.src.charCodeAt(start)) { return false; }

        // Check out the rest of the marker string
        //
        for (pos = start; pos <= max; pos++) {
            if (":" !== state.src[pos]) {
                break;
            }
        }

        pos -= (pos - start) % marker_len;

        markup = state.src.slice(start, pos);
        params = state.src.slice(pos, max);
        if (!validate(params)) { return false; }

        // Since start is found, we can report success here in validation mode
        //
        if (silent) { return true; }

        // Search for the end of the block
        //
        nextLine = startLine;

        for (; ;) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (marker_char !== state.src.charCodeAt(start)) { continue; }

            if (state.sCount[nextLine] - state.blkIndent >= 4) {
                // closing fence should be indented less than 4 spaces
                continue;
            }

            for (pos = start; pos <= max; pos++) {
                if (":" !== state.src[pos]) {
                    break;
                }
            }

            // closing code fence must be at least as long as the opening one
            if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

            // make sure tail has spaces only
            pos -= (pos - start) % marker_len;
            pos = state.skipSpaces(pos);

            if (pos < max) { continue; }

            // found!
            auto_closed = true;
            break;
        }

        old_parent = state.parentType;
        old_line_max = state.lineMax;
        state.parentType = "container";

        // this will prevent lazy continuations from ever going past our end marker
        state.lineMax = nextLine;

        token = state.push("container_" + name + "_open", "div", 1);
        token.markup = markup;
        token.block = true;
        token.info = params;
        token.map = [startLine, nextLine];

        state.md.block.tokenize(state, startLine + 1, nextLine);

        token = state.push("container_" + name + "_close", "div", -1);
        token.markup = state.src.slice(start, pos);
        token.block = true;

        state.parentType = old_parent;
        state.lineMax = old_line_max;
        state.line = nextLine + (auto_closed ? 1 : 0);

        return true;
    }

    md.block.ruler.before("code", "container_" + name, container, {
        alt: [],
    });
    md.renderer.rules["container_" + name + "_open"] = render;
    md.renderer.rules["container_" + name + "_close"] = render;
}

const regex = /!div\sclass\s*=\s*"([a-zA-Z0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?\s]*)"]/gi;
export const divOptions = {
    marker: "[",
    validate(params) {
        return params.trim().match(regex);
    },
    render(tokens, idx) {
        const matches = tokens[idx].info.trim().match(regex);
        const CLASS_RE = /class\s*=\s*"([a-zA-Z0-9~@#\^\$&\*\(\)-_\+=\[\]\{\}\|\\,\.\?\s]*)"/gi;
        let classMatches = null;
        if (matches !== null) { classMatches = matches[0].match(CLASS_RE); }
        if (tokens[idx].nesting === 1) {
            // opening tag
            if (classMatches !== null) {
                return `<div ${classMatches[0]}>\n`;
            } else {
                return `<div>\n`;
            }
        } else {
            // closing tag
            return "</div>\n";
        }
    },
};
