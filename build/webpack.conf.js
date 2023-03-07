const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
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
    filename: 'index.js',
    chunkFilename: 'chunk/umd/[id].js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'SHINEGISCLIENT23D',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.alias
  },
  externals: {
    vue: config.vue
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  },
  performance: {
    hints: false
  },
  stats: {
    children: false
  },
  module: {
    //解决Critical dependency: require function is used in a way in which dependencies cannot be statically extracted的问题
    unknownContextCritical: false,
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
