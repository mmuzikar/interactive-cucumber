const merge = require("webpack-merge");
const common = require("./webpack.config");

//Development webpack config
module.exports = merge(common, {
    mode: 'development',
    devtool: "source-map",
    devServer: { contentBase: "./" },
})