var webpack = require('webpack');

var isWebpack5 = webpack.version.split('.')[0] == '5';

module.exports = {
  earthWebpackConfig: isWebpack5
    ? require('./v5').earthWebpackConfig
    : require('./v4').earthWebpackConfig,
  earthWebpackConfigFunction: isWebpack5
    ? require('./v5').earthWebpackConfigFunction
    : require('./v4').earthWebpackConfigFunction
};
