const request = require('request');
const iconv = require('iconv-lite');
const { readConfig } = require('../config/');

const config = readConfig();

const PROXYURL = config.get('proxy');
const TIMEOUT = +config.get('timeout') || 10000;
const GOOGLEBASEURL = config.get('google');
const BAIDUBASEURL = format(config.get('baidu'));
const GOOGLECOOKIE = format(config.get('google-cookie'));
const BAIDUCOOKIE = format(config.get('baidu-cookie'));

const OPTIONSMAP = {
  'google': {
    proxy: PROXYURL,
    headers: {
      cookie: GOOGLECOOKIE,
    },
  },
  'baidu': {
    headers: {
      cookie: BAIDUCOOKIE
    },
  }
}

function format(base) {
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function promisefyRequest(url, options) {
  return new Promise((resolve, reject) => {
    request({
      url,
      timeout: TIMEOUT,
      ...options,
      encoding: null // buffer 流
    }, (error, response, body) => {
      if (error) {
        reject(error);
      }
      const contentType = response && response.headers && response.headers['content-type'];
      if (contentType) {
        const match = contentType.match(/charset=(?<charset>.*?)($|;)/);
        let charset = 'utf-8';
        if (match) {
          charset = match.groups.charset;
        }
        body = iconv.decode(body, charset.toLowerCase());
      }
      resolve(body);
    })
  })
}

function googleHttp(url, flag = true, cookie = '') {
  const options = OPTIONSMAP.google;
  if (cookie.length) {
    options.headers.cookie = `NID=${cookie};`;
  }
  return promisefyRequest(
    flag ? GOOGLEBASEURL + url : url,
    options
  );
}

function baiduHttp(url) {
  return promisefyRequest(
    BAIDUBASEURL + url,
    OPTIONSMAP.baidu
  );
}

module.exports = {
  googleHttp,
  baiduHttp,
  format,
};