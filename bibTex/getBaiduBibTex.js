const { baiduHttp } = require('../http/request');
const cheerio = require('cheerio');
const { getTip, setDefault, obj2Query, sort } = require('../utils/getTip');

const reg = /paperid=(?<paperid>\w+?)&/;

function getResult(title, options) {
  return new Promise((resolve, reject) => {
    let [start, end] = sort(options.start, options.end);
    start = setDefault(start, 0, '-');
    end = setDefault(end, 0, '+');
    let filter = 'sc_year=';
    if (!(start === '-' && end === '+')) {
      filter = `sc_year={${start},${end}}`;
    }
    const query = obj2Query({
      'wd': title,
      'tn': 'SE_baiduxueshu_c1gjeupa',
      'sc_hit': '1',
      'filter': filter,
      'ie': 'utf-8',
      'sort': options.flag === 0 ? '' : 'sc_time'
    });
    baiduHttp(`/s?${query}`)
      .then(body => {
        if (body.includes('网络不给力，请稍后重试')) {
          reject('the network is poor, or the request is too frequent and has been temporarily banned by baidu scholar. please try again later!');
          return;
        }
        const $ = cheerio.load(body);
        const hrefs = $('h3 a[href]');
        if (!hrefs.length) {
          reject('no results, please confirm whether the keywords are correct!');
          return;
        }
        const paperid = hrefs[0].attribs.href;
        const match = paperid.match(reg);
        if (match) {
          const { paperid } = match.groups;
          resolve(paperid);
        }
        resolve('can not get paperid!');
      })
      .catch(error => reject(error));
  })
}

function getBibTex(paperid) {
  return new Promise((resolve, reject) => {
    baiduHttp(`/u/citation?type=bib&paperid=${paperid}`)
      .then(res => resolve(res))
      .catch(error => reject(error));
  })
}

async function getBaiduBibTex(title, options) {
  return new Promise(async (resolve, reject) => {
    const start = +new Date();
    try {
      const paperid = await getResult(title, options);
      const bibTex = await getBibTex(paperid);
      const end = +new Date();

      resolve({
        msg: bibTex,
        tip: getTip(title, end - start, 'success')
      });
    } catch (err) {
      const end = +new Date();

      reject({
        msg: new Error(`{${title}}: ${err}`),
        tip: getTip(title, end - start, 'error')
      })
    }
  })
}


module.exports = getBaiduBibTex;