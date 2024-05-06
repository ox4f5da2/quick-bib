const chalk = require("chalk");
const ora = require("ora");
const { googleUpdateHttp } = require("../http/request");
const { updateConfig } = require("../config/");

function updateGoogleCookie() {
  return new Promise((resolve, reject) => {
    googleUpdateHttp('/scholar?q=key&hl=zh-CN')
      .then(response => {
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
          const cookies = setCookie//.filter(item => item.startsWith('GSP'))
            .map((item) => {
              const reg = /(.*?);/;
              const match = item.match(reg);
              return match ? match[0] : '';
            }).join('');
          resolve(cookies);
        } else {
          reject('no cookie!');
        }
      })
      .catch(err => reject(err));
  })
}

async function updateCookie({ google, baidu, all }) {
  const spinner = ora('initializing...').start();
  try {
    if ((google && baidu) || all) {
      spinner.text = 'retrieving both baidu and google scholar cookie...';
    } else if (google) {
      spinner.text = 'retrieving google scholar cookie...';
      const cookie = await updateGoogleCookie();
      const { msg } = await updateConfig('google-cookie', cookie);
      spinner.succeed(msg);
    } else if (baidu) {
      spinner.text = 'retrieving google scholar cookie...';
    } else {
      spinner.fail(`please specify the parameters that need to be updated, use ${chalk.yellow('[-b,--baidu/-g,--google/-a,--all]')}!`);
    }
    spinner.stop();
  } catch (err) {
    if (err === 'no cookie!') {
      spinner.warn(err);
      return;
    }
    spinner.fail(err);
  }
}


module.exports = updateCookie;