const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require("webpack");

class Without {
    constructor (patterns) {
        this.patterns = patterns;
    }

    apply (compiler) {
        compiler.hooks.emit.tapAsync("MiniCssExtractPluginCleanup", (compilation, callback) => {

            Object.keys(compilation.assets)
                .filter(asset => {
                    let match = false,
                        i = this.patterns.length;
                    while (i--) {
                        if (this.patterns[i].test(asset)) {
                            match = true;
                        }
                    }
                    return match;
                }).forEach(asset => {
                delete compilation.assets[asset];
            });

            callback();
        });
    }
}

module.exports = [
    {
        mode: "production",
        entry: {
            styles: "./resources/scss/styles.scss"
        },
        output: {
            path: __dirname + '/assets/css',
        },
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    exclude: /(node_modules)/,
                    use: [
                        // fallback to style-loader in development
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader', options: {
                                modules: {localIdentName: '[local]'},
                                sourceMap: true,
                                url: false
                            }
                        },
                        {
                            loader: 'postcss-loader', options: {
                                sourceMap: true,
                                url: false,
                                modules: true,
                                importLoaders: 1,
                                plugins: [
                                    require('autoprefixer')
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                implementation: require('sass'),
                                webpackImporter: false
                            }
                        }
                    ],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({}),
            new Without([/\.js(\.map)?$/]),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map'
            }),
            new webpack.ProgressPlugin(function (progress, type) {
                if (!progress && type === "compiling") {
                    process.stdout.write('\u001b[2J\u001b[1;1HRun building\n');
                }
            }),
        ],
    },
    {
        mode: "production",
        entry: {
            scripts: "./resources/js/scripts.js"
        },
        output: {
            path: __dirname + '/assets/js',
        },
        module: {
            rules: [
                {
                    test: /\.js$/i,
                    exclude: /(node_modules)/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: ['@babel/plugin-proposal-object-rest-spread'],
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map'
            }),
            new webpack.ProgressPlugin(function (progress, type) {
                if (!progress && type === "compiling") {
                    process.stdout.write('\u001b[2J\u001b[1;1HRun building\n');
                }
            }),
        ],
    },
];
