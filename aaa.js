// jshint maxerr:1000 -W041
global.sst = process.hrtime();
global.sstdate = new Date();
global.olog = console.log;
global.oinfo = console.info;
global.odebug = console.debug;
global.owarn = console.warn;
global.oerror = console.error;
global.oclear = console.clear;
global.cologadd = function cologadd(value, temp, colog) {
  if (value.search('\n') > -1) {
    let sl = value.split('\n');
    for (let i in sl) cologadd(sl[i], temp, colog);
    return;
  }
  if (!colog) colog = global.colog;
  let consoleEntry = [value, temp || '{}'];
  colog.push(consoleEntry);
  if (colog == global.colog) global.cologVers++;
  let esObj = colog.es ?? consoles.colog?.es;
  if (esObj) esObj.emit('message', consoleEntry);
  if (colog.length > datajs.feat.lim.colog) {
    let removeAmt = colog.length - datajs.feat.lim.colog;
    colog.splice(0, removeAmt);
    if (esObj) esObj.emit('spliceb', removeAmt);
  }
  if (global.logfilename && datajs.feat.filelog & 1)
    logfiles.colog.write(value + '\n');
};
global.cologdadd = function cologdadd(value, temp) {
  let consoleEntry = [value, temp || '{}'];
  cologd.push(consoleEntry);
  global.cologdVers++;
  if (consoles.cologd) consoles.cologd.es.emit('message', consoleEntry);
  if (cologd.length > datajs.feat.lim.cologd) {
    let removeAmt = cologd.length - datajs.feat.lim.cologd;
    cologd.splice(0, removeAmt);
    if (consoles.cologd) consoles.cologd.es.emit('spliceb', removeAmt);
  }
  if (global.logfilename && datajs.feat.filelog & 2)
    logfiles.cologd.write(value + '\n');
};
global.consoleCall = function consoleCall(cn, value) {
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
        cologadd(value, null, colog);
        olog(value);
        break;
      case 'info':
        cologadd(value, null, colog);
        oinfo(value);
        break;
      case 'debug':
        cologadd(value, '<span style = "color:#7f7f7f;">{}</span>', colog);
        odebug(value);
        break;
      case 'warn':
        cologadd(value, '<span style = "color:#3f3f00;background-color:#ffffcf;min-width:100%;float:left;">{}</span>', colog);
        owarn(value);
        break;
      case 'error':
        cologadd(value, '<span style = "color:#3f0000;background-color:#ffcfcf;min-width:100%;float:left;">{}</span>', colog);
        oerror(value);
        break;
    }
  } else {
    colog.splice(0, Infinity);
    for (let i = 0; i < datajs.feat.lim.cologmin; i++) {colog.push(['', '{}'])}
    oclear(value);
    global.cologVers++;
    if (consoles.colog) consoles.colog.es.emit('refresh');
  }
};
global.consoles = {};
console.log = consoleCall.bind(global, 'log');
console.info = consoleCall.bind(global, 'info');
console.debug = consoleCall.bind(global, 'debug');
console.warn = consoleCall.bind(global, 'warn');
console.error = consoleCall.bind(global, 'error');
console.clear = consoleCall.bind(global, 'clear');
console.tslog = str => console.log('[' + new Date().toISOString() + ']' + (str.length > 0 ? ' ' + str : ''));
global.http = require('http');
global.https = require('https');
global.fs = require('fs');
global.zlib = require('zlib');
global.path = require('path');
global.os = require('os');
global.cp = require('child_process');
global.stream = require('stream');
global.EventEmitter = require('events');
global.crypto = require('crypto');
global.util = require('util');
global.datajs = require('./datajs');
global.exjson = datajs.exjson;
global.Throttle = datajs.Throttle;
if (datajs.feat.enc == 'aes') {
  global.CryptoJS = require('./modjs/crypto-js.min.js');
  global.cjsenc = function (text, pass) {
    return CryptoJS.AES.encrypt(text, pass).toString();
  };
  global.cjsdec = function (ct, pass) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(ct, pass));
  }
}
global.b64 = require('./modjs/b64.js');
global.b64d = require('./modjs/b64d.js');
global.b64a = require('./modjs/b64a.js');
global.sha256 = require('./modjs/sha256.js');
global.rsa = require('./modjs/rsa.js');
try {
  if (datajs.feat.enc == 'b64') {
    global.colog = JSON.parse(b64a.decode(fs.readFileSync(datajs.feat.datadir + '/colog.dat').toString()));
    global.cologd = JSON.parse(b64a.decode(fs.readFileSync(datajs.feat.datadir + '/cologd.dat').toString()));
  } else if (datajs.feat.enc == 'aes') {
    global.colog = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync(datajs.feat.datadir + '/colog.dat').toString(), b64a.server)));
    global.cologd = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync(datajs.feat.datadir + '/cologd.dat').toString(), b64a.server)));
  }
} catch (a) {
  try {
    if (datajs.feat.enc == 'b64') {
      global.colog = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync(datajs.feat.datadir + '/colog.dat'), b64a.server)));
      global.cologd = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync(datajs.feat.datadir + '/cologd.dat'), b64a.server)));
    } else if (datajs.feat.enc == 'aes') {
      global.colog = JSON.parse(b64a.decode(fs.readFileSync(datajs.feat.datadir + '/colog.dat').toString()));
      global.cologd = JSON.parse(b64a.decode(fs.readFileSync(datajs.feat.datadir + '/cologd.dat').toString()));
    }
  } catch (e) {
    global.colog = [];
    global.cologd = [];
    console.error('colog restore failed, colog empty');
    console.error(a);
    console.error(e);
  }
}
global.cologVers = 0;
global.cologVersSaved = 0;
global.cologdVers = 0;
global.cologdVersSaved = 0;
if (colog.length < datajs.feat.lim.cologmin) global.cologVers++;
if (cologd.length < datajs.feat.lim.cologdmin) global.cologdVers++;
while (colog.length < datajs.feat.lim.cologmin) colog.unshift(['', '{}']);
while (cologd.length < datajs.feat.lim.cologdmin) cologd.unshift(['', '{}']);
process.on('uncaughtException', function (err) {
  console.error('An exception occured and was caught to prevent server shutdown. Server may be unstable.');
  console.error(err);
});
process.on('unhandledRejection', function (reason, p) {
  console.error('Unhandled rejection from ' + p + ':');
  console.error(reason);
});
global.vm = require('vm');
global.vfs = require('./vfs');
global.reqg = require('./request_get.js');
global.reqh = require('./request_head.js');
global.reqp = require('./request_post.js');
global.reqo = require('./request_options.js');
global.hreq = require('./host_request.js');
global.treq = require('./troll_requests.js');
try {
  import('mime').then(module => global.mime = module.default).catch(e => {
    console.warn('mime import failed');
    global.mime = {getType: function () {return null;}};
  });
} catch (e) {
  console.warn('mime import failed');
  global.mime = {getType: function () {return null;}};
}
if (datajs.feat.notify) {
  // must add "node-notifier": "^7.0.1" to package.json
  try {
    global.notifier = require('node-notifier');
  } catch (e) {
    //console.warn('node-notifier import failed');
    global.notifier = { notify: function () {} };
  }
}
global.savedvars = {timeout:0,maxtimeout:0,uptime:0,maxuptime:0,np:[]};
global.debreq = [];
global.consoleswpenc = [];
global.codel = [];
global.baniplist = [];
global.chatherelist = [];
global.chattyplist = [];
global.chatkicklist = [];
global.chatbanlist = [];
global.chatbaniplist = [];
global.rchatbaniplist = [];
global.mchatbaniplist = [];
global.owneyesid = [];
global.loginid = [];
global.pkey = {};
global.pkeydat = -1000;
global.rid = 0;
global.ticks = 0;
global.req10s = false;
global.locked = false;
global.cpuUsage = process.cpuUsage();
global.pcpuUsage = global.cpuUsage;
global.dcpuUsage = { user: 0, system: 0 };
global.memUsage = process.memoryUsage();
global.port = process.env.PORT || 8080;
global.portssl = process.env.PORTSSL || 8443;
global.activeconn = [];
if (datajs.feat.datadir != '') {
  try {
    global.chat = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/chat.json').toString());
    if (Object.prototype.toString.call(chat) != '[object Array]') throw new Error('invalid chat object');
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('chat restore failed, chat empty');
      console.error(e);
    } else {
      console.log('creating chat.json');
    }
    global.chat = [];
  }
  try {
    global.rchat = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/rchat.json').toString());
    if (Object.prototype.toString.call(rchat) != '[object Array]') throw new Error('invalid rchat object');
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('rchat restore failed, rchat empty');
      console.error(e);
    } else {
      console.log('creating rchat.json');
    }
    global.rchat = [];
  }
  try {
    global.mchat = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/mchat.json').toString());
    if (Object.prototype.toString.call(mchat) != '[object Object]') throw new Error('invalid mchat object');
    for (var mchatObj of Object.values(mchat)) {
      Object.defineProperty(mchatObj, 'es', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: new EventEmitter(),
      });
    }
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('mchat restore failed, mchat empty');
      console.error(e);
    } else {
      console.log('creating mchat.json');
    }
    global.mchat = {};
  }
  try {
    global.viewshist = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/views.json').toString());
    if (Object.prototype.toString.call(viewshist) != '[object Object]') throw new Error('invalid viewshist object');
    if (Object.keys(viewshist).indexOf('reg') < 0) throw new Error('invalid viewshist object');
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('viewshist restore failed, viewshist empty');
      console.error(e);
    } else {
      console.log('creating views.json');
    }
    global.viewshist = {reg:{},ajax:{},p404:{}};
  }
  try {
    global.savedvarsa = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/savedvars.json').toString());
    if (Object.prototype.toString.call(savedvarsa) != '[object Object]') throw new Error('invalid savedvarsa object');
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('savedvars restore failed, savedvars empty');
      console.error(e);
    } else {
      console.log('creating savedvars.json');
    }
    global.savedvarsa = {};
  }
  try {
    global.saveddat = JSON.parse(fs.readFileSync(datajs.feat.datadir + '/saveddat.json').toString());
    if (Object.prototype.toString.call(saveddat) != '[object Object]') throw new Error('invalid saveddat object');
  } catch (e) {
    if (e.code != 'ENOENT') {
      console.error('saveddat restore failed, saveddat empty');
      console.error(e);
    } else {
      console.log('creating saveddat.json');
    }
    global.saveddat = {};
  }
} else {
  global.chat = [];
  global.rchat = [];
  global.mchat = {};
  global.viewshist = {reg:{},ajax:{},p404:{}};
  global.savedvarsa = {};
  global.saveddat = {};
}
if (datajs.feat.logdir != '') {
  global.logfilename = `${datajs.feat.logdir}/${sstdate.toISOString().replace(/:|\./g, '-').replace('Z', '')}`;
  global.logfiles = {
    colog: new datajs.s.LogFileStream(`${logfilename} -- colog.log`),
    cologd: new datajs.s.LogFileStream(`${logfilename} -- cologd.log`),
    debreq: new datajs.s.LogFileStream(`${logfilename} -- debreq.log`),
  };
}
global.chatVers = 0;
global.chatVersSaved = 0;
global.rchatVers = 0;
global.rchatVersSaved = 0;
global.mchatVers = 0;
global.mchatVersSaved = 0;
global.viewshistVers = 0;
global.viewshistVersSaved = 0;
global.savedvarsVers = 0;
global.savedvarsVersSaved = 0;
global.saveddatVers = 0;
global.saveddatVersSaved = 0;
global.chates = new EventEmitter();
global.rchates = new EventEmitter();
global.viewshistes = new EventEmitter();
global.savedvars = Object.assign(savedvars, savedvarsa);
delete global.savedvarsa;
global.savev = datajs.tick.savev;
adm = datajs.adm;
comm = datajs.comm.run;
datajs.tick.on();
datajs.consm.create('colog', 'colog');
datajs.consm.create('cologd', 'cologd');
datajs.consm.create('default');
datajs.consm.create('terminal', 'bash', {streams:true});
datajs.consm.create('simterminal', null, {terminal:true});
process.on('message', function (val) {
  switch (val[0]) {
    case 'alertcheck':
      process.send(['alertchecked']);
      break;
    case 'timeout':
      if (comconsole) {
        comconsole.log('Server timeout is ' + val[1]);
        delete global.comconsole;
      } else {
        console.log('Server timeout is ' + val[1]);
      }
      break;
  }
});
global.stdincons = new datajs.s.ConsoleStream(function (tx) {
  if (datajs.feat.stdincons) {
    try {
      console.log('>> ' + tx);
      if (tx[0] != ':') {
        let resp = eval(tx);
        if (resp !== undefined) console.log('<- ' + util.inspect(resp));
      } else {
        let resp = comm(tx.substr(1, Infinity));
        if (resp !== undefined) console.log('<- ' + util.inspect(resp));
      }
    } catch (e) {console.error(e);}
  }
});
process.stdin.pipe(stdincons);
global.rst = undefined;
global.rlt = undefined;
global.serverf = async function serverf(req, resa) {
  if (datajs.feat.reqtimelog) {
    rst = process.hrtime();
  }
  let res, rrid = rid++, ipaddr, proto, url, cookies, nam = null, sn = false;
  try {
  savedvars.timeout = 0;
  global.savedvarsVers++;
  if (datajs.feat.bwlimits.main == Infinity) {
    res = resa;
  } else {
    res = new Throttle({bps:datajs.feat.bwlimits.main});
  	res.writeHead = resa.writeHead.bind(resa);
  	res.pipe(resa);
    res.orig = resa;
  }
  if (datajs.feat.activeconn) {
    let activeconnind = activeconn.length, reqf, resf;
    if (!req.socket.destroyed) reqf = req;
    if (!resa.socket.destroyed) resf = res;
    if (reqf || resf) {
      activeconn[activeconnind] = [reqf, resf];
      req.on('aborted', () => {
        if (!activeconn[activeconnind]) return;
        activeconn[activeconnind][0] = undefined;
        if (datajs.feat.activeconn == 1 && !activeconn[activeconnind][0] && !activeconn[activeconnind][1]) {
          let temp;
          delete activeconn[activeconnind];
          if (activeconn.length > (temp = Math.max(...Object.keys(activeconn), -1) + 1)) activeconn.length = temp;
        }
      });
      req.on('close', () => {
        if (!activeconn[activeconnind]) return;
        activeconn[activeconnind][0] = undefined;
        if (datajs.feat.activeconn == 1 && !activeconn[activeconnind][0] && !activeconn[activeconnind][1]) {
          let temp;
          delete activeconn[activeconnind];
          if (activeconn.length > (temp = Math.max(...Object.keys(activeconn), -1) + 1)) activeconn.length = temp;
        }
      });
      req.on('end', () => {
        if (!activeconn[activeconnind]) return;
        activeconn[activeconnind][0] = undefined;
        if (datajs.feat.activeconn == 1 && !activeconn[activeconnind][0] && !activeconn[activeconnind][1]) {
          let temp;
          delete activeconn[activeconnind];
          if (activeconn.length > (temp = Math.max(...Object.keys(activeconn), -1) + 1)) activeconn.length = temp;
        }
      });
      res.on('close', () => {
        if (!activeconn[activeconnind]) return;
        activeconn[activeconnind][1] = undefined;
        if (datajs.feat.activeconn == 1 && !activeconn[activeconnind][0] && !activeconn[activeconnind][1]) {
          let temp;
          delete activeconn[activeconnind];
          if (activeconn.length > (temp = Math.max(...Object.keys(activeconn), -1) + 1)) activeconn.length = temp;
        }
      });
      res.on('finish', () => {
        if (!activeconn[activeconnind]) return;
        activeconn[activeconnind][1] = undefined;
        if (datajs.feat.activeconn == 1 && !activeconn[activeconnind][0] && !activeconn[activeconnind][1]) {
          let temp;
          delete activeconn[activeconnind];
          if (activeconn.length > (temp = Math.max(...Object.keys(activeconn), -1) + 1)) activeconn.length = temp;
        }
      });
    }
  }
  switch (datajs.feat.ipdm) {
    case 0:
      ipaddr = req.connection.remoteAddress;
      break;
    case 1:
      if (req.headers['x-forwarded-for']) {
        let shead = req.headers['x-forwarded-for'].split(', ');
        if (shead.length > 2) {
          ipaddr = shead[shead.length - 3];
        } else {
          ipaddr = shead[0];
        }
      } else {
        ipaddr = req.connection.remoteAddress;
      }
      break;
    case 2:
      if (req.headers['x-forwarded-for']) {
        let shead = req.headers['x-forwarded-for'].split(', ');
        ipaddr = shead[shead.length - 1];
      } else {
        ipaddr = req.connection.remoteAddress;
      }
      break;
  }
  switch (datajs.feat.httpsdm) {
    case 0:
      proto = req.connection.encrypted ? 'https' : 'http';
      break;
    case 1:
      if (req.headers['x-forwarded-proto']) {
        proto = req.headers['x-forwarded-proto'];
      } else {
        proto = req.connection.encrypted ? 'https' : 'http';
      }
      break;
    case 2:
      if (req.headers['x-forwarded-proto']) {
        proto = req.headers['x-forwarded-proto'];
      } else {
        proto = 'https';
      }
      break;
  }
  if (req.headers.host) url = req.headers.host;
  else url = '';
  cookies = datajs.rm.parsecookies(req);
  if (cookies.sid) {
    if (datajs.feat.loginip) {
      for (let i in loginid) {
        if (loginid[i][1] == cookies.sid && loginid[i][3] == ipaddr) {
          nam = loginid[i][2];
        }
      }
    } else {
      for (let i in loginid) {
        if (loginid[i][1] == cookies.sid) {
          nam = loginid[i][2];
        }
      }
    }
  }
  global.stime = new Date();
  let nolog = datajs.feat.nologheader ? req.headers['x-c284-nolog'] == '1' : false;
  if (datajs.feat.debreq && !nolog && (datajs.feat.el.cons.indexOf(req.url) < 0 || datajs.feat.debreqamt & 1) && (datajs.feat.el.consv.every(datajs.notstartswith, req.url) || datajs.feat.debreqamt & 2)) {
    debreq.push(datajs.rm.reqinfo(req, rrid, stime.getTime(), ipaddr, proto, url, cookies, nam));
    if (debreq.length > datajs.feat.lim.debreq)
      debreq.splice(0, debreq.length - datajs.feat.lim.debreq);
    if (global.logfilename && datajs.feat.filelog & 4)
      logfiles.debreq.write(JSON.stringify(debreq[debreq.length - 1]) + '\n');
  }
  if (!nolog) {
    if (datajs.feat.el.cons.indexOf(req.url) < 0 && datajs.feat.el.consv.every(datajs.notstartswith, req.url)) {
      let tsd = stime.toISOString();
      if (baniplist.indexOf(ipaddr.replace('::ffff:', '')) > -1 || (req.connection.remoteAddress != '::ffff:127.0.0.1' && datajs.feat.intmode)) {
        if (datajs.feat.hosts.main.indexOf(url) > -1) {
          console.log(datajs.tn('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + url + ' ' + req.url, datajs.feat.lim.cologm) + ' banned');
        } else {
          console.log(datajs.tn('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + url + ' ' + req.method + ' ' + url + ' ' + req.url, datajs.feat.lim.cologm) + ' banned');
        }
        cologdadd('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(req.connection.remoteAddress) + ' ' + proto.padEnd(5) + ' ' + url + ' ' + req.method + ' ' + req.url + ' ' + req.headers['x-forwarded-for'] + ' banned');
        res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('You are banned.');
        res.end();
        return;
      } else {
        if (datajs.feat.hosts.main.indexOf(url) > -1) {
          console.log(datajs.tn('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + req.url, datajs.feat.lim.cologm));
        } else {
          console.log(datajs.tn('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + url + ' ' + req.method + ' ' + req.url, datajs.feat.lim.cologm));
        }
        cologdadd('[' + tsd + '] ' + (''+rrid).padStart(5, '0') + ' ' + datajs.ipform(req.connection.remoteAddress) + ' ' + proto.padEnd(5) + ' ' + url + ' ' + req.method + ' ' + url + ' ' + req.url + ' ' + req.headers['x-forwarded-for']);
      }
    }
  }
  if (proto == 'http' && datajs.feat.httpsf) {
    res.writeHead(303, {'Location': 'https://' + url + req.url});
    res.end();
    return;
  }
  if (locked && datajs.feat.el.lockl.indexOf(req.url) < 0 && req.url.substr(0, 2) != '/a') {
    res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
    res.write('You are banned.');
    res.end();
    return;
  }
  if (datajs.feat.trolls && treq(req, res, rrid, ipaddr, proto, url, cookies, nam)) return;
  if (datajs.feat.hosts.main.indexOf(url) > -1 || datajs.feat.el.lockl.indexOf(req.url) > -1 || req.url.substr(0, 2) == '/a' || !datajs.feat.hosts.map[url]) {
    if (req.method == 'GET') {
      if (req.url.substr(0, 2) == '/s' && datajs.feat.tost) {
        adm.ipban(ipaddr); 
      }
      let rp = await reqg(req, res, rrid, ipaddr, proto, url, cookies, nam);
      if (!nolog && rp != -1) {
        if (datajs.feat.el.vh.indexOf(req.url) < 0 && datajs.feat.el.vhv.every(datajs.notstartswith, req.url) && Object.keys(datajs.handlerp).every(datajs.notstartswith, req.url)) {
          if (rp != 'p404') {
            if (datajs.feat.el.ajaxl.indexOf(req.url) < 0) rp = 'reg';
            else rp = 'ajax';
          }
          adm.vhadd(rp, req.url);
        }
      }
    } else if (req.method == 'HEAD') {
      await reqh(req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else if (req.method == 'POST') {
      await reqp(req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else if (req.method == 'OPTIONS') {
      await reqo(req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else {
      res.writeHead(501);
      res.end();
    }
  } else {
    let althost = datajs.feat.hosts.map[url];
    await hreq(req, res, rrid, ipaddr, proto, url, althost, cookies, nam);
  }
  req10s = true;
  global.etime = new Date();
  } catch (e) {
    console.error(e);
    try {
      if (res.resAwait)
        await res.resAwait;
      if (datajs.feat.errmsg) {
        fs.readFile('websites/perrmsg.html', function (err, data) {
          try {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(data.toString().replace('{error}', util.inspect(e).replace('\n', '<br>')));
            res.end();
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        let rs = fs.createReadStream('websites/perr.html');
        res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
        rs.pipe(res);
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (datajs.feat.reqtimelog) {
    rlt = process.hrtime();
    console.log('Request Time: ' + (((rlt[0] + rlt[1] / 1e9) - (rst[0] + rst[1] / 1e9)) * 1000).toFixed(3) + 'ms');
  }
};
if (datajs.feat.dohttp)
  global.serv = http.createServer(serverf).listen(port, undefined, function (err) {
    global.slt = process.hrtime();
    if (err) {
      console.tslog('Error: ' + err);
    } else {
      console.tslog('HTTP Server Listening on Port ' + port + ' (starting time: ' + (((slt[0] + slt[1] / 1e9) - (sst[0] + sst[1] / 1e9)) * 1000).toFixed(3) + 'ms)');
    }
  });
if (datajs.feat.dohttps)
  global.servtls = https.createServer({
    secureOptions: crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1,// | crypto.constants.SSL_OP_NO_TLSv1_2,
    key: fs.readFileSync(datajs.feat.certpath + 'key.pem'),
    cert: fs.readFileSync(datajs.feat.certpath + 'chain.pem'),
  }, serverf).listen(portssl, undefined, function (err) {
    global.slt2 = process.hrtime();
    if (err) {
      console.tslog('Error: ' + err);
    } else {
      console.tslog('HTTPS Server Listening on Port ' + portssl + ' (starting time: ' + (((slt2[0] + slt2[1] / 1e9) - (sst[0] + sst[1] / 1e9)) * 1000).toFixed(3) + 'ms)');
    }
  });
global.exitHandlerCalled = false;
global.exitHandler = function (dontExit) {
  if (global.exitHandlerCalled) return;
  global.exitHandlerCalled = true;
  console.tslog('Server Closing');
  datajs.tick.savevSync(true);
  console.tslog('Data Files Saved');
  if (!dontExit) process.exit();
};
process.on('SIGINT', () => exitHandler());
process.on('SIGTERM', () => exitHandler());