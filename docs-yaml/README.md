
# Docs YAML Extension

[![Current-Version](https://vsmarketplacebadge.apphb.com/version/docsmsft.docs-yaml.svg)](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml)
[![Install-Count](https://vsmarketplacebadge.apphb.com/installs/docsmsft.docs-yaml.svg)](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml)
[![Open-Issues](https://vsmarketplacebadge.apphb.com/rating/docsmsft.docs-yaml.svg)](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml)

Provides Docs-YAML support via [yaml-language-server](https://github.com/redhat-developer/yaml-language-server).

## Schemas supported to validate

There are two categories of files that we run schema validation against:

1. For YAMLMime-based YAML file, we use the the YAMLMime to match the schema which we will use to do validation according to our [config](https://raw.githubusercontent.com/928PJY/docs-yaml/master/config/schema_config.json).  
Those schemas are hold on this [repository](https://github.com/MicrosoftDocs/schemas), Once schema files get updated, the extension will automatically pick up the latest version after a small latency (around 10min). There is no need to reopen or reload the extension.  
**But if a new schema is added to this repository, to use it, we need to update this [config](https://raw.githubusercontent.com/928PJY/docs-yaml/master/config/schema_config.json) and release extension with new version**

2. For toc file, there is no YAMLMime in the beginning of file, we use the filename to match the schema, and it is case-sensitive, `toc.yml` and `TOC.yml` will both be applied schema validation(*but `toc.yaml` will not*).  
The [schema](https://github.com/928PJY/docs-yaml/blob/master/schemas/toc.schema.json) used for toc YAML file is now built in the extension, and we are going to move it to schema repository in the future.

## Features

### New features:

* The code intellisense is more intelligent now, extension can provide the intellisense according to the schema structure but not just text mapping.(v0.1.8 and later)
* Extension can generate input template for `object`(including required propertied and optional properties with default value).(v0.1.8 and later)
* You can type a `-` to trigger the intellisense for generating a new array item.(v0.1.8 and later)

### 1. YAML validation

* Apply schema validation according to the [YAMLMime](#YamlMime)
* Detects errors such as:
    * Invalid property value type
    * Out of enum scope
    * Required property is missing
    * Unexpected property

![screencast](https://raw.githubusercontent.com/928PJY/docs-yaml/master/images/docs-yaml-extension-validation.gif)

### 2. Auto completion

* Generate input template for whole YAML file

> **For now, the VSCode don't support auto-completion on a comment, so do not type `#` to get intellisense, just type `YamlMime` or YAMLMime type.**

* Generate input template for an object(*if provided by schema*)  

> **Including required properties and optional properties with default value**

* Support properties intellisense(*if provided by schema*)
* Enumerated property value recommendation(*if provided by schema*)

> **Intellisense is automatically triggered by what you have typed, but you can  also hit *<kbd>Ctrl</kbd> + <kbd>Space</kbd>* to get what you can type**.

![screencast](https://raw.githubusercontent.com/928PJY/docs-yaml/master/images/docs-yaml-extension-intellisense.gif)

### 3. Hover support

* Hovering over a property shows description *if provided by schema*

![screencast](https://raw.githubusercontent.com/928PJY/docs-yaml/master/images/docs-yaml-extension-hover.gif)

## Extra Knowledge

### **YAMLMime**

A YAML syntax to identify the mime type of this YAML document, which will decide the applied schema type
e.g.

```yaml
### YamlMime:Module
....
```

* YAMLMime should be the first line
* There are should be a space between triple `#` and case-sensitive `YamlMime`
* There are should not be extra space between `YamlMime`, Mime-type and `:`

## Developer Support

### Developing the client side

1. Install prerequisites:
   * latest [Visual Studio Code](https://code.visualstudio.com/)
   * [Node.js](https://nodejs.org/) v6.0.0 or higher
2. Fork this repository.
3. Build this project.
    ```bash
    # clone your forked repository
    $ git clone https://github.com/{your-github-name}/docs-yaml
    $ cd docs-yaml
    # install npm dependencies
    $ npm install
    # compile
    $ npm run compile
    # open the project in vscode
    $ code .
    ```
4. Make changes as necessary and the run the code using F5.
    Refer to VS Code [documentation](https://code.visualstudio.com/docs/extensions/debugging-extensions) on how to run and debug the extension.
5. Create a pull-request to GitHub repository and we will review, merge it and publish new version extension regularly.

### Contributing to schemas and snippets

Coming soon.

## License

[MIT](https://docsmsft.gallerycdn.vsassets.io/extensions/docsmsft/docs-markdown/0.2.2/1547755350969/Microsoft.VisualStudio.Services.Content.License)

**All contributions are welcome!**
