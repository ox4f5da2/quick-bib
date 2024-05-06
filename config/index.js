const fs = require('fs');
const path = require('path');
const { error } = require('../log');
const chalk = require('chalk');

const configFile = path.join(__dirname, '../', 'config.json');
let config = {};

exports.readConfig = function () {
  try {
    config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const keys = Reflect.ownKeys(config);
    return {
      get(key, defaultVal='') {
        return config[key] === undefined ? defaultVal : config[key];
      },
      has(key) {
        return keys.includes(key);
      },
      get all() {
        return config;
      }
    }
  } catch (err) {
    error('failed to read config file:', err);
  }
}

exports.writeConfig = function (key, val) {
  return new Promise((resolve, reject) => {
    try {
      const newConfig = { ...config, [key]: val };
      fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2));
      config = newConfig;
      resolve({
        data: newConfig,
        msg: `config ${chalk.magenta(key)} updated successfully.`,
        code: 1
      });
    } catch (err) {
      reject({
        data: config,
        msg: `Failed to write config ${chalk.magenta(key)}: ${err}`,
        code: 0
      });
    }
  })
}