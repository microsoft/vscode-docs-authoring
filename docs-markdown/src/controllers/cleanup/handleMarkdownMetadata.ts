import { postError } from "../../helper/common";
import { handleSingleItemArray, singleValueMetadata } from "./utilities";
// tslint:disable-next-line: no-var-requires
const jsyaml = require("js-yaml");

/**
 * Takes in markdown data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
export function handleMarkdownMetadata(data: string, metadata: string) {
    try {
        const yamlContent = jsyaml.load(metadata);
        if (yamlContent) {
            if (handleSingleItemArray(yamlContent.author)) {
                data = singleValueMetadata(data, "author");
            }
            if (handleSingleItemArray(yamlContent["ms.author"])) {
                data = singleValueMetadata(data, "ms.author");
            }
            if (handleSingleItemArray(yamlContent["ms.component"])) {
                data = singleValueMetadata(data, "ms.component");
            }
            if (handleSingleItemArray(yamlContent["ms.date"])) {
                data = singleValueMetadata(data, "ms.date");
            }
            if (handleSingleItemArray(yamlContent["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod");
            }
            if (handleSingleItemArray(yamlContent["ms.service"])) {
                data = singleValueMetadata(data, "ms.service");
            }
            if (handleSingleItemArray(yamlContent["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice");
            }
            if (handleSingleItemArray(yamlContent["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology");
            }
            if (handleSingleItemArray(yamlContent["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic");
            }
            if (handleSingleItemArray(yamlContent["ms.title"])) {
                data = singleValueMetadata(data, "ms.title");
            }
        }
    } catch (error) {
        postError(error);
    }
    return data;
}
