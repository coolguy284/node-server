// jshint ignore:start
global.AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
global.GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
global.AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;
// jshint ignore:end
let cons = require('./console.js');
module.exports = {
  feat: require('./feat.js'),
  mime: require('./mime.js'),
  tick: require('./tick.js'),
  prng: require('./prng.js'),
  trng: require('./trng.js'),
  i32a: new Int32Array(new SharedArrayBuffer(4)),
  handlerp: require('./handlerp.js'),
  handlerf: require('./handlerf.js'),
  help: require('./help.js'),
  notstartswith: function notstartswith(val) {return !this.startsWith(val);},
  ipform: function ipform(ipstr) {
    if (/::ffff:(?:[0-9]{1,3}.){3}[0-9]{1,3}/.test(ipstr))
      return '::ffff:' + ipstr.slice(7, Infinity).split('.').map(x => x.padStart(3, '-')).join('.');
    else
      return ipstr.split('.').map(x => x.padStart(3, '-')).join('.');
  },
  escapeHTML: function (val) {
    return escape(val).replace(/%u?((?:[0-9A-F]{2}){1,2})/g, '&#x$1;');
  },
  unescapeHTML: function (val) {
    return unescape(val.replace(/&#x([0-9A-F]{2});/g, '%$1').replace(/&#x([0-9A-F]{4});/g, '%u$1'));
  },
  genid: function genid(len, idst) {
    let idc = idst || global.datajs.feat.idstr;
    return datajs.trng.getRandIntArray(idc.length, len).map(x => idc[x]).join('');
  },
  shufstr: function shufstr(str, maxlen) {
    if (maxlen === undefined) maxlen = Infinity;
    let lim = Math.min(str.length, maxlen);
    return datajs.trng.getRandIntOneChoiceArray(str.length, lim).map(x => str[x]).join('');
  },
  tn: function tn(str, lim) {
    if (str.length > lim) return str.substr(0, lim) + '...';
    else return str;
  },
  sleep: function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  },
  sleepPrecise: async function sleepPrecise(ms) {
    let et = Date.now() + ms;
    while (Date.now() < et) {
      if (t + 20 > et) await datajs.sleepImmediate();
      else await datajs.sleep(1);
    }
  },
  sleepSync: function sleepSync(ms) {
    Atomics.wait(datajs.i32a, 0, 0, ms);
  },
  sleepImmediate: function sleepImmediate() {
    return new Promise(function (resolve) {
      setImmediate(resolve);
    });
  },
  immediateSync: function immediate() {
    return new Promise(function (resolve) {resolve()});
  },
  stacklessfunc: require('./stacklessfunc.js'),
  subdir: function subdir(parent, dir) {
    const relative = path.relative(parent, dir);
    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  },
  fsPromisesExists: async function(path) {
    try {
      await fs.promises.access(path);
      return true;
    } catch (e) {
      return false;
    }
  },
  rm: require('./rm.js'),
  parseexec: function parseexec(val) {
    val = val.split(/("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/);
    val = val.slice(1, val.length - 1);
    return val.filter(function (val) {return val.replace(/\s/g, '').length});
  },
  proxyt: require('./proxyt.js'),
  bw: require('./bw.js'),
  exjson: require('./exjson.js'),
  debreq: require('./debreq.js'),
  adm: require('./adm.js'),
  comm: require('./comm.js'),
  consm: require('./consm.js'),
  Console: cons.Console,
  _conscounts: cons.counts,
  _constimes: cons.times,
  _consgrouplvl: cons.grouplvl,
  _cons: cons,
  term: require('./terminal.js'),
  s: require('./s.js'),
  Throttle: require('./throttle.js'),
  pstree: require('./pstree.js'),
  splash: require('./splash.js'),
  crawl: require('./crawl.js'),
};