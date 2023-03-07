const semver = require('semver');
const execSync = require('child_process').execSync;

process.on('exit', () => {
  console.log();
});

const newVersion = process.argv[2];

const tags = execSync('npm dist-tag ls shinegis-client-23d')
  .toString()
  .trim()
  .split('\n');
const tag = newVersion.indexOf('-') > -1 ? 'beta' : 'latest';
const version = tags
  .find((item) => item.split(':')[0] === tag)
  .split(':')[1]
  .trim();
const result = semver.gt(newVersion, version) ? tag : 'shinegis-client-23d';
console.log(result);
