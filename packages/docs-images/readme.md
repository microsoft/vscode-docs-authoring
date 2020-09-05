# Docs Images

Docs Images provides image compression and resizing for folders and individual files to help authors for docs.microsoft.com:

* [Docs Images](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images), which compresses and resizes images.

## How to use the Docs Images extension

To access the Docs Images menu, right click on a folder or individual image file. Select "Compress all images in folder" or "Compress image" from the context menu.

![docs image context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-images/images/right-click-image-compression.png)

Once the Docs Image extension is run you can view the output console in docs-images output tab to view the compression and resizing details.

![docs image output](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-images/images/image-compressed.png)

## Configuration

To configure the Docs Images, you can adjust the max height and max width of images. These are used when applying compression, if an image is larger than these values -- the image is resized whilst maintaining the aspect ratio, prior to compression.

![docs image config](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-images/images/docs-images-configuration.png)

> **Note:** A max height or width value of `0`, is interpreted as do not enforce resize.

## Supported image types

* .png
* .jpg
* .jpeg
* .gif
* .svg
* .webp (note that webp images are not currently supported on Docs as they would require platform support for fallback images)

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
