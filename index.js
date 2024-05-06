#!/usr/bin/env node

const { program } = require('commander');
const { version, description, name } = require('./utils/getToolInfo');
const getInt = require('./utils/getInt');
const { readConfig, writeConfig } = require('./config/');
const { success, error, info } = require('./log/');
const printLogo = require('./utils/printLogo');
const getDetailInfo = require('./utils/getDetailInfo');
const createBibTex = require('./utils/createBibTex');
const chalk = require('chalk');
let config = readConfig();

program
  .addHelpText('before', printLogo())
  .showHelpAfterError('(run "bib --help" to list commands)');

program
  .name(name)
  .description(description)
  .version(version)

program
  .command('detail')
  .description('more detailed information')
  .action(() => info(getDetailInfo()))

program
  .command('create')
  .description('create BibTex file')
  .option('-t, --title [title...]', 'the article title you want to get the bibTeX, the title can also be some keywords, spaces in the title are replaced with "+" signs', [])
  .option('-e, --end [end]', 'the ending year of search range [int]', getInt, 0)
  .option('-s, --start [start]', 'the starting year of search range [int]', getInt, 0)
  .option('-f, --flag [flag]', 'search result sorting flag [0/1]. If it is 0, it will be sorted by relevance. If it is 1, it will be sorted in reverse chronological order', getInt, 0)
  .option('-o, --output <path>', 'bibTex output file absolute path')
  .option('-n, --name <name>', 'bibTex file name', 'bibTex')
  .option('-p, --path <path>', 'The absolute path of the txt file consisting of search keywords. Each line in the file contains a keyword. It is worth noting that its priority is higher than -t')
  .option('-g, --google', 'use google scholar', false)
  .option('-b, --baidu', 'use baidu scholar', false)
  .option('-a, --auto', 'if the title contains Chinese, use Baidu Scholar, otherwise use Google Scholar, and this option has the highest priority', false)
  .option('-c, --custom', 'whether to ask for subsequent processing after obtaining all BibTex', false)
  .option('-y, --yes', 'keep the default options for BibTex processing, otherwise inquirer will be displayed', false)
  .action(createBibTex)
  
program
  .command('get [key]')
  .description('get the value of the specified key in the configuration. If key is not specified, all will be returned')
  .action((key) => {
    if (!key) {
      const temp = config.all;
      [...Object.keys(temp)].forEach(key => {
        let val = temp[key];
        if (val.length > 50) {
          val = val.slice(0, 20) + '...' + val.slice(val.length - 20) + ` (tip: ${val.length} chars)`;
        }
        success(`${chalk.magenta(key)}: ${val}`)
      });
      return;
    }
    config.has(key) ? success(`${chalk.magenta(key)}: ${config.get(key)}`) : error('no such key');
  })

program
  .command('set <key> <value>')
  .description('set the value of the specified key in the configuration')
  .action((key, value) => {
    if (!config.has(key)) {
      error('no such key');
    } else {
      writeConfig(key, value)
        .then(({ data, msg }) => {
          config = data;
          success(msg);
        })
        .catch(({ data, msg }) => {
          config = data;
          error(msg);
        })
    }
  })

program.parse(process.argv);
