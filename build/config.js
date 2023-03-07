var path = require('path');
var fs = require('fs');
var nodeExternals = require('webpack-node-externals');
var Components = require('../components.json');

var externals = {};

setExternals('../src/api', externals);
setExternals('../src/directives', externals);
setExternals('../src/earth-core', externals);
setExternals('../src/map-core', externals);
setExternals('../src/mixins', externals);
setExternals('../src/utils', externals);

function setExternals(dir, externals) {
  fs.readdirSync(path.resolve(__dirname, dir)).forEach((file) => {
    var pathname = path.join(dir, file);
    if (fs.statSync(path.resolve(__dirname, pathname)).isDirectory()) {
      setExternals(pathname, externals);
    } else {
      file = path.basename(file, '.js');
      const srcPrePath = dir
        .replace(/\\/g, '/')
        .replace('../src', 'shinegis-client-23d/src');
      const libPrePath = dir
        .replace(/\\/g, '/')
        .replace('../src', 'shinegis-client-23d/lib');
      externals[`${srcPrePath}/${file}`] = `${libPrePath}/${file}`;
    }
  });
}

function setApiExternals(dir, externals) {
  fs.readdirSync(path.resolve(__dirname, dir)).forEach((file) => {
    var pathname = path.join(dir, file);
    if (fs.statSync(path.resolve(__dirname, pathname)).isDirectory()) {
      setExternals(pathname, externals);
    } else {
      file = path.basename(file, '.js');
      const srcPrePath = dir
        .replace(/\\/g, '/')
        .replace('../src/api', 'shinegis-js-api');
      const libPrePath = dir
        .replace(/\\/g, '/')
        .replace('../src', 'shinegis-client-23d/lib');
      externals[`${srcPrePath}/${file}`] = `${libPrePath}/${file}`;
    }
  });
}

// API独立迁出后删除此方法
setApiExternals('../src/api', externals);

Object.keys(Components).forEach(function (key) {
  externals[
    `shinegis-client-23d/packages/${key}`
  ] = `shinegis-client-23d/lib/${key}`;
});

externals = [
  Object.assign(
    {
      vue: 'vue',
      'shinegis-js-api': 'shinegis-client-23d/lib/api'
    },
    externals
  ),
  nodeExternals()
];

exports.externals = externals;

const alias = {
  main: path.resolve(__dirname, '../src'),
  packages: path.resolve(__dirname, '../packages'),
  examples: path.resolve(__dirname, '../examples'),
  'shinegis-client-23d': path.resolve(__dirname, '../'),
  '@sampleData': path.resolve(__dirname, '../examples/assets/data/index')
};

// 后续文件路径将修改为'./shinegis-js-api/index.js'
try {
  fs.accessSync('./src/api/index.js', fs.constants.R_OK);
  alias['shinegis-js-api'] = path.resolve(__dirname, '../src/api');
  console.log('当前模式:使用shinegis-js-api源码');
} catch (err) {
  console.log('当前模式:未使用shinegis-js-api源码');
}

exports.alias = alias;

exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue'
};

exports.jsexclude = /node_modules/;
