// const jsyaml = require("js-yaml");
import * as jsyaml from "js-yaml";
export function getFirstParagraph(markdown) {
    const frstParagraphRegex = new RegExp(`^(?!#).+`, "m");
    const firstParagraphMatch = markdown.match(frstParagraphRegex);
    if (firstParagraphMatch) {
        return shortenWithElipses(firstParagraphMatch[0], 280);
    }
    return markdown;
}

export function parseMarkdownMetadata(metadata) {
    const details = { title: "", description: "", date: "" };
    const yamlContent = jsyaml.load(metadata);
    if (yamlContent) {
        details.title = shortenWithElipses(`${yamlContent.title} | Microsoft Docs`, 68);
        details.description = shortenWithElipses(yamlContent.description, 280);
        details.date = yamlContent["ms.date"];
    }
    return details;
}

export function parseYamlMetadata(metadata) {
    const details = { title: "", description: "" };
    const yamlContent = jsyaml.load(metadata);
    if (yamlContent && yamlContent.metadata) {
        details.title = getMainContentIfExists(yamlContent.metadata.title, yamlContent.title);
        details.title = shortenWithElipses(`${details.title} | Microsoft Docs`, 68);
        details.description = getMainContentIfExists(yamlContent.metadata.description, yamlContent.summary);
        details.description = shortenWithElipses(details.description, 280);
    }
    return details;
}

function getMainContentIfExists(main: string, alt: string) {
    if (main) {
        return main;
    } else {
        return alt;
    }
}

export function getPath(basePath: any, filePath: any) {
    const repoMapping = [
        { repoName: "azure-docs", name: "azure" },
        { repoName: "live-share", name: "live-share" },
        { repoName: "virtualization-documentation", name: "virtualization-documentation" },
        { repoName: "architecture-center", name: "architecture-center" },
        { repoName: "windows-itpro-docs", name: "windows" },
        { repoName: "powershell-docs", name: "powershell" },
        { repoName: "windowsserverdocs", name: "windows server" },
        { repoName: "sql-docs", name: "sql" },
        { repoName: "cpp", name: "C++" },
        { repoName: "intellicode", name: "intellicode" },
        { repoName: "office-docs-powershell", name: "powershell" },
        { repoName: "windows-uwp", name: "uwp" },
        { repoName: "vsonline", name: "online" },
        { repoName: "sccmdocs", name: "sccm" },
        { repoName: "officedocs-sharepoint", name: "sharepoint" },
        { repoName: "sysinternals", name: "sysinternals" },
    ];
    let breadCrumb = "docs.microsoft.com › en-us";
    const repoName: string = basePath.split("/").pop().toLowerCase();
    const directory = repoMapping.find((repo) => {
        return repoName.startsWith(repo.repoName);
    });
    if (directory) {
        breadCrumb += ` › ${directory.name}`;
    }
    const repoArr = filePath.split("/").slice(1, -1);
    repoArr.map((dir) => {
        breadCrumb += ` › ${dir}`;
    });
    return shortenWithElipses(breadCrumb, 70);
}

export function shortenWithElipses(content, size) {
    if (content.length > size) {
        return content.substring(0, size) + "...";
    }
    return content;
}
