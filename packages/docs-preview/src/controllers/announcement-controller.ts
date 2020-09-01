/* eslint-disable @typescript-eslint/no-var-requires */
import { authentication, ConfigurationTarget, extensions, window, workspace } from 'vscode';
import { output, postWarning } from '../helper/common';
import { column_end, columnEndOptions, columnOptions } from '../markdown-extensions/column';
import { container_plugin } from '../markdown-extensions/container';
import { div_plugin, divOptions } from '../markdown-extensions/div';
import { imageOptions, image_plugin, image_end } from '../markdown-extensions/image';
import { rowEndOptions, rowOptions } from '../markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from '../markdown-extensions/video';
import { keytar } from '../helper/keytar';
import { rootDirectory } from '../markdown-extensions/rootDirectory';
import { resolve } from 'url';
import { join, basename } from 'path';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

const defaultEmailAddressSetting: string = 'preview.defaultEmailAddress';
const service = 'dap-mailer';
const nodemailer = require('nodemailer');

let session: any;
let mailOptions: any;
let extensionPath: any;
let primaryEmailAddress: any;
let emailRecipients: any;
let emailSubject: string;
let password: string;
let emailBody: string;
let authToken: string;
// if user chooses not to authenitcate or is non-ms, do not prompt to sign in again during the active session
let authenticated: boolean = true;

export function announcementCommand() {
	const commands = [
		{ command: getUserInfo.name, callback: getUserInfo },
		{ command: deleteEmailPassword.name, callback: deleteEmailPassword }
	];
	return commands;
}

// check for signed-in user session. if user is not signed in, follow standard user flow
async function getUserInfo() {
	try {
		if (authenticated) {
			session = await authentication.getSession('microsoft', ['Mail.Send', 'Mail.ReadWrite'], {
				createIfNone: true
			});
		}
	} catch (error) {
		postWarning(error);
		output.appendLine(
			`User chose not to sign in or there was an authentication error. Check output window for additional details.`
		);
	}

	if (session) {
		output.appendLine(`Singed in as ${session.account.label}`);
		getAuthenticatedUserInfo();
	} else {
		authenticated = false;
		output.appendLine(`User is not signed in`);
		promptForPrimaryEmailAddress();
	}
}

async function getAuthenticatedUserInfo() {
	authToken = session.accessToken;
	primaryEmailAddress = session.account.label;
	getEmailToList(true);
}

// check for email address setting. if no address is present prompt for one
async function promptForPrimaryEmailAddress() {
	const defaultEmailAddress = workspace.getConfiguration().get(defaultEmailAddressSetting);
	if (defaultEmailAddress) {
		primaryEmailAddress = defaultEmailAddress;
		getEmailToList();
	} else {
		const getEmailAddress = window.showInputBox({
			prompt:
				'Enter your Microsoft or Outlook email address i.e. someone@microsoft.com/someone@outlook.com'
		});
		getEmailAddress.then(val => {
			if (!val) {
				return;
			} else {
				primaryEmailAddress = val;
				// add email address setting
				workspace
					.getConfiguration()
					.update(defaultEmailAddressSetting, primaryEmailAddress, ConfigurationTarget.Global);
			}
			getEmailToList();
		});
	}
}

function getEmailToList(signedIn?: boolean) {
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
		}
		if (signedIn) {
			convertMarkdownToHtml(true);
		} else {
			getPassword();
		}
	});
}

// check for existing password. if no password is found, prompt for user passowrd and store in secure location using keytar.
// more info available here: https://code.visualstudio.com/api/advanced-topics/remote-extensions#persisting-secrets
async function getPassword() {
	password = await keytar.getPassword(service, primaryEmailAddress);
	if (password) {
		convertMarkdownToHtml();
	} else {
		const userPassword = window.showInputBox({
			password: true,
			prompt: 'Enter your password'
		});
		userPassword.then(async val => {
			if (!val) {
				return;
			} else {
				password = val;
				await keytar.setPassword(service, primaryEmailAddress, password);
				convertMarkdownToHtml();
			}
		});
	}
}

