var fs = require('fs');
var path = require('path');
var version = process.env.VERSION || require('../../package.json').version;
var content = { '1.3.10': '1.3' };
if (!content[version]) content[version] = '2.0';
fs.writeFileSync(
  path.resolve(__dirname, '../../examples/versions.json'),
  JSON.stringify(content)
);
