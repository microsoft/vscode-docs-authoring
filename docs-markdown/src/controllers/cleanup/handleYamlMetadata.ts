import { postError } from "../../helper/common";
import { handleSingleItemArray, singleValueMetadata } from "./utilities";
// tslint:disable-next-line: no-var-requires
const jsyaml = require("js-yaml");

/**
 * Takes in yaml data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
export function handleYamlMetadata(data: string) {
    try {
        const yamlContent = jsyaml.load(data);
        if (yamlContent.metadata) {
            if (handleSingleItemArray(yamlContent.metadata.author)) {
                data = singleValueMetadata(data, "author");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.author"])) {
                data = singleValueMetadata(data, "ms.author");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.component"])) {
                data = singleValueMetadata(data, "ms.component");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.date"])) {
                data = singleValueMetadata(data, "ms.date");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.service"])) {
                data = singleValueMetadata(data, "ms.service");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.title"])) {
                data = singleValueMetadata(data, "ms.title");
            }
        }
    } catch (error) {
        postError(error);
    }
    return data;
}
