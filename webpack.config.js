const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/editor/index.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(css)$/i,
        use: [
          //MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        include: path.resolve(
          __dirname,
          "./node_modules/bootstrap-icons/font/fonts"
        ),
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "webfonts",
            publicPath: "../webfonts",
          },
        },
      },

      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    //new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [{ from: "public", to: "dist" }],
    }),
    new HtmlWebpackPlugin({
      title: "Hello world?",
      template: "./src/editor/index.html",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        charset: "UTF-8",
      },
    }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
  },
};
