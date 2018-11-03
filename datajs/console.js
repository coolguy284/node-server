module.exports = class Console {
  constructor (colog, cologmin, cologmax) {
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
    this.log = this.consoleCall.bind(this, 'log');
    this.info = this.consoleCall.bind(this, 'info');
    this.debug = this.consoleCall.bind(this, 'debug');
    this.warn = this.consoleCall.bind(this, 'warn');
    this.error = this.consoleCall.bind(this, 'error');
    this.clear = this.consoleCall.bind(this, 'clear');
  }
  inspect () {
    return 'Console {}';
  }
  consoleCall (cn, value) {
    if (cn != 'clear') {
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
        case 'dir':
        case 'dirxml':
          cologadd(value, null, this.colog);
          break;
        case 'debug':
          cologadd(value, '<span style = "color:#7f7f7f;">{}</span>', this.colog);
          break;
        case 'warn':
          cologadd(value, '<span style = "color:#3f3f00;background:#ffffcf;min-width:100%;float:left;">{}</span>', this.colog);
          break;
        case 'error':
          cologadd(value, '<span style = "color:#3f0000;background:#ffcfcf;min-width:100%;float:left;">{}</span>', this.colog);
          break;
      }
    } else {
      this.colog.splice(0, Infinity);
      for (let i = 0; i < (this.cologmin || datajs.feat.lim.cologmin); i++) {this.colog.push(['', '{}'])}
    }
  }
};