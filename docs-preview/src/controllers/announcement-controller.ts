/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigurationTarget, window, workspace } from 'vscode';
import { output } from '../extension';
import { column_end, columnEndOptions, columnOptions } from '../markdown-extensions/column';
import { container_plugin } from '../markdown-extensions/container';
import { div_plugin, divOptions } from '../markdown-extensions/div';
import { imageOptions, mailOptions } from '../markdown-extensions/image';
import { rowEndOptions, rowOptions } from '../markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from '../markdown-extensions/video';
import { keytar } from '../helper/keytar';

export let filePath = '';

const defaultEmailAddressSetting: string = 'preview.defaultEmailAddress';
const service = 'dap-mailer';

export let primaryEmailAddress: any;
export let emailRecipients: any;
export let emailSubject: string;
export let password: string;
export let emailBody: string;

export function announcementCommand() {
	const commands = [
		{ command: getAnnouncementCredentials.name, callback: getAnnouncementCredentials }
	];
	return commands;
}

async function getAnnouncementCredentials() {
	const defaultEmailAddress = workspace.getConfiguration().get(defaultEmailAddressSetting);
	if (defaultEmailAddress) {
		primaryEmailAddress = defaultEmailAddress;
		getEmailToList();
	} else {
		const getEmailAddress = window.showInputBox({
			prompt: 'Enter your Microsoft email address i.e. someone@microsoft.com'
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
		}
		getPassword();
	});
}

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

function convertMarkdownToHtml() {
	const editor = window.activeTextEditor;
	if (editor) {
		filePath = editor.document.fileName;
	}

	const announcementContent = window.activeTextEditor?.document.getText();
	const frontMatterRegex = /^(---)([^]+?)(---)$/gm;
	// strip front matter
	const updatedAnnouncementContent = announcementContent.replace(frontMatterRegex, '');
	const titleRegex = /^(#{1})[\s](.*)[\r]?[\n]/gm;
	const title = announcementContent.match(titleRegex);
	emailSubject = title.toString().replace('# ', '');

	const MarkdownIt = require('markdown-it');
	const md = new MarkdownIt();
	try {
		md.use(column_end)
			.use(container_plugin, 'row', rowOptions)
			.use(container_plugin, 'row-end', rowEndOptions)
			.use(container_plugin, 'column', columnOptions)
			.use(container_plugin, 'column-end', columnEndOptions)
			.use(div_plugin, 'div', divOptions)
			.use(container_plugin, 'image', imageOptions)
			.use(container_plugin, 'video', videoOptions)
			.use(container_plugin, 'legacyVideo', legacyVideoOptions)
			.use(require('markdown-it-front-matter'), function () {
				// remove yaml header from mail
			});
		emailBody = md.render(updatedAnnouncementContent); // store html as emailBody
		output.appendLine(`Converted markdown to HTML\n${emailBody}`);
		sendMail();
	} catch (error) {
		output.appendLine(error);
	}
}

function sendMail() {
	const nodemailer = require('nodemailer');

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

	/* const handlebarsViewPath = join(extensionPath, 'templates', 'blog.handlebars');

	transporter.use(
		'compile',
		hbs({
			viewEngine: 'express-handlebars',
			viewPath: handlebarsViewPath
		})
	); */

	// setup e-mail data, even with unicode symbols
	/* const mailOptions = {
		from: primaryEmailAddress, // sender address (who sends)
		to: emailRecipients, // list of receivers (who receives)
		subject: emailSubject, // Subject line
		attachments: [
			{
				fileName: 'coming-soon.png',
				path: 'C:\\GitHub\\docs-markdown-testing\\testing-docs\\authoring\\media\\coming-soon.png',
				cid: '../../_site/testing-docs/authoring/links/media/coming-soon.png'
			}
		],
		html: emailBody
	}; */

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (error: any, info: any) {
		if (error) {
			return output.appendLine(error);
		}
		output.appendLine(`Message sent: ${info.response}`);
	});
}
