const ls = require('log-symbols');
const chalk = require('chalk');

exports.success = function (msg, prefix='', suffix='') {
  console.log(`${prefix}${chalk.green(ls.success)} ${msg}${suffix}`);
}

exports.error = function (msg, prefix = '', suffix = '') {
  console.log(`${prefix}${chalk.red(ls.error)} ${msg}${suffix}`);
}

exports.warning = function (msg, prefix = '', suffix = '') {
  console.log(`${prefix}${chalk.yellow(ls.warning)} ${msg}${suffix}`);
}

exports.info = function (msg, prefix = '', suffix = '') {
  console.log(`${prefix}${chalk.blue(ls.info)} ${msg}${suffix}`);
}

exports.log = function (logoList) {
  logoList.forEach(({ logo = '', msg = '', prefix = '', suffix = '' }) => {
    console.log(`${prefix}${logo} ${msg}${suffix}`);
  })
}