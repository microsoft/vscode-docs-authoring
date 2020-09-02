/* eslint-disable @typescript-eslint/no-var-requires */
import { authentication, window } from 'vscode';
import { output } from '../helper/common';
import { column_end, columnEndOptions, columnOptions } from '../markdown-extensions/column';
import { container_plugin } from '../markdown-extensions/container';
import { div_plugin, divOptions } from '../markdown-extensions/div';
import { imageOptions, image_plugin, image_end } from '../markdown-extensions/image';
import { rowEndOptions, rowOptions } from '../markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from '../markdown-extensions/video';
import { rootDirectory } from '../markdown-extensions/rootDirectory';
import { resolve } from 'url';
import { extname } from 'path';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

let authToken: string;
let emailBody: string;
let emailRecipients: any;
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
		output.appendLine(`Singed in as ${session.account.label}`);
		authToken = session.accessToken;
		primaryEmailAddress = session.account.label;
		getEmailToList();
	} else {
		output.appendLine(`User is not signed in`);
		return;
	}
}

function getEmailToList() {
	// get length of email address to set cursor position in input box
	const emailLength = primaryEmailAddress.length;
	// get additional email addresses
	const getEmailAddress = window.showInputBox({
		prompt: `Mail to: ${primaryEmailAddress}; (you can specify other recipients separated by semi-colons)`,
		value: primaryEmailAddress,
		valueSelection: [emailLength, emailLength]
	});
	getEmailAddress.then(val => {
		if (!val) {
			return;
		} else {
			emailRecipients = val;
			convertMarkdownToHtml();
		}
	});
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
			})
			.use(require('markdown-it-style'), {
				h2: 'font-size:14.0pt;font-family:"Segoe UI";font-weight:normal;color:#0078D4',
				h3: 'font-size:12.0pt;font-family:"Segoe UI";font-weight:normal;color:#0078D4',
				p: 'font-size:12.0pt;font-family:"Segoe UI"'
			});
		emailBody = md.render(updatedAnnouncementContent);

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
		sendMail();
	} catch (error) {
		output.appendLine(error);
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
		let response = await client.api('/me/sendMail').post(sendMail);
		console.log(response);
	} catch (error) {
		console.log(error);
		throw error;
	}
}
