const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
var __dirname;
const clientSrcDir = path.resolve(__dirname, 'client');
const clientDistDir = path.resolve(__dirname, 'dist/client');
const serverSrcDir = path.resolve(__dirname, 'server');
const serverDistDir = path.resolve(__dirname, 'dist');

const babeLoader = {
    loader: 'babel-loader',
    options: {
        presets: ['@babel/preset-env', '@babel/preset-react']
    }
};
const cssLoader = {
    loader: 'css-loader',
    options: {
        sourceMap: true,
        modules: true,
        localIdentName: '[name][hash:base64:5]'
    }
};
const urlLoader = {
    loader: 'url-loader',
    options: {
        limit: 8192
    }
};

module.exports = (env) => {
    const prod = env && env.prod;
    const mode = prod ? 'production' : 'development';
    const devtool = prod ? '#source-map' : '#eval-source-map';
    const plugins = [
        new HtmlWebpackPlugin({
            favicon: './client/img/favicon.png',
            template: './client/index.html',
            filename: 'index.html',
            title: 'MemWord',
            chunks: ['vender', 'app']
        })
    ]
    const serverConfig = {
        mode,
        target: 'node',
        entry: {
            index: serverSrcDir + '/index.js'
        },
        output: {
            path: serverDistDir,
            filename: 'index.js'
        },
        module: {
            rules: [
                {
                    test: /\.m?jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    use: babeLoader
                }
            ]
        }
    };
    const cssLoaders = prod ? ['file-loader', 'extract-loader', 'css-loader']
        : ['style-loader', 'css-loader'];
    const scssLoaders = prod ? ['file-loader', 'extract-loader', cssLoader, 'sass-loader']
        : ['style-loader', cssLoader, 'sass-loader'];
    const sassLoaders = prod ? ['file-loader', 'extract-loader', cssLoader, 'sass-loader?indentedSyntax']
        : ['style-loader', cssLoader, 'sass-loader?indentedSyntax'];
    const clientConfig = {
        mode,
        entry: {
            index: clientSrcDir + '/index.js'
        },
        output: {
            path: clientDistDir,
            filename: '[name]-[hash].js'
        },
        module: {
            noParse: /jquery|lodash/,
            rules: [
                {
                    test: /\.css$/,
                    use: cssLoaders
                },
                {
                    test: /\.scss$/,
                    use: scssLoaders
                },
                {
                    test: /\.sass$/,
                    use: sassLoaders
                },
                {
                    test: /\.m?jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    use: babeLoader
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    use: urlLoader
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    use: urlLoader
                },
                {
                    test: /\.(eot|woff2?|[to]tf)(\?.*)?$/,
                    use: urlLoader
                }
            ]
        },
        devtool,
        plugins
    };
    return serverConfig;
}
