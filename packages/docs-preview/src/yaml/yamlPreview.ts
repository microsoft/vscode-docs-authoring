import * as vscode from 'vscode';
import { postWarning } from '../helper/common';
import { getTitle, getSummary, buildLandingHtml } from './yamlHelper';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsyaml = require('js-yaml');

export class YamlContentProvider implements vscode.TextDocumentContentProvider {
	public static readonly yamlURI = vscode.Uri.parse('yaml:');

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		return vscode.workspace.openTextDocument(uri).then(async document => {
			const content = document.getText();
			if (!(content.startsWith('### YamlMime:Landing') || content.startsWith('### YamlMime:Hub'))) {
				postWarning('Yaml Preview currently only supports YamlMime:Landing / Hub');
				return '';
			}
			const html = await this.buildHtmlFromContent(content);
			return this.setConfigTheme(html);
		});
	}

	private async buildHtmlFromContent(content: string): Promise<string> {
		const body = await this.parseYamlToHtml(content);
		//original 	<section class="primary-holder column is-two-thirds-tablet is-three-quarters-desktop">
		return `<!DOCTYPE html>
        <html>
				<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" type="text/css" href="StyleUri">
              <script type="text/javascript" src="yamlHelper.js"></script>
				</head>
				
				<body class="theme-light" lang="en-us" dir="ltr">
					<section class="primary-holder column">
						<div class="class="columns  has-large-gaps ">
				 			<div id="main-column" class="column is-full is-11-widescreen">
	  						<main id="main" role="main" class="content" data-bi-name="content" lang="en-us" dir="ltr"> 
									${body}
								</main>
							</div>
						</div>
					</section>
        </body>
				</html>`;
	}

	private setConfigTheme(html: string) {
		const previewThemeSetting: string = 'preview.previewTheme';
		const selectedPreviewTheme = vscode.workspace.getConfiguration().get(previewThemeSetting);
		const bodyClassRegex = new RegExp('body class="(.*)"', 'i');
		switch (selectedPreviewTheme) {
			case 'Light':
				html = html.replace(bodyClassRegex, 'body class="theme-light"');
				break;
			case 'Dark':
				html = html.replace(bodyClassRegex, 'body class="theme-dark"');
				break;
			case 'High Contrast':
				html = html.replace(bodyClassRegex, 'body class="theme-high-contrast"');
				break;
		}
		return html;
	}
	private async parseYamlToHtml(Content: string) {
		let yamlObj: any;
		try {
			yamlObj = jsyaml.safeLoad(Content);
		} catch (e) {
			return '<br><span class="is-size-h5 docon docon-status-failure-outline" aria-hidden="true"> YAML Syntax Error :( </span>';
		}
		let body = '';
		body += this.buildHeaderSection(await getTitle(yamlObj), await getSummary(yamlObj));
		body += this.buildContentSection(await buildLandingHtml(yamlObj));
		return body;
	}

	private buildHeaderSection(title: string, summary: string) {
		let html: string = '';
		html += '<section id="landing-head">';
		html += `<div class="has-padding-top-small has-padding-bottom-medium"> 
			<div class="column is-full">`;
		html += '<h1 class="is-size-h2">';
		html += title;
		html += '</h1>';
		html += '<p class="has-margin-top-small has-line-height-reset">';
		html += summary;
		html += '</p> </div> </div> </section>';
		return html;
	}

	private buildContentSection(landingContent: string) {
		let html: string = '';
		html +=
			'<section id="landing-content" class="has-padding-top-medium has-padding-bottom-medium">';
		html += '<div class="columns is-masonry is-three-masonry-columns" style="">';
		html += landingContent;
		html += '</div> </seciton>';
		return html;
	}
}
