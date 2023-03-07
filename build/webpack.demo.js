const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { merge } = require('webpack-merge');
const { earthWebpackConfigFunction } = require('./earth-webpack-config');

const config = require('./config');

const isProd = process.env.NODE_ENV === 'production';
const isPlay = !!process.env.PLAY_ENV;

const webpackConfig = merge(
  earthWebpackConfigFunction({
    clientSource: './src/earth-core'
  }),
  {
    mode: process.env.NODE_ENV,
    entry: isProd
      ? {
          docs: './examples/entry.js'
        }
      : isPlay
      ? './examples/play.js'
      : './examples/entry.js',
    output: {
      path: path.resolve(process.cwd(), './examples/shinegis-client-23d/'),
      publicPath: process.env.CI_ENV || '',
      filename: '[name].[contenthash:7].js',
      chunkFilename: isProd ? '[name].[contenthash:7].js' : '[name].js'
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    },
    snapshot: {
      managedPaths: [
        /^(.+?[\\/]node_modules)[\\/]((?!cesium_shinegis_earth[\\/]Source)).*[\\/]*/
      ]
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: { ...config.alias, vue$: 'vue/dist/vue.esm.js' },
      modules: ['node_modules']
    },
    devServer: {
      host: '0.0.0.0',
      port: 8085,
      hot: true,
      devMiddleware: {
        publicPath: '/'
      },
      static: {
        directory: path.join(__dirname, '/')
      }
    },
    performance: {
      hints: false
    },
    stats: isProd
      ? { children: false }
      : {
          children: false,
          assets: false,
          chunks: false,
          entrypoints: false,
          modules: false
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
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'vue-loader',
              options: {
                compilerOptions: {
                  preserveWhitespace: false
                }
              }
            },
            {
              loader: path.resolve(__dirname, './md-loader/index.js')
            }
          ]
        },
        {
          test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
          type: 'javascript/auto',
          loader: 'url-loader',
          options: {
            limit: 8192,
            esModule: false,
            name: path.posix.join('static', '[name].[contenthash:7].[ext]')
          }
        }
      ]
    },
    plugins: [
      new NodePolyfillPlugin(),
      new ESLintPlugin({
        extensions: ['js', 'vue']
      }),
      new HtmlWebpackPlugin({
        template: './examples/index.tpl',
        filename: './index.html',
        favicon: './examples/favicon.ico'
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'examples/versions.json' }]
      }),
      new ProgressBarPlugin(),
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        'process.env.FAAS_ENV': JSON.stringify(process.env.FAAS_ENV)
      }),
      new webpack.LoaderOptionsPlugin({
        vue: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      })
    ],
    optimization: {
      minimizer: []
    },
    devtool: 'eval-source-map'
  }
);

if (isProd) {
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:7].css'
    })
  );
  webpackConfig.optimization.minimizer.push(
    new TerserPlugin({
      parallel: true
    }),
    new CssMinimizerPlugin()
  );
  // https://webpack.js.org/configuration/optimization/#optimizationsplitchunks
  webpackConfig.optimization.splitChunks = {
    cacheGroups: {
      defaultVendors: {
        test: /\/src\//,
        name: 'shinegis-client-23d',
        chunks: 'all'
      }
    }
  };
  webpackConfig.devtool = false;
}

module.exports = webpackConfig;
