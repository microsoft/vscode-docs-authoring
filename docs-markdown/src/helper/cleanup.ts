"use strict";

export function deleteEmptyMetadata(data: any) {
    const msAuthorRegex: any = new RegExp(/(ms\.author:)\s([a-zA-Z0-9]|\[)/i);
    const authorRegex: any = new RegExp(/(author:)\s([a-zA-Z0-9]|\[)/i);
    const prodRegex: any = new RegExp(/(ms\.prod:)\s([a-zA-Z0-9]|\[)/i);
    const serviceRegex: any = new RegExp(/(ms\.service:)\s([a-zA-Z0-9]|\[)/i);
    const subserviceRegex: any = new RegExp(/(ms\.subservice:)\s([a-zA-Z0-9]|\[)/i);
    const technologyRegex: any = new RegExp(/(ms\.technology:)\s([a-zA-Z0-9]|\[)/i);
    const topicRegex: any = new RegExp(/(ms\.topic:)\s([a-zA-Z0-9]|\[)/i);

    if (data.match(msAuthorRegex[1]) && !data.match(msAuthorRegex)) {
        data = data.replace(/^ms.author:.*$/m, '');
    }
    if (data.match(authorRegex[1]) && !data.match(authorRegex)) {
        data = data.replace(/^author:.*$/m, '');
    }
    if (data.match(prodRegex[1]) && !data.match(prodRegex)) {
        data = data.replace(/^ms.prod:.*$/m, '');
    }
    if (data.match(serviceRegex[1]) && !data.match(serviceRegex)) {
        data = data.replace(/^ms.service:.*$/m, '');
    }
    if (data.match(subserviceRegex[1]) && !data.match(subserviceRegex)) {
        data = data.replace(/^ms.subservice:.*$/m, '');
    }
    if (data.match(technologyRegex[1]) && !data.match(technologyRegex)) {
        data = data.replace(/^ms.technology:.*$/m, '');
    }
    if (data.match(topicRegex[1]) && !data.match(topicRegex)) {
        data = data.replace(/^ms.topic:.*$/m, '');
    }
    return data;
}

export function deleteNaMetadata(data: any) {
    const msAuthorRegex: any = new RegExp(/ms\.author:\s(na|n\/a)/i);
    const authorRegex: any = new RegExp(/author:\s(na|n\/a)/i);
    const prodRegex: any = new RegExp(/ms\.prod:\s(na|n\/a)/i);
    const serviceRegex: any = new RegExp(/ms\.service:\s(na|n\/a)/i);
    const subserviceRegex: any = new RegExp(/ms\.subservice:\s(na|n\/a)/i);
    const technologyRegex: any = new RegExp(/ms\.technology:\s(na|n\/a)/i);
    const topicRegex: any = new RegExp(/ms\.topic:\s(na|n\/a)/i);

    if (data.match(msAuthorRegex)) {
        data = data.replace(/^ms.author:.*$/m, '');
    }
    if (data.match(authorRegex)) {
        data = data.replace(/^author:.*$/m, '');
    }
    if (data.match(prodRegex)) {
        data = data.replace(/^ms.prod:.*$/m, '');
    }
    if (data.match(serviceRegex)) {
        data = data.replace(/^ms.service:.*$/m, '');
    }
    if (data.match(subserviceRegex)) {
        data = data.replace(/^ms.subservice:.*$/m, '');
    }
    if (data.match(technologyRegex)) {
        data = data.replace(/^ms.technology:.*$/m, '');
    }
    if (data.match(topicRegex)) {
        data = data.replace(/^ms.topic:.*$/m, '');
    }
    return data;
}

export function deleteCommentedMetadata(data: any) {
    const msAuthorRegex: any = new RegExp(/#ms\.author:/i);
    const authorRegex: any = new RegExp(/#author:/i);
    const prodRegex: any = new RegExp(/#ms\.prod:/i);
    const serviceRegex: any = new RegExp(/#ms\.service:/i);
    const subserviceRegex: any = new RegExp(/#ms\.subservice:/i);
    const technologyRegex: any = new RegExp(/#ms\.technology:/i);
    const topicRegex: any = new RegExp(/#ms\.topic:/i);

    if (data.match(msAuthorRegex)) {
        data = data.replace(/^#ms.author:.*$/m, '');
    }
    if (data.match(authorRegex)) {
        data = data.replace(/^#author:.*$/m, '');
    }
    if (data.match(prodRegex)) {
        data = data.replace(/^#ms.prod:.*$/m, '');
    }
    if (data.match(serviceRegex)) {
        data = data.replace(/^#ms.service:.*$/m, '');
    }
    if (data.match(subserviceRegex)) {
        data = data.replace(/^#ms.subservice:.*$/m, '');
    }
    if (data.match(technologyRegex)) {
        data = data.replace(/^#ms.technology:.*$/m, '');
    }
    if (data.match(topicRegex)) {
        data = data.replace(/^#ms.topic:.*$/m, '');
    }
    return data;
}

