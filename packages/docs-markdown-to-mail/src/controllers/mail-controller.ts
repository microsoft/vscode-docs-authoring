import { authentication, extensions, window, workspace } from 'vscode';
import {
	getCommunicationDate,
	postError,
	postInformation,
	showStatusMessage,
	updateSiteRelativeLinks
} from '../helper/common';
import { column_end, columnEndOptions, columnOptions } from '../markdown-extensions/column';
import { container_plugin } from '../markdown-extensions/container';
import { div_plugin, divOptions } from '../markdown-extensions/div';
import { imageOptions, image_plugin, image_end } from '../markdown-extensions/image';
import { rowEndOptions, rowOptions } from '../markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from '../markdown-extensions/video';
import { rootDirectory } from '../markdown-extensions/rootDirectory';
import { resolve } from 'url';
import { basename, extname, join } from 'path';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { generateHtml } from '../html/common-html';
import { now } from 'moment';

let articleName: string;
let authToken: string;
let emailBody: any;
let emailSubject: string;
let primaryEmailAddress: any;
let session: any;
let alertCSS: any;
let siteltrCSS: any;
const attachments = [];

export function mailerCommand() {
	const commands = [{ command: signInPrompt.name, callback: signInPrompt }];
	return commands;
}

export async function signInPrompt() {
	session = await authentication.getSession('microsoft', ['Mail.Send', 'Mail.ReadWrite'], {
		createIfNone: true
	});

	if (session) {
		authToken = session.accessToken;
		primaryEmailAddress = session.account.label;
		convertMarkdownToHtml();
	}
}