// use markdown-it to generate html
function convertMarkdownToHtml(signedIn?: boolean) {
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
		let attachments = [];
		while ((imageName = imageRegex.exec(emailBody)) !== null) {
			imageName = imageName[1];
			imagePath = resolve(filePath, imageName);
			imageCid = imageName;
			emailBody = emailBody.replace(`<img src="${imageName}">`, `<img src="cid:${imageName}">`);
			attachments.push({
				fileName: imageName,
				path: imagePath,
				cid: imageCid
			});
		}
		console.log(attachments);
		// if the article is a blog add the distribution group table and title image
		if (isBlog) {
			extensionPath = extensions.getExtension('docsmsft.docs-preview').extensionPath;
			const bannerLabel = join(extensionPath, 'images/banner-label.png').replace(/\\/g, '/');
			//const bannerLabel =
			//	'https://github.com/microsoft/vscode-docs-authoring/blob/279970-markdown-as-mail-email-password/packages/docs-preview/images/banner-label.png?raw=true';
			const bannerImage = join(extensionPath, 'images/banner-image.png').replace(/\\/g, '/');
			//const bannerImage =
			//	'https://github.com/microsoft/vscode-docs-authoring/blob/279970-markdown-as-mail-email-password/packages/docs-preview/images/banner-image.png?raw=true';
			const titleImage = `
			<table class="MsoNormalTable" border="1" cellspacing="0" cellpadding="0" width="1179" style="width:884.35pt;background:#2E4B70;border-collapse:collapse"><tr style="height:9.6pt"><td width="628" valign="top" style="width:470.8pt;border:none;padding:0in 0in 0in 0in;height:9.6pt"><p class="MsoNormal" style="vertical-align:baseline"><img border="0" width="661" height="120" style="width:6.8854in;height:1.25in" src="${bannerLabel}"><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4">&nbsp;</span><o:p></o:p></p></td><td width="551" rowspan="2" valign="bottom" style="width:413.55pt;border:none;padding:0in 0in 0in 0in;height:9.6pt"><p class="MsoNormal" align="right" style="text-align:right;vertical-align:baseline"><span style="color:black"><img border="0" width="580" height="287" style="width:6.0416in;height:2.9895in" src="${bannerImage}"></span><span style="font-size:14.0pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:#0078D4">&nbsp;</span><o:p></o:p></p></td></tr><tr style="height:9.6pt"><td width="628" valign="top" style="width:470.8pt;border:none;padding:0in 0in 0in 0in;height:9.6pt"><p class="MsoNormal" style="vertical-align:baseline"><b><span style="font-size:18.0pt;font-family:&quot;Segoe UI Semibold&quot;,sans-serif;color:white">${emailSubject}</span></b><o:p></o:p></p></td></tr></table>`;
			emailBody = emailBody.replace(/<h1>(.*?)<\/h1>/, '');
			emailBody = titleImage.concat(emailBody);
			// add banner as embed image
			const bannerFileName = basename(bannerLabel);
			attachments.push({
				fileName: bannerFileName,
				path: bannerLabel,
				cid: bannerFileName
			});
			const bannerImageFileName = basename(bannerImage);
			attachments.push({
				fileName: bannerImageFileName,
				path: bannerImage,
				cid: bannerImageFileName
			});
			console.log(attachments);
		}
		output.appendLine(`Converted markdown to HTML`);

		mailOptions = {
			from: primaryEmailAddress, // sender address (who sends)
			to: emailRecipients, // list of receivers (who receives)
			subject: emailSubject, //, // Subject line
			attachments,
			html: emailBody
		};
		if (signedIn) {
			sendMailWithToken();
		} else {
			sendMailWithPassword();
		}
	} catch (error) {
		output.appendLine(error);
	}
}

function sendMailWithPassword() {
	const transporter = nodemailer.createTransport({
		host: 'smtp-mail.outlook.com', // hostname
		secureConnection: false, // TLS requires secureConnection to be false
		port: 587, // port for secure SMTP
		tls: {
			ciphers: 'SSLv3'
		},
		auth: {
			user: primaryEmailAddress,
			pass: password
		}
	});

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (error: any, info: any) {
		if (error) {
			return output.appendLine(error);
		}
		output.appendLine(`Message sent: ${info.response}`);
	});
}

async function sendMailWithToken() {
	// Create a Graph client
	var client = Client.init({
		authProvider: done => {
			// Just return the token
			done(null, authToken);
		}
	});
	const mail = {
		subject: 'Microsoft Graph JavaScript Sample',
		toRecipients: [
			{
				emailAddress: {
					address: 'jamarw@microsoft.com'
				}
			}
		],
		body: {
			content:
				'<h1>MicrosoftGraph JavaScript Sample</h1>Check out https://github.com/microsoftgraph/msgraph-sdk-javascript',
			contentType: 'html'
		}
	};
	try {
		let response = await client.api('/me/sendMail').post({ message: mail });
		console.log(response);
	} catch (error) {
		throw error;
	}
}

export async function deleteEmailPassword() {
	const defaultEmailAddress = workspace.getConfiguration().get(defaultEmailAddressSetting);
	if (defaultEmailAddress) {
		primaryEmailAddress = defaultEmailAddress;
		await keytar.deletePassword(service, primaryEmailAddress);
	}
}
