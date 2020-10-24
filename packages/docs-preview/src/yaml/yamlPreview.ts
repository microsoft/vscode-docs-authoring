import * as vscode from 'vscode';
import { postWarning } from '../helper/common';
import {
	buildHeader,
	buildHighlightedContent,
	buildConceptualContent,
	buildTools,
	buildProductDirectory,
	buildAdditionalContent
} from './hubHelper';
import { buildLandingContentSection, buildLandingHeader } from './landingHelper';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsyaml = require('js-yaml');

export class YamlContentProvider implements vscode.TextDocumentContentProvider {
	public static readonly yamlURI = vscode.Uri.parse('yaml:');

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		return vscode.workspace.openTextDocument(uri).then(async document => {
			const content = document.getText();
			const startLine = document.lineAt(0).text;
			var html = '';
			switch (startLine) {
				case '### YamlMime:Landing': {
					html = await this.buildHtmlFromLanding(content);
					break;
				}
				case '### YamlMime:Hub': {
					html = await this.buildHtmlFromHub(content);
					break;
				}
				default: {
					postWarning('Yaml Preview currently only supports YamlMime:Landing / Hub');
					return '';
				}
			}
			return this.setConfigTheme(html);
		});
	}

	private async buildHtmlFromHub(content: string): Promise<string> {
		let yamlObj = await this.parseYaml(content);
		let body = '';
		let keys = Object.keys(yamlObj);
		body += buildHeader(yamlObj);
		for (let k of keys) {
			switch (k) {
				case 'highlightedContent':
					body += await buildHighlightedContent(yamlObj);
					break;
				case 'productDirectory':
					body += await buildProductDirectory(yamlObj);
					break;
				case 'tools':
					body += await buildTools(yamlObj);
					break;
				case 'conceptualContent':
					body += await buildConceptualContent(yamlObj);
					break;
				case 'additionalContent':
					body += await buildAdditionalContent(yamlObj);
					break;
				default:
					break;
			}
		}

		return this.finalizeHubHtml(body);
	}

	private async buildHtmlFromLanding(content: string): Promise<string> {
		let yamlObj = await this.parseYaml(content);
		let body = '';
		body += buildLandingHeader(yamlObj);
		body += await buildLandingContentSection(yamlObj);
		return this.finalizeLandingHtml(body);
	}

	private finalizeLandingHtml(body: string) {
		//original <section class="primary-holder column is-two-thirds-tablet is-three-quarters-desktop">
		return `<!DOCTYPE html>
    <html>
    <head>
         <link rel="stylesheet" type="text/css" href="StyleUri">
          <script type="text/javascript" src="yamlHelper.js"></script>
    </head>
    
    <body class="theme-light" lang="en-us" dir="ltr">
      <div class="mainContainer  uhf-container has-top-padding  has-default-focus" data-bi-name="body">
      <section class="primary-holder column">
        <div class="columns is-gapless-mobile has-large-gaps ">
          <div id="main-column" class="column  is-full is-11-widescreen">
            <main id="main" role="main" class="content " data-bi-name="content" lang="en-us" dir="ltr">
              ${body}
            </main>
          </div>
        </div>
      </section>
      </div>
    </body>
    </html>`;
	}

	private finalizeHubHtml(body: string) {
		return `<!DOCTYPE html>
    <html>
    <head>
         <link rel="stylesheet" type="text/css" href="StyleUri">
          <script type="text/javascript" src="yamlHelper.js"></script>
    </head>
    
          <body class="theme-light" lang="en-us" dir="ltr">
            <div class="mainContainer  uhf-container has-body-background-medium uhf-container is-full  has-default-focus" data-bi-name="body">
		          <div class="columns has-large-gaps is-gapless-mobile  is-gapless">
			          <section class="primary-holder column ">
				          <div class="columns is-gapless-mobile has-large-gaps  is-gapless">
				            <div id="main-column" class="column ">
                      <main id="main" role="main" class="content " data-bi-name="content" lang="en-us" dir="ltr">  
                       ${body}
                      </main>
                    </div>
                  </div>
                </section>
              </div>
            </div>
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

	private async parseYaml(Content: string) {
		let yamlObj: any;
		try {
			yamlObj = jsyaml.safeLoad(Content);
		} catch (e) {
			return '<br><span class="is-size-h5 docon docon-status-failure-outline" aria-hidden="true"> YAML Syntax Error :( </span>';
		}
		return yamlObj;
	}
}
