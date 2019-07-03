const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require("fs");

const cssFileNames = fs.readdirSync(path.join(__dirname, "css"));
const cssFilePaths = [];
for (const cssFileName of cssFileNames) {
    if (cssFileName.endsWith("css")) {
        cssFilePaths.push(path.resolve(__dirname, "css", cssFileName));
    }
}

const config = {
    entry: {
        "bundle.js": [
            path.resolve(__dirname, "src/Game.ts",)
        ],
        "bundle.css": cssFilePaths,
    },
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader",
                }),
            }
        ],
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
    ],
};

if (process.argv.includes("--prod")) {
    config.mode = "production";
    config.devtool = undefined;
} else if (process.argv.includes("--watch")) {
    config.watch = true;
}

module.exports = config;