// use markdown-it to generate html
export async function convertMarkdownToHtml() {
	const extensionPath = extensions.getExtension('docsmsft.docs-markdown-to-mail').extensionPath;
	alertCSS = join(extensionPath, 'media', 'alert-styles.css');
	siteltrCSS = join(extensionPath, 'media', 'site-alert.css');
	const frontMatterRegex = /^(---)([^]+?)(---)$/gm;
	const titleRegex = /^(#{1})[\s](.*)[\r]?[\n]/gm;
	const h1Regex = /^#\s+/;
	const msCustomRegex = /^ms\.custom:\s+(.*)/m;
	const imageRegex = /src="(.*?)"/gi;
	const editor = window.activeTextEditor;
	let imageName: any;
	let imagePath: string;
	let imageCid: string;
	let filePath: any;
	if (editor) {
		filePath = editor.document.uri.fsPath;
	}

	articleName = window.activeTextEditor?.document.fileName;
	articleName = basename(articleName);
	const announcementContent = window.activeTextEditor?.document.getText();
	let metadata: string;
	try {
		metadata = announcementContent.match(frontMatterRegex).toString();
	} catch (error) {
		showStatusMessage(`${articleName} does not contain any metadata.`);
	}

	// strip front matter to get correct title
	let updatedAnnouncementContent = announcementContent
		.replace(frontMatterRegex, '')
		.replace('<br><br>', '');
	let title: any;
	try {
		title = updatedAnnouncementContent.match(titleRegex);
		emailSubject = title.toString().replace(h1Regex, '');
	} catch (error) {
		postError(`Article does not contain a H1 (title). Abandoning command.`);
		return;
	}

	// resolve relative article links
	const relativeLinkRegex = /\[.*]\((.*\.md)\)/gm;
	let repoRoot = workspace.workspaceFolders[0].uri.fsPath;
	let relativeArticleName: any;
	let relativeArticlePath: string;
	let reviewLink: string;

	while ((relativeArticleName = relativeLinkRegex.exec(updatedAnnouncementContent)) !== null) {
		relativeArticleName = relativeArticleName[1];
		relativeArticlePath = resolve(filePath, relativeArticleName);
		// remove repo from path and add docs review url
		repoRoot = repoRoot.replace(/\\/g, '/');
		relativeArticlePath = relativeArticlePath.replace(`${repoRoot}/`, '').replace('.md', '');
		reviewLink = `https://review.docs.microsoft.com/en-us/${relativeArticlePath}?branch=master`;
		updatedAnnouncementContent = updatedAnnouncementContent.replace(
			relativeArticleName,
			reviewLink
		);
	}

	// handle site-relative links
	const siteRelativeLinkRegex = /\[.*]\((\/)/gm;
	while (siteRelativeLinkRegex.exec(updatedAnnouncementContent) !== null) {
		updatedAnnouncementContent = updateSiteRelativeLinks(updatedAnnouncementContent);
	}

	const MarkdownIt = require('markdown-it');
	const md = new MarkdownIt();
	try {
		md.use(column_end)
			.use(container_plugin, 'row', rowOptions)
			.use(container_plugin, 'row-end', rowEndOptions)
			.use(container_plugin, 'column', columnOptions)
			.use(container_plugin, 'column-end', columnEndOptions)
			.use(div_plugin, 'div', divOptions)
			.use(image_plugin, 'image', imageOptions)
			.use(image_end)
			.use(container_plugin, 'video', videoOptions)
			.use(container_plugin, 'legacyVideo', legacyVideoOptions)
			.use(rootDirectory)
			.use(require('markdown-it-front-matter'), function () {
				// removes yaml header from html
			});
		emailBody = md.render(updatedAnnouncementContent);
		showStatusMessage(`Successfully coverted markdown to html.`);
	} catch (error) {
		showStatusMessage(error);
		postError(error);
		return;
	}

	// embed images
	const fs = require('fs');
	let imageAsBase64: string;
	let imageExtension: string;
	const featureRequestImage = join(extensionPath, 'images', 'feature-request.png');
	emailBody = emailBody.replace(
		`img src="media/feature-request.png"`,
		`img src="${featureRequestImage}"`
	);
	try {
		while ((imageName = imageRegex.exec(emailBody)) !== null) {
			imageName = imageName[1];
			imagePath = resolve(filePath, imageName);
			imageExtension = extname(imagePath).replace('.', '');
			imageCid = imageName;
			imageAsBase64 = fs.readFileSync(imagePath, 'base64');
			emailBody = emailBody.replace(`<img src="${imageName}">`, `<img src="cid:${imageName}">`);

			attachments.push({
				'@odata.type': '#microsoft.graph.fileAttachment',
				name: imageName,
				contentType: `image/${imageExtension}`,
				contentBytes: imageAsBase64,
				contentId: imageCid,
				isInline: true
			});
		}
	} catch (error) {
		showStatusMessage(error);
	}

	// handle alerts
	const blockquoteRegex = /<blockquote>([\s\S]*?\[!(.*)])[\s\S]*?<\/blockquote>/gm;
	let alert: any;
	let alertType: string;
	let alertId: string;
	let alertText: string;

	while ((alert = blockquoteRegex.exec(emailBody)) !== null) {
		alertText = alert[1];
		alertType = alert[2].toLowerCase();
		alertId = alertType.charAt(0).toUpperCase() + alertType.slice(1);
		emailBody = emailBody
			.replace('<blockquote>', `<blockquote class="${alertType.toUpperCase()}">`)
			.replace(alertText, `<p class="code-line"><strong> ${alertId}</strong><br></p><p>`);
	}

	let bannerImagePath: any;
	let bannerImageName: any;

	bannerImagePath = join(extensionPath, 'images/microsoft-logo.png').replace(/\\/g, '/');
	bannerImageName = basename(bannerImagePath);
	imageAsBase64 = fs.readFileSync(bannerImagePath, 'base64');
	attachments.push({
		'@odata.type': '#microsoft.graph.fileAttachment',
		name: bannerImageName,
		contentType: `image/${imageExtension}`,
		contentBytes: imageAsBase64,
		contentId: bannerImageName,
		isInline: true
	});

	let templateType: any;
	let subjectPrefix: string;

	try {
		const templateTypeMatch: any = metadata.match(msCustomRegex);
		templateType = templateTypeMatch[1];
	} catch (error) {
		showStatusMessage(`Not a communication template.`);
	}

	const communicationDate = getCommunicationDate();

	switch (templateType) {
		case 'docs-coming-soon':
			try {
				subjectPrefix = 'Coming Soon: ';
				bannerImagePath = join(extensionPath, 'images/coming-soon.png').replace(/\\/g, '/');
			} catch (error) {
				showStatusMessage(error);
			}
			break;
		case 'docs-product-update':
			try {
				subjectPrefix = 'Product Update: ';
				bannerImagePath = join(extensionPath, 'images/product-update.png').replace(/\\/g, '/');
			} catch (error) {
				showStatusMessage(error);
			}
			break;
		case 'docs-released':
			try {
				subjectPrefix = 'Released: ';
				bannerImagePath = join(extensionPath, 'images/released.png').replace(/\\/g, '/');
			} catch (error) {
				showStatusMessage(error);
			}
			break;
	}
	bannerImageName = basename(bannerImagePath);
	emailBody = await generateHtml(emailBody, bannerImageName, communicationDate);
	// embed communication banner
	imageAsBase64 = fs.readFileSync(bannerImagePath, 'base64');
	attachments.push({
		'@odata.type': '#microsoft.graph.fileAttachment',
		name: bannerImageName,
		contentType: `image/${imageExtension}`,
		contentBytes: imageAsBase64,
		contentId: bannerImageName,
		isInline: true
	});

	sendMail(subjectPrefix);
}

async function sendMail(subjectPrefix?: string) {
	if (!subjectPrefix) {
		subjectPrefix = '';
	}
	// Create a Graph client
	const client = Client.init({
		authProvider: done => {
			// Just return the token
			done(null, authToken);
		}
	});

	const sendMail = {
		message: {
			subject: `${subjectPrefix}${emailSubject}`,
			body: {
				contentType: 'html',
				content: `${styles}${emailBody}`
			},
			toRecipients: [
				{
					emailAddress: {
						address: primaryEmailAddress
					}
				}
			],
			attachments
		}
	};
	try {
		await client.api('/me/sendMail').post(sendMail);
		showStatusMessage(`${articleName} converted to HTML and sent to ${primaryEmailAddress}`);
		postInformation(`${articleName} converted to HTML and sent to ${primaryEmailAddress}`);
	} catch (error) {
		showStatusMessage(error);
		postError(error);
		throw error;
	}
}

const styles = `<link rel="stylesheet" href="${siteltrCSS}">
<link rel="stylesheet" href="${alertCSS}">
<style>
h2 {
  font-size:12.0pt;
  font-family:"Segoe UI",sans-serif;
	color:#2F2F2F;
	padding: 0;
}
p {
  font-size:11.0pt;
  font-family:"Segoe UI",sans-serif;
	color:#2F2F2F;
	padding: 0;
}
</style>
</head>
`;
