const { UPPERCASE, DOI } = require("../inquirer/term");

function keepUpperCase(key, val) {
  if (key === 'title') {
    return val.replaceAll(/[0-9A-Z][\w\-]*/g, (a) => `\{${a}\}`);
  }
  return val;
}

function deleteDOI(key, val) {
  if (key === 'doi') {
    return '';
  }
  return val;
}

const processMap = {
  [UPPERCASE]: keepUpperCase,
  [DOI]: deleteDOI
}

function genProcessList(flags) {
  const list = [];
  [...Object.entries(flags)].forEach(([key, val]) => {
    if (val) {
      list.push(processMap[key]);
    }
  })
  return list;
}

module.exports = {
  genProcessList
}