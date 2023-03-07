const defaultConfig = require('../.eslintrc');

module.exports = {
  ...defaultConfig,
  rules: {
    'no-console': 'off'
  }
};
