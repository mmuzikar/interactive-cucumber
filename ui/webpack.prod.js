const merge = require("webpack-merge");
const common = require("./webpack.config");

//Release webpack plugin
module.exports = merge(common, {
    mode: 'production'
});