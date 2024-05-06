const chalk = require("chalk");
const figlet = require('figlet');
const { version } = require('../package.json');
const LEN = 20;

module.exports = function () {
    console.log(chalk.cyan(figlet.textSync('quick-bib',
        {
            font: 'Graffiti',
            horizontalLayout: 'full'
        }
    )));
    console.log('\n');
}