class Schedule {
  constructor(allNum = 3) {
    this.tasks = [];
    this.allNum = allNum;
    this.running = 0;
  }

  _run() {
    if (this.running < this.allNum && this.tasks.length) {
      this.running++;
      const { task, resolve, reject } = this.tasks.shift();
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this._run();
        })
    }
  }

  addTask(fn) {
    return new Promise((resolve, reject) => {
      this.tasks.push({
        task: fn,
        resolve,
        reject
      })
      this._run();
    })
  }
}

module.exports = Schedule;