"use strict";

import { applyRedirectDaisyChainResolution } from "./daisyChainResolution";
import { generateMasterRedirectionFile } from "./generateRedirectionFile";
import { removeDefaultValuesInRedirects } from "./removeDefaultJsonValues";
import { detectInvalidDocumentIdRedirects } from "./removeInvalidRedirectDocIds";
import { sortMasterRedirectionFile } from "./sortRedirects";

export function getMasterRedirectionCommand() {
    return [
        { command: generateMasterRedirectionFile.name, callback: generateMasterRedirectionFile },
        { command: sortMasterRedirectionFile.name, callback: sortMasterRedirectionFile },
        { command: applyRedirectDaisyChainResolution.name, callback: applyRedirectDaisyChainResolution },
        { command: detectInvalidDocumentIdRedirects.name, callback: detectInvalidDocumentIdRedirects },
        { command: removeDefaultValuesInRedirects.name, callback: removeDefaultValuesInRedirects },
    ];
}
