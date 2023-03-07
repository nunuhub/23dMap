var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var defaultOptions = {
  earthSource: 'node_modules/cesium_shinegis_earth/Build/Cesium',
  clientSource: 'node_modules/shinegis-client-23d/lib/earth-core',
  earthBaseUrl: './'
};

var earthWebpackConfig = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(defaultOptions.earthSource, 'Workers'),
          to: 'Workers'
        },
        { from: path.join(defaultOptions.earthSource, 'Assets'), to: 'Assets' },
        {
          from: path.join(defaultOptions.earthSource, 'Widgets'),
          to: 'Widgets'
        },
        {
          from: path.join(defaultOptions.earthSource, 'ThirdParty'),
          to: 'ThirdParty'
        },
        {
          from: path.join(defaultOptions.clientSource, 'Assets'),
          to: 'Assets3D'
        }
      ]
    }),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify(defaultOptions.earthBaseUrl)
    })
  ]
};

var earthWebpackConfigFunction = function (_options) {
  var options = _options || {};
  var earthSource = options.earthSource || defaultOptions.earthSource;
  var clientSource = options.clientSource || defaultOptions.clientSource;
  var earthBaseUrl = options.earthBaseUrl || defaultOptions.earthBaseUrl;
  return {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(earthSource, 'Workers'), to: 'Workers' },
          { from: path.join(earthSource, 'Assets'), to: 'Assets' },
          { from: path.join(earthSource, 'Widgets'), to: 'Widgets' },
          { from: path.join(earthSource, 'ThirdParty'), to: 'ThirdParty' },
          {
            from: path.join(clientSource, 'Assets'),
            to: 'Assets3D'
          }
        ]
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify(earthBaseUrl)
      })
    ]
  };
};

module.exports = {
  earthWebpackConfig,
  earthWebpackConfigFunction
};
