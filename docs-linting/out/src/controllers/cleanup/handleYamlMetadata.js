"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../helper/common");
const utilities_1 = require("./utilities");
const jsyaml = require("js-yaml");
/**
 * Takes in yaml data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleYamlMetadata(data) {
    try {
        const yamlContent = jsyaml.load(data);
        if (yamlContent.metadata) {
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["author"])) {
                data = utilities_1.singleValueMetadata(data, "author");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.author"])) {
                data = utilities_1.singleValueMetadata(data, "ms.author");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.component"])) {
                data = utilities_1.singleValueMetadata(data, "ms.component");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.date"])) {
                data = utilities_1.singleValueMetadata(data, "ms.date");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.prod"])) {
                data = utilities_1.singleValueMetadata(data, "ms.prod");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.service"])) {
                data = utilities_1.singleValueMetadata(data, "ms.service");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.subservice"])) {
                data = utilities_1.singleValueMetadata(data, "ms.subservice");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.technology"])) {
                data = utilities_1.singleValueMetadata(data, "ms.technology");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.topic"])) {
                data = utilities_1.singleValueMetadata(data, "ms.topic");
            }
            if (utilities_1.handleSingleItemArray(yamlContent.metadata["ms.title"])) {
                data = utilities_1.singleValueMetadata(data, "ms.title");
            }
        }
    }
    catch (error) {
        common_1.postError(error);
    }
    return data;
}
exports.handleYamlMetadata = handleYamlMetadata;
//# sourceMappingURL=handleYamlMetadata.js.map