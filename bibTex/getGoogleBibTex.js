const cheerio = require('cheerio');
const { googleHttp } = require('../http/request');
const { getTip, setDefault, obj2Query, sort } = require('../utils/getTip');

function getResult(title, options) {
  return new Promise((resolve, reject) => {
    const [start, end] = sort(options.start, options.end);
    const query = obj2Query({
      'q': title,
      'hl': 'zh-CN',
      'as_ylo': setDefault(start, 0, ''),
      'as_yhi': setDefault(end, 0, ''),
      'scisbd': setDefault(options.flag, 0, '')
    });
    googleHttp(`/scholar?${query}`)
      .then((data) => {
        const $ = cheerio.load(data);
        const gs_rtElements = $('.gs_rt a[data-clk-atid]');
        const gs_rtSpan = $('.gs_rt>span[id]');
        if (gs_rtElements.length) {
          const atids = [...gs_rtElements][0].attribs['data-clk-atid'];
          resolve(atids);
        }
        if (gs_rtSpan.length) {
          const atids = [...gs_rtSpan][0].attribs.id;
          resolve(atids);
        }
        reject('no results, please confirm whether the keywords are correct!');
      })
      .catch(error => reject(error));
  });
}

function getPanel(atid) {
  return new Promise((resolve, reject) => {
    const query = obj2Query({
      'q': `info:${atid}:scholar.google.com/`,
      'output': 'cite',
      'scirp': 0,
      'hl': 'zh-CN'
    });
    googleHttp(`/scholar?${query}`)
      .then((data) => {
        const $ = cheerio.load(data);
        const gs_citiElements = $('.gs_citi');
        const bibTex = [...gs_citiElements].filter(el => $(el).text() === 'BibTeX').map(el => el.attribs.href);
        resolve(bibTex[0]);
      })
      .catch(error => reject(error));
  })
}

function getBibTex(href) {
  return new Promise((resolve, reject) => {
    googleHttp(href, false)
      .then((data) => {
        resolve(data);
      })
      .catch(error => reject(error));
  })
}

module.exports = function (title, options) {
  return new Promise(async (resolve, reject) => {
    const start = +new Date();
    try {
      const atid = await getResult(title, options);
      const href = await getPanel(atid);
      const bibTex = await getBibTex(href);
      const end = +new Date();
      resolve({
        msg: bibTex,
        tip: getTip(title, end - start, 'success')
      });
    } catch (e) {
      const end = +new Date();

      reject({
        msg: new Error(`{${title}}: ${e}`),
        tip: getTip(title, end - start, 'error')
      })
    }
  })
}