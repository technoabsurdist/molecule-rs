const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    // new CopyPlugin({
    //   patterns: [{ from: "./public", to: "./" }],
    // }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "../molecule-wasm"),
      outDir: path.resolve(__dirname, "pkg"),
    }),
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
};
