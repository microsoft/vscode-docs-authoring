/* eslint-disable @typescript-eslint/no-var-requires */
import { authentication, extensions, window } from 'vscode';
import { output, postError, postInformation } from '../helper/common';
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

let articleName: string;
let authToken: string;
let emailBody: string;
let emailSubject: string;
let primaryEmailAddress: any;
let session: any;
let attachments = [];

export function mailerCommand() {
	const commands = [{ command: signInPrompt.name, callback: signInPrompt }];
	return commands;
}

async function signInPrompt() {
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
export function convertMarkdownToHtml() {
	const frontMatterRegex = /^(---)([^]+?)(---)$/gm;
	const titleRegex = /^(#{1})[\s](.*)[\r]?[\n]/gm;
	const h1Regex = /^#\s+/;
	const msCustomRegex = /ms\.custom:\s?internal-blog/gm;
	const imageRegex = /src="(.*?)"/gi;
	const editor = window.activeTextEditor;
	let imageName: any;
	let imagePath: string;
	let imageCid: string;
	let filePath: any;
	if (editor) {
		filePath = editor.document.uri.fsPath;
	}

	try {
		articleName = window.activeTextEditor?.document.fileName;
		articleName = basename(articleName);
		const announcementContent = window.activeTextEditor?.document.getText();
		const metatadata = announcementContent.match(frontMatterRegex).toString();
		let isBlog: boolean = false;
		if (metatadata.match(msCustomRegex)) {
			isBlog = true;
			output.appendLine(`Blog article`);
		}
		// strip front matter to get correct title
		const updatedAnnouncementContent = announcementContent.replace(frontMatterRegex, '');
		const title = updatedAnnouncementContent.match(titleRegex);
		emailSubject = title.toString().replace(h1Regex, '');

		const MarkdownIt = require('markdown-it');
		const md = new MarkdownIt();

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
			})
			.use(require('markdown-it-style'), {
				h2: 'font-size:14.0pt;font-family:"Segoe UI";font-weight:normal;color:#0078D4',
				h3: 'font-size:12.0pt;font-family:"Segoe UI";font-weight:normal;color:#0078D4',
				p: 'font-size:12.0pt;font-family:"Segoe UI"'
			});
		emailBody = md.render(updatedAnnouncementContent);
		emailBody = emailBody.replace(/<h1>(.*?)<\/h1>/, '');
		output.appendLine(`Successfully coverted markdown to html.`);

		// embed images
		const fs = require('fs');
		let imageAsBase64: string;
		let imageExtension: string;
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
		// if the article is a blog add the banner
		if (isBlog) {
			let extensionPath = extensions.getExtension('docsmsft.docs-markdown-to-mail').extensionPath;

			const bannerLabelPath = join(extensionPath, 'images/banner-label.png').replace(/\\/g, '/');
			const bannerFileName = basename(bannerLabelPath);

			const bannerImagePath = join(extensionPath, 'images/banner-image.png').replace(/\\/g, '/');
			const bannerImageName = basename(bannerImagePath);

			const titleImage = `
			<table class="MsoTableGrid" border="0" cellspacing="0" cellpadding="0" style="background:#2E4B70;border-collapse:collapse;border:none"><tr style="height:3.65pt"><td width="443" valign="top" style="width:332.6pt;padding:0in 0in 0in .3in;height:3.65pt"><p class="MsoNormal"><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4"><img width="322" height="67" style="width:3.3541in;height:.6944in" id="Picture_x0020_3" src="cid:${bannerFileName}" alt="&quot;Content + Learning team name&quot;"></span><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4"><o:p></o:p></span></p></td><td width="190" rowspan="2" valign="bottom" style="width:142.5pt;padding:0in 0in 0in 0in;height:3.65pt"><p class="MsoNormal" align="right" style="text-align:right"><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4"><img width="190" height="158" style="width:1.9791in;height:1.6458in" id="Picture_x0020_2" src="cid:${bannerImageName}" alt="&quot;Decorative Learn Pathways image&quot;"></span><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4"><o:p></o:p></span></p></td></tr><tr style="height:10.75pt"><td width="443" valign="top" style="width:332.6pt;padding:0in 0in 0in .3in;height:10.75pt"><p class="MsoNormal"><span style="font-size:18.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:white">${emailSubject}<o:p></o:p></span></p></td></tr></table>`;

			emailBody = titleImage.concat(emailBody);

			imageAsBase64 = fs.readFileSync(bannerLabelPath, 'base64');
			attachments.push({
				'@odata.type': '#microsoft.graph.fileAttachment',
				name: bannerFileName,
				contentType: `image/${imageExtension}`,
				contentBytes: imageAsBase64,
				contentId: bannerFileName,
				isInline: true
			});
			imageAsBase64 = fs.readFileSync(bannerImagePath, 'base64');
			attachments.push({
				'@odata.type': '#microsoft.graph.fileAttachment',
				name: bannerImageName,
				contentType: `image/${imageExtension}`,
				contentBytes: imageAsBase64,
				contentId: bannerImageName,
				isInline: true
			});
		}
		sendMail();
	} catch (error) {
		output.appendLine(error);
		postError(error);
	}
}

async function sendMail() {
	// Create a Graph client
	var client = Client.init({
		authProvider: done => {
			// Just return the token
			done(null, authToken);
		}
	});

	const sendMail = {
		message: {
			subject: emailSubject,
			body: {
				contentType: 'html',
				content: emailBody
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
		output.appendLine(`${articleName} converted to HTML and sent to ${primaryEmailAddress}`);
		postInformation(`${articleName} converted to HTML and sent to ${primaryEmailAddress}`);
	} catch (error) {
		output.appendLine(error);
		postError(error);
		throw error;
	}
}
