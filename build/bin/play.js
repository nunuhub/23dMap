'use strict';

var fs = require('fs');
const path = require('path');

fs.access('./examples/play/index.vue', function (err) {
  if (err) {
    try {
      fs.statSync(path.resolve(__dirname, '../../examples/play'));
    } catch (e) {
      fs.mkdirSync(path.resolve(__dirname, '../../examples/play'));
    }
    var templatePath = path.resolve(
      __dirname,
      '../../examples/pages/template/play.tpl'
    );
    var outputPath = path.resolve(__dirname, '../../examples/play/index.vue');
    var content = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(outputPath, content);
  }
});
