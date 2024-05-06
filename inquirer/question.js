const chalk = require("chalk");
const { UPPERCASE, DOI } = require("./term");

function genDefault(val) {
  if (typeof val === 'boolean') {
    return ' ' + chalk.magenta(`[default: ${val ? 'Yes' : 'No'}]`);
  }
  return ' ' + chalk.magenta(`${val}`);
}

const defaultAnswer = {
  [UPPERCASE]: false,
  [DOI]: false
};

exports.defaultAnswer = defaultAnswer;

exports.processBib = [
  {
    type: 'confirm',
    name: UPPERCASE,
    message: 'Whether to retain the uppercase characters in the original title',
    suffix: genDefault(defaultAnswer[UPPERCASE]),
    default: defaultAnswer[UPPERCASE]
  },
  {
    type: 'confirm',
    name: DOI,
    message: 'Whether to delete DOI fields in BibTex',
    suffix: genDefault(defaultAnswer[DOI]),
    default: defaultAnswer[DOI]
  }
]