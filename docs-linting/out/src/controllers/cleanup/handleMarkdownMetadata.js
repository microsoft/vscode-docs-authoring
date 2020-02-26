"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../helper/common");
const utilities_1 = require("./utilities");
const jsyaml = require("js-yaml");
/**
 * Takes in markdown data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleMarkdownMetadata(data, metadata) {
    try {
        const yamlContent = jsyaml.load(metadata);
        if (yamlContent) {
            if (utilities_1.handleSingleItemArray(yamlContent["author"])) {
                data = utilities_1.singleValueMetadata(data, "author");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.author"])) {
                data = utilities_1.singleValueMetadata(data, "ms.author");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.component"])) {
                data = utilities_1.singleValueMetadata(data, "ms.component");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.date"])) {
                data = utilities_1.singleValueMetadata(data, "ms.date");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.prod"])) {
                data = utilities_1.singleValueMetadata(data, "ms.prod");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.service"])) {
                data = utilities_1.singleValueMetadata(data, "ms.service");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.subservice"])) {
                data = utilities_1.singleValueMetadata(data, "ms.subservice");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.technology"])) {
                data = utilities_1.singleValueMetadata(data, "ms.technology");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.topic"])) {
                data = utilities_1.singleValueMetadata(data, "ms.topic");
            }
            if (utilities_1.handleSingleItemArray(yamlContent["ms.title"])) {
                data = utilities_1.singleValueMetadata(data, "ms.title");
            }
        }
    }
    catch (error) {
        common_1.postError(error);
    }
    return data;
}
exports.handleMarkdownMetadata = handleMarkdownMetadata;
//# sourceMappingURL=handleMarkdownMetadata.js.map