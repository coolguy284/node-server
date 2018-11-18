// jshint maxerr:1000 -W054
// jshint ignore:start
global.AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
global.GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
// jshint ignore:end
let cons = require('./console.js');
module.exports = {
  'feat' : require('./feat.js'),
  'mime' : require('./mime.js'),
  'tick' : require('./tick.js'),
  'i32a' : new Int32Array(new SharedArrayBuffer(4)),
  'handlerp' : {
    '/hen' : new Function('req', 'res', 'res.writeHead(200, {"Content-Type":"text/plain; chatset=utf-8"});res.write(req.url);res.end();'),
    '/ng?n=' : new Function('req', 'res', 'savedvars.np.push(decodeURIComponent(req.url.substr(6, Infinity)));res.writeHead(204);')
  },
  'handlerf' : {
    '/dat.html' : new Function('req', 'res', 'res.writeHead(200,{"Content-Type":"text/plain; chatset=utf-8"});res.write(new Date().toString());res.end();')
  },
  'notstartswith' : function notstartswith(val) {return !this.startsWith(val);},
  'ipform' : function ipform(ipstr) {
    return ipstr.split('.').map(x => x.padStart(3, '-')).join('.');
  },
  'escapeHTML' : function (val) {
    return escape(val).replace(/%u?((?:[0-9A-F]{2}){1,2})/g, '&#x$1;');
  },
  'unescapeHTML' : function (val) {
    return unescape(val.replace(/&#x([0-9A-F]{2});/g, '%$1').replace(/&#x([0-9A-F]{4});/g, '%u$1'));
  },
  'genid' : function genid(len, idst) {
    let idstr = '';
    let idc = idst || global.datajs.feat.idstr;
    for (let i = 0; i < len; i++) {
      idstr += idc[Math.floor(Math.random() * idc.length)];
    }
    return idstr;
  },
  'shufstr' : function shufstr(str, maxlen) {
    if (maxlen === undefined) {
      maxlen = Infinity;
    }
    let sstr = str.split('');
    let bstr = '';
    while (sstr.length > 0 && maxlen > 0) {
      bstr += sstr.splice(Math.floor(Math.random() * sstr.length), 1);
      maxlen--;
    }
    return bstr;
  },
  'tn' : function tn(str, lim) {
    if (str.length > lim) {
      return str.substr(0, lim) + '...';
    } else {
      return str;
    }
  },
  'sleep' : function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  },
  'sleepSync' : function sleepSync(ms) {
    Atomics.wait(datajs.i32a, 0, 0, ms);
  },
  'sleepImmediate' : function sleepImmediate() {
    return new Promise(function (resolve) {
      setImmediate(resolve);
    });
  },
  'immediateSync' : function immediate() {
    return new Promise(function (resolve) {resolve()});
  },
  'stacklessfunc' : require('./stacklessfunc.js'),
  'subdir' : function subdir(parent, dir) {
    const relative = path.relative(parent, dir);
    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  },
  'rm' : require('./rm.js'),
  'parseexec' : function parseexec(val) {
    val = val.split(/("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/);
    val = val.slice(1, val.length - 1);
    return val.filter(function (val) {return val.replace(/\s/g, '').length});
  },
  'cleartyplist' : function cleartyplist(nam) {
    global.chattyplist = chattyplist.filter(function (val) {return val[1] != nam;});
  },
  'proxyt' : require('./proxyt.js'),
  'bw' : require('./bw.js'),
  'exjson' : require('./exjson.js'),
  'debreq' : require('./debreq.js'),
  'adm' : require('./adm.js'),
  'comm' : require('./comm.js'),
  'consm' : require('./consm.js'),
  'Console' : cons.Console,
  '_consolecounts' : cons.counts,
  '_consoletimes' : cons.times,
  '_consolegrouplvl' : cons.grouplvl,
  's' : require('./s.js'),
  'splash' : require('./splash.js'),
};