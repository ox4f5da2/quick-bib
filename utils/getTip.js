const chalk = require("chalk");

function getTip(title, time, type) {
  let color = 'green';
  if (type === 'success') {
    color = 'green';
  } else if (type === 'error') {
    color = 'red';
  }
  return `{${chalk[color](title)}} takes ${chalk[color](`${(time / 1000).toFixed(2)}`)} Seconds`;
}

function setDefault(val, target, defaultVal) {
  return val === target ? defaultVal : val;
}

function obj2Query(obj) {
  return new URLSearchParams(obj).toString();
}

function sort(a, b) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return [min, max];
}

module.exports = {
  getTip,
  setDefault,
  obj2Query,
  sort
}