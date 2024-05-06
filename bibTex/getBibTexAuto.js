const getGoogleBibTex = require('../bibTex/getGoogleBibTex');
const getBaiduBibTex = require('../bibTex/getBaiduBibTex');

function hasChinese(str) {
  const pattern = /[\u4e00-\u9fa5]/;
  return pattern.test(str);
}

function getBibTexAuto(title, options) {
  if (hasChinese(decodeURIComponent(title))) {
    return getBaiduBibTex(title, options);
  }
  return getGoogleBibTex(title, options);
}

module.exports = getBibTexAuto;