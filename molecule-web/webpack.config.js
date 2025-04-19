const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");
const fs = require("fs");

// Get the root path (assuming your webpack config is in the root of your project)
const rootPath = path.resolve(__dirname);

// Check if .env exists
const envPath = path.resolve(rootPath, ".env");
const env = fs.existsSync(envPath)
  ? dotenv.config({ path: envPath }).parsed
  : {};

// Reduce the env variable to a single object
const envKeys = env
  ? Object.keys(env).reduce((prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(env[next]);
      return prev;
    }, {})
  : {};

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
      publicPath: isProduction ? "./" : "/",
    },
    mode: argv.mode || "development",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      // Enable this if you have static assets in the public directory
      new CopyPlugin({
        patterns: [{ from: "./public", to: "./" }],
      }),
      new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, "../molecule-wasm"),
        outDir: path.resolve(__dirname, "pkg"),
        forceMode: isProduction ? "production" : "development",
      }),
      new webpack.DefinePlugin(envKeys),
    ],
    experiments: {
      asyncWebAssembly: true,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 8080,
    },
    optimization: {
      minimize: isProduction,
    },
  };
};
