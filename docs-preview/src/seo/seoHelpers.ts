import * as jsyaml from "js-yaml";
import { postWarning } from "../helper/common";
import { getDocfxMetadata, tryGetFileMetadataTitleSuffix, tryGetGlobalMetadataTitleSuffix } from "./docFxHelpers";
import { repoMapping } from "./repoMapping";
export function getFirstParagraph(markdown) {
    const metadataRegex = new RegExp(`^(---)([^]+?)(---)$`, "m");
    markdown = markdown.replace(metadataRegex, "");
    const frstParagraphRegex = new RegExp(`^(?!#).+`, "m");
    const firstParagraphMatch = markdown.match(frstParagraphRegex);
    if (firstParagraphMatch) {
        return shortenWithElipsesAtWordEnd(firstParagraphMatch[0], 305);
    }
    return markdown;
}

export async function parseMarkdownMetadata(metadata, markdown, basePath, filePath) {
    const details = { title: "", description: "", date: "" };
    try {
        const yamlContent = jsyaml.load(metadata);
        if (yamlContent) {
            details.title = await getTitle(yamlContent, details.title, basePath, filePath);
            details.title = checkIfContainsMicrosoftDocs(details.title);
            details.title = shortenWithElipsesAtWordEnd(details.title, 63);
            details.description = getMarkdownDescription(details, yamlContent, markdown);
            details.date = yamlContent["ms.date"];
        }
    } catch (error) {
        postWarning(`Unable to parse yaml header. There is a problem with your yaml front matter. ${error}`);
    }
    return details;
}

function checkIfContainsMicrosoftDocs(title) {
    if (title.includes("| Microsoft Docs")) {
        return title;
    } else {
        return `${title} | Microsoft Docs`;
    }
}

function getMarkdownDescription(details: { title: string; description: string; date: string; }, yamlContent: any, markdown: any) {
    details.description = yamlContent.description;
    if (!details.description) {
        details.description = getFirstParagraph(markdown);
    }
    return shortenWithElipsesAtWordEnd(details.description, 305);
}

async function getTitle(yamlContent: any, title: string, basePath: any, filePath: any) {
    if (yamlContent.titleSuffix) {
        title = `${yamlContent.title} - ${yamlContent.titleSuffix}`;
    } else {
        const docfxMetadata = getDocfxMetadata(basePath);
        let titleSuffix = await tryGetFileMetadataTitleSuffix(docfxMetadata, basePath, filePath);
        if (titleSuffix) {
            title = `${yamlContent.title} - ${titleSuffix}`;
        } else {
            titleSuffix = tryGetGlobalMetadataTitleSuffix(docfxMetadata);
            if (titleSuffix) {
                title = `${yamlContent.title} - ${titleSuffix}`;
            } else {
                title = `${yamlContent.title}`;
            }
        }
    }
    return title;
}

export async function parseYamlMetadata(metadata, breadCrumb, basePath, filePath) {
    const details = { title: "", description: "" };
    try {
        const yamlContent = jsyaml.load(metadata);
        if (yamlContent && yamlContent.metadata) {
            details.title = getMainContentIfExists(yamlContent.metadata.title, yamlContent.title);
            details.description = getMainContentIfExists(yamlContent.metadata.description, yamlContent.summary);
            if (breadCrumb.includes("› Docs › Learn › Browse")) {
                details.title = `${details.title} - Learn`;
                details.description = getYamlDescription(yamlContent);
            } else {
                details.title = await getTitle(yamlContent, details.title, basePath, filePath);
            }
            details.title = checkIfContainsMicrosoftDocs(details.title);
            details.title = shortenWithElipsesAtWordEnd(details.title, 63);
            details.description = shortenWithElipsesAtWordEnd(details.description, 305);
        }
    } catch (error) {
        postWarning(`Unable to parse yaml header. There is a problem your yaml file. ${error}`);
    }
    return details;
}

function getYamlDescription(yamlContent) {
    let description = "";
    if (yamlContent.title) {
        description = yamlContent.title;
        description = endWithPeriod(yamlContent.title);
    }
    if (yamlContent.summary) {
        description += ` ${yamlContent.summary}`;
        description = endWithPeriod(description);
    }
    if (yamlContent.abstract) {
        description += buildParagraphFromAbstract(yamlContent.abstract);
    }
    return description;
}

function buildParagraphFromAbstract(abstract) {
    abstract = abstract.replace(/\n/g, "");
    abstract = abstract.replace(/-\s+/mg, ". ");
    abstract = abstract.replace(/:./g, ":");
    abstract = endWithPeriod(abstract);
    return abstract;
}

function endWithPeriod(content: string) {
    if (!content.endsWith(".")) {
        content += ".";
    }
    return content;
}

function getMainContentIfExists(main: string, alt: string) {
    if (main) {
        return main;
    } else {
        return alt;
    }
}

export function getPath(basePath: any, filePath: any) {
    let breadCrumb = "docs.microsoft.com";
    const directory = getDirectoryName(basePath.split("/"));
    if (directory) {
        if (directory.name === "Learn") {
            breadCrumb += ` › Docs › ${directory.name} › Browse`;
        } else {
            breadCrumb += ` › en-us › ${directory.name} `;
        }
    }
    let repoArr = filePath.split("/");
    if (filePath.startsWith("docs")) {
        repoArr = repoArr.slice(0, -1);
    } else {
        repoArr = repoArr.slice(1, -1);
    }
    repoArr.map((dir) => {
        breadCrumb += ` › ${dir} `;
    });
    return shortenWithElipses(breadCrumb, 70);
}

function getDirectoryName(repoArr: string[]) {
    let repoName = repoArr.pop();
    if (repoName) {
        repoName = repoName.toLowerCase();
        const directory = repoMapping.find((repo) => {
            return repoName.startsWith(repo.repoName);
        });
        if (directory) {
            return directory;
        } else {
            return getDirectoryName(repoArr);
        }
    }
}

export function shortenWithElipses(content, size) {
    if (!content) {
        return "";
    }
    if (content.length > size) {
        return content.substring(0, size) + "...";
    }
    return content;
}

export function shortenWithElipsesAtWordEnd(content, size) {
    if (!content) {
        return "";
    }
    if (content.length > size) {
        return content.substring(0, content.lastIndexOf(" ", size)) + "...";
    }
    return content;
}
