const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

// const MonacoEditorSrc = path.join(__dirname, "..", "src");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
            {
                loader: "ts-loader"
            }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["@babel/plugin-proposal-class-properties"]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    // Remove alias until https://github.com/microsoft/monaco-editor-webpack-plugin/issues/68 is fixed
    //alias: { "react-monaco-editor": MonacoEditorSrc }
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ["json", "javascript", "typescript"]
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html"
    })
  ],
  devServer: { contentBase: "./" },
  node: {
    fs: "empty"
  }
};
