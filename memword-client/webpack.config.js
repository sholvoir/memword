const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const path = require('path');
var __dirname;
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, '..', 'sholvoir.github.io', 'memword');

const babelLoader = {
    loader: 'babel-loader'
};
const cssLoader = {
    loader: 'css-loader',
    options: {
        sourceMap: true,
        modules: true,
        localIdentName: '[name][hash:base64:5]',
        importLoaders: 1
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
    console.log('mode: ', mode);
    const devtool = prod ? '#source-map' : '#eval-source-map';
    const styleLoader = prod ? MiniCssExtractPlugin.loader : 'style-loader';
    const plugins = [
        new HtmlWebpackPlugin({
            favicon: path.join(srcDir, 'img', 'favicon.png'),
            template: path.join(srcDir, 'index.html'),
            filename: 'index.html',
            title: 'MemWord'
        }),
        new MiniCssExtractPlugin({
            filename: prod ? '[name].[hash].css' : '[name].css',
            chunkFilename: prod ? '[id].[hash].css' : '[id].css'
        }),
        new CopyPlugin([
            { from: path.join(srcDir, 'privacy-policy.html'), to: distDir },
            { from: path.join(srcDir, 'service-terms.html'), to: distDir }
        ]),
        new CleanWebpackPlugin()
    ];
    const config = {
        mode,
        entry: {
            app: srcDir + '/index.js'
        },
        output: {
            path: distDir,
            filename: '[name]-[hash].js'
        },
        module: {
            noParse: /jquery|lodash/,
            rules: [
                {
                    test: /\.css$/,
                    use: [styleLoader, 'css-loader', 'postcss-loader']
                },
                {
                    test: /\.scss$/,
                    use: [styleLoader, cssLoader, 'postcss-loader', 'sass-loader']
                },
                {
                    test: /\.m?(j|t)sx?$/,
                    exclude: /(node_modules|bower_components)/,
                    use: babelLoader
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
        devServer: {
            /*headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
            proxy: {
                '/api': 'http://localhost:4242'
            }*/
        },
        devtool,
        plugins
    };
    return config;
}
