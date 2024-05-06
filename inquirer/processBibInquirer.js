const inquirer = require('inquirer');
const { processBib, defaultAnswer } = require('./question');
const { genProcessList } = require('../bibProcess/');
const BibParse = require('../bibProcess/BibParse');
const { readConfig } = require('../config/');
const { error } = require('../log');
const chalk = require('chalk');

function getResult(answers, result) {
  const processList = genProcessList(answers);
  try {
    const modulePath = readConfig().get("bibTex-process");
    const customProcessList = require(modulePath);
    if (!Array.isArray(customProcessList)) {
      throw new Error(`the default export type of the "${chalk.magenta(modulePath)}" module is not Array!`);
    }
    result = result.map(bib => {
      const bibTex = new BibParse(bib).pipe([...processList, ...customProcessList]);
      return bibTex.bib;
    });
    return result;
  }catch(e) {
    error(e.message);
    process.exit();
  }
}

function createProcessBibInquirer(bibList, ifDefault = false) {
  return new Promise((resolve) => {
    if (ifDefault) {
      resolve([getResult(defaultAnswer, bibList), null]);
      return;
    }
    inquirer
      .prompt(processBib)
      .then((answers) => {
        let result = bibList;
        if (result) {
          result = getResult(answers, result);
        }
        resolve([result, null]);
      })
      .catch((error) => {
        if (error.isTtyError) {
          resolve([null, 'prompt couldn\'t be rendered in the current environment']);
        } else {
          resolve([null, error]);
        }
      });
  })
}

module.exports = createProcessBibInquirer;