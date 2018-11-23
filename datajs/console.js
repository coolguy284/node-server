let counts = Symbol('counts');
let times = Symbol('times');
let grouplvl = Symbol('grouplvl');
let Console = class Console {
  constructor(colog, cologmin, cologmax) {
    if (cologmax === undefined && cologmin !== undefined) {
      this.cologmin = undefined;
      this.cologmax = cologmin;
    }
    if (colog) {
      this.colog = colog;
    } else {
      this.colog = [];
      for (let i = 0; i < (this.cologmin || datajs.feat.lim.cologmin); i++) {this.colog.push(['', '{}'])}
    }
    this[counts] = new Map();
    this[times] = new Map();
    this[grouplvl] = 0;
    this.log = this.consoleCall.bind(this, 'log');
    this.info = this.consoleCall.bind(this, 'info');
    this.debug = this.consoleCall.bind(this, 'debug');
    this.warn = this.consoleCall.bind(this, 'warn');
    this.error = this.consoleCall.bind(this, 'error');
    this.dir = this.consoleCall.bind(this, 'dir');
    this.dirxml = this.consoleCall.bind(this, 'dirxml');
    this.count = this.consoleCall.bind(this, 'count');
    this.countReset = this.consoleCall.bind(this, 'countReset');
    this.group = this.consoleCall.bind(this, 'group');
    this.groupCollapsed = this.consoleCall.bind(this, 'groupCollapsed');
    this.groupEnd = this.consoleCall.bind(this, 'groupEnd');
    this.time = this.consoleCall.bind(this, 'time');
    this.timeEnd = this.consoleCall.bind(this, 'timeEnd');
    this.timeLog = this.consoleCall.bind(this, 'timeLog');
    this.clear = this.consoleCall.bind(this, 'clear');
  }
  [util.inspect.custom]() {
    return 'Console {}';
  }
  consoleCall(cn, value) {
    if (cn == 'dir') {
      cologadd('  '.repeat(this[grouplvl]) + util.inspect(value, arguments[2]), null, this.colog);
    } else if (cn == 'assert') {
      if (!value) {
        if (arguments.length > 2) {
          this.log.apply(this, ['Assertion failed: ' + arguments[2], ...Array.prototype.slice.call(arguments, 3, Infinity)]);
        } else {
          this.log('Assertion failed');
        }
      }
    } else if (cn == 'count') {
      value = '' + value;
      if (this[counts].has(value)) {
        this[counts].set(value, this[counts].get(value) + 1);
      } else {
        this[counts].set(value, 1);
      }
    } else if (cn == 'countReset') {
      value = '' + value;
      this[counts].delete(value);
    } else if (cn == 'group' || cn == 'groupCollapsed') {
      if (arguments.length > 1) {
        this.log(Array.prototype.slice.call(arguments, 1, Infinity));
      }
      this[grouplvl]++;
    } else if (cn == 'groupEnd') {
      this[grouplvl]--;
      if (this[grouplvl] < 0) this[grouplvl] = 0;
    } else if (cn == 'time') {
      value = '' + value;
      this[times].set(value, process.hrtime());
    } else if (cn == 'timeEnd') {
      value = '' + value;
      if (this[times].has(value)) {
        let td = process.hrtime(this[times].get(value));
        this.log(value + ': ' + (td[0] * 1000 + td[1] / 1000000) + 'ms');
        this[times].delete(value);
      }
    } else if (cn == 'timeLog') {
      value = '' + value;
      if (this[times].has(value)) {
        let td = process.hrtime(this[times].get(value));
        this.log.apply(this, [value + ': ' + td[0] * 1000 + td[1] / 1000000 + 'ms', ...Array.prototype.slice.call(arguments, 2, Infinity)]);
      }
    } else if (cn != 'clear') {
      if (typeof value != 'string') {
        value = util.inspect(value);
      }
      if (arguments.length > 2) {
        value = util.format.apply(null, Array.prototype.slice.call(arguments, 1, Infinity));
        return;
      }
      switch (cn) {
        case 'log':
        case 'info':
        case 'dirxml':
          cologadd('  '.repeat(this[grouplvl]) + value, null, this.colog);
          break;
        case 'debug':
          cologadd('  '.repeat(this[grouplvl]) + value, '<span style = "color:#7f7f7f;">{}</span>', this.colog);
          break;
        case 'warn':
          cologadd('  '.repeat(this[grouplvl]) + value, '<span style = "color:#3f3f00;background:#ffffcf;min-width:100%;float:left;">{}</span>', this.colog);
          break;
        case 'error':
          cologadd('  '.repeat(this[grouplvl]) + value, '<span style = "color:#3f0000;background:#ffcfcf;min-width:100%;float:left;">{}</span>', this.colog);
          break;
      }
    } else {
      this.colog.splice(0, Infinity);
      for (let i = 0; i < (this.cologmin || datajs.feat.lim.cologmin); i++) {this.colog.push(['', '{}'])}
    }
  }
};
module.exports = {Console, counts, times, grouplvl};