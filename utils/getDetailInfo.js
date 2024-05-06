const chalk = require('chalk');
const {
  name,
  version,
  description,
  keywords,
  author,
  license
} = require('../package.json');

module.exports = function () {
  const detail = {
    name,
    version,
    description,
    keywords,
    author,
    license
  };
  let str = ' The more detail Iinformation:\n';
  [...Object.keys(detail)].forEach((key, index) => {
    str += `  [${index + 1}] ${key}: ${chalk.green(detail[key])}\n`;
  });
  return str;
}