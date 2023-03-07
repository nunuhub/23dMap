const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const config = require('./config');

module.exports = {
  mode: 'production',
  entry: {
    app: ['./src/index.js']
  },
  output: {
    path: path.resolve(process.cwd(), './lib'),
    publicPath: '/dist/',
    filename: 'shinegis-client-23d.common.js',
    chunkFilename: 'chunk/common/[id].js',
    libraryExport: 'default',
    library: 'SHINEGISCLIENT23D',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.alias,
    modules: ['node_modules']
  },
  externals: config.externals,
  performance: {
    hints: false
  },
  stats: {
    children: false
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        exclude: function (modulePath) {
          return (
            /node_modules/.test(modulePath) &&
            !/node_modules[\\/]cesium_shinegis_earth[\\/]Source/.test(
              modulePath
            )
          );
        },
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        type: 'javascript/auto',
        loader: 'url-loader',
        options: {
          limit: 1048576,
          esModule: false,
          name: path.posix.join('static', '[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new ProgressBarPlugin(),
    new VueLoaderPlugin()
  ]
};
