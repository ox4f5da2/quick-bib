class BibParse {
  constructor(bib, indent = 2) {
    this.firstLineReg = /@(?<type>\w+){(?<label>.*?),/;
    this.keyReg = /(?<key>\w+)={(?<val>.*?)},?/g;
    this.type = '';
    this.label = '';
    this.indent = indent;
    this.result = this.#parse(bib);
  }

  #parse(bib) {
    const result = {};
    const match = bib.match(this.firstLineReg);
    if (match) {
      const { type, label } = match.groups;
      this.type = type;
      this.label = label;
    }
    let res = null;
    const reg = this.keyReg;
    while (res = reg.exec(bib)) {
      if (res) {
        const { key, val } = res.groups;
        result[key] = val;
      }
    }
    return result;
  }

  set(key, val) {
    this.result[key] = val;
  }

  forEach(callback) {
    const result = this.result;
    [...Object.entries(result)].forEach(([key, val]) => {
      const res = callback.call(this, key, val);
      result[key] = res;
    });
  }

  pipe(processList) {
    if (processList && processList.length) {
      processList
        .filter(fn => typeof fn === 'function')
        .reduce((_, fn) => this.forEach(fn), 0);
    }
    return this;
  }

  get bib() {
    const result = this.result;
    const indent = this.indent;
    let str = `@${this.type}{${this.label},\n`;
    return [...Object.entries(result)].reduce((preStr, [key, val], index, array) => {
      if (!val) return preStr;
      let suffix = '';
      if (index !== array.length - 1) {
        suffix = ',';
      }
      preStr += `${' '.repeat(indent)}${key}={${val}}${suffix}\n`;
      return preStr;
    }, str) + '}';
  }
}

module.exports = BibParse;