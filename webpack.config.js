const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env["NODE_ENV"] === "production";

module.exports = {
  entry: {
    editor: "./src/editor/index.ts",
    map: "./src/app/views/map.ts",
    maps: "./src/app/views/maps.ts",
  },
  mode: isProduction ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(css)$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "editor.css",
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  devServer: {
    writeToDisk: true,
  },
};
