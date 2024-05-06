const fs = require('fs');
const cliProgress = require('cli-progress');
const clear = require("cli-clear");

const Schedule = require('../schedule/');
const getGoogleBibTex = require('../bibTex/getGoogleBibTex');
const getBaiduBibTex = require('../bibTex/getBaiduBibTex');
const getBibTexAuto = require('../bibTex/getBibTexAuto');
const { success, info, error, warning, log } = require('../log');
const chalk = require('chalk');
const ls = require('log-symbols');
const { readConfig } = require('../config/');
const createProcessBibInquirer = require('../inquirer/processBibInquirer');


const config = readConfig();

const MAXTASK = 20;
clear();
const b1 = new cliProgress.SingleBar({
  format: ls.info + ' Progress |' + chalk.cyan('{bar}') + '| {percentage}% || {value} / {total} Tasks || Tip: {title}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

function format(str) {
  return str.replaceAll('+', ' ');
}

module.exports = (options) => {
  const {
    google,
    baidu,
    auto,
    yes,
    custom
  } = options;
  let getBibTex = null;
  if (auto) {
    getBibTex = getBibTexAuto;
  } else {
    if (google && baidu) {
      error(`you can only use one of ${chalk.yellow('google')} or ${chalk.yellow('baidu')} at the same time. If you want to use both, you can use ${chalk.yellow('[-a/--auto]')}`);
      return;
    }
    if (google || (!google && !baidu)) {
      getBibTex = getGoogleBibTex;
    }
    if (baidu) {
      getBibTex = getBaiduBibTex;
    }
  }
  const output = options.output || config.get('output');
  const filename = options.name || config.get('filename');
  if (!output.length) {
    error(`output path can not be empty, please set ${chalk.red(`[-o / --output]`)}!`);
    return;
  }
  const bibPath = `${output}/${filename}.bib`;
  const result = [];
  let titles = options.title;
  const keywordFile = options.path;
  if (!keywordFile.endsWith('.txt')) {
    error(`the value of ${chalk.red('[--path/-p]')} must be a txt file!`);
    return;
  }
  if (!titles.length && !keywordFile) {
    error(`title or file path can not be empty, please set ${chalk.red(`[-t / --title]`)} or ${chalk.red(`[-p / --path]`)}!`);
    return;
  }
  if (keywordFile) {
    try {
      const titleStr = fs.readFileSync(keywordFile, { encoding: 'utf-8' });
      titles = titleStr
        .split('\n')
        .filter(item => Boolean(item))
        .map(item => item.trim())
    } catch {
      error(`read ${chalk.red(keywordFile)} failed!`);
      return;
    }
  }

  const schedule = new Schedule(MAXTASK);
  let cnt = 0;

  success('start getting BibTex in the specified list...');
  b1.start(titles.length, 0, { title: "" });
  const startTime = +new Date();
  titles.forEach((title, index) => {
    schedule
    .addTask(getBibTex.bind(null, title, options))
      .then(({ msg, tip }) => {
        result[index] = msg;
        b1.increment(1, { title: `${chalk.green(format(title))} ${ls.success}` });
      })
      .catch(({ msg, tip }) => {
        result[index] = msg;
        tip = `${tip}, Error: ${msg}`
        b1.increment(1, { title: `${chalk.red(format(title))} ${ls.error}` });
      })
      .finally(async () => {
        const endTime = +new Date();
        const timeStr = ((endTime - startTime) / 1000).toFixed(2);
        cnt++;
        if (cnt === titles.length) {
          b1.stop();
          const errors = result.filter(item => item instanceof Error);
          clear();
          if (errors.length === 0) {
            let bibList = result.filter(item => !(item instanceof Error))
            if (custom) {
              const [res, err] = await createProcessBibInquirer(bibList, yes);
              bibList = res;
              if (err) {
                error(err);
                return;
              }
            }
            fs.writeFileSync(bibPath, bibList.join('\n'), 'utf-8');
            clear();
            log([{
              logo: '🎉',
              msg: `all tasks have finished, takes ${chalk.magenta(timeStr)} second!`
            }, {
              logo: '📝',
              msg: `bibTex is already saved in ${chalk.magenta(bibPath)}!`
              }
            ]);
          } else {
            info(`${titles.length - errors.length} task completed, ${errors.length} task incomplete, the specific reasons are as follows:`);
            errors.forEach(err => error(format(err.message), '  '));
            warning(`if there are most unsuccessful attempts to obtain articles from BibTeX, please confirm whether the ${chalk.yellow('proxy')} is set correctly or the ${chalk.yellow('cookie')} may have expired!`, '\n')
          }
          
        }
      })
  })
}