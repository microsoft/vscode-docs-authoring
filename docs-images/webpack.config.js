//@ts-check

'use strict';

const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        "imagemin": "commonjs imagemin",
        "imagemin-gifsicle": "commonjs imagemin-gifsicle",
        "imagemin-jpegtran": "commonjs imagemin-jpegtran",
        "imagemin-optipng": "commonjs imagemin-optipng",
        "imagemin-svgo": "commonjs imagemin-svgo",
        "imagemin-webp": "commonjs imagemin-webp",
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js', ',json']
    },
    optimization: {
        usedExports: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ]
};
module.exports = config; 