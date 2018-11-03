// jshint maxerr:1000 -W041
global.olog = console.log;
global.oinfo = console.info;
global.odebug = console.debug;
global.owarn = console.warn;
global.oerror = console.error;
global.oclear = console.clear;
global.cologadd = function cologadd(value, temp, colog) {
  if (value.search('\n') > -1) {
    let sl = value.split('\n');
    for (let i in sl) {
      cologadd(sl[i], temp, colog);
    }
    return;
  }
  if (!colog) { colog = global.colog; }
  colog.push([value, temp || '{}']);
  if (colog.length > datajs.feat.lim.colog) {
    colog.splice(0, colog.length - datajs.feat.lim.colog);
  }
};
global.cologdadd = function cologdadd(value, temp) {
  cologd.push([value, temp || '{}']);
  if (cologd.length > datajs.feat.lim.cologd) {
    cologd.splice(0, cologd.length - datajs.feat.lim.cologd);
  }
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
        cologadd(value, null, this.colog);
        olog(value);
        break;
      case 'info':
        cologadd(value, null, this.colog);
        oinfo(value);
        break;
      case 'debug':
        cologadd(value, '<span style = "color:#7f7f7f;">{}</span>', this.colog);
        odebug(value);
        break;
      case 'warn':
        cologadd(value, '<span style = "color:#3f3f00;background:#ffffcf;min-width:100%;float:left;">{}</span>', this.colog);
        owarn(value);
        break;
      case 'error':
        cologadd(value, '<span style = "color:#3f0000;background:#ffcfcf;min-width:100%;float:left;">{}</span>', this.colog);
        oerror(value);
        break;
    }
  } else {
    this.colog.splice(0, Infinity);
    for (let i = 0; i < (this.cologmin || datajs.feat.lim.cologmin); i++) {this.colog.push(['', '{}'])}
    oclear(value);
  }
};
console.log = consoleCall.bind(global, 'log');
console.info = consoleCall.bind(global, 'info');
console.debug = consoleCall.bind(global, 'debug');
console.warn = consoleCall.bind(global, 'warn');
console.error = consoleCall.bind(global, 'error');
console.clear = consoleCall.bind(global, 'clear');
global.http = require('http');
global.fs = require('fs');
global.path = require('path');
global.os = require('os');
global.cp = require('child_process');
global.stream = require('stream');
global.crypto = require('crypto');
global.datajs = require('./datajs/data.js');
global.exjson = datajs.exjson;
global.b64u = require('./modjs/b64.js');
global.b64d = require('./modjs/b64d.js');
global.b64a = require('./modjs/b64a.js');
global.sha256 = require('./modjs/sha256.js');
global.rsa = require('./modjs/rsa.js');
global.util = require('util');
global.vm = require('vm');
global.reqg = require('./request_get.js');
global.reqh = require('./request_head.js');
if (datajs.feat.enc == 'aes') {
  global.CryptoJS = require('./modjs/crypto-js.min.js');
}
try {
  switch (datajs.feat.enc) {
    case 'b64':
      global.colog = JSON.parse(b64a.decode(fs.readFileSync('data/colog.dat').toString()));
      global.cologd = JSON.parse(b64a.decode(fs.readFileSync('data/cologd.dat').toString()));
      break;
    case 'aes':
      global.colog = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync('data/colog.dat').toString(), b64a.server)));
      global.cologd = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync('data/cologd.dat').toString(), b64a.server)));
      break;
  }
} catch (a) {
  try {
    switch (datajs.feat.enc) {
      case 'b64':
        global.colog = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync('data/colog.dat'), b64a.server)));
        global.cologd = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(fs.readFileSync('data/cologd.dat'), b64a.server)));
        break;
      case 'aes':
        global.colog = JSON.parse(b64a.decode(fs.readFileSync('data/colog.dat').toString()));
        global.cologd = JSON.parse(b64a.decode(fs.readFileSync('data/cologd.dat').toString()));
    }
  } catch (e) {
    global.colog = [];
    global.cologd = [];
    console.error('colog restore failed, colog empty');
    console.error(e);
  }
}
try {
  global.mime = require('mime');
} catch (e) {
  console.warn('mime import failed');
  global.mime = {getType: function () {return null;}};
}
try {
  global.Throttle = require('advanced-throttle');
} catch (e) {
  console.warn('advanced-throttle import failed');
}
try {
  global.pstree = require('ps-tree');
} catch (e) {
  console.warn('ps-tree import failed');
}
global.b64 = b64u;
global.savedvars = {timeout:0,maxtimeout:0,uptime:0,maxuptime:0,np:[]};
global.debreq = [];
global.consoles = {};
global.consoleswpenc = [];
global.codel = [];
global.baniplist = [];
global.chatherelist = [];
global.chatkicklist = [];
global.chatbanlist = [];
global.chatbaniplist = [];
global.rchatbaniplist = [];
global.chattyplist = [];
global.owneyesid = [];
global.loginid = [];
global.starttime = new Date().getTime();
global.ticks = 0;
global.req10s = false;
global.locked = false;
try {
  global.chat = JSON.parse(fs.readFileSync('data/chat.json').toString());
} catch (e) {
  console.error('chat restore failed, chat empty');
  console.error(e);
  global.chat = [];
}
try {
  global.rchat = JSON.parse(fs.readFileSync('data/rchat.json').toString());
} catch (e) {
  console.error('rchat restore failed, rchat empty');
  console.error(e);
  global.rchat = [];
}
try {
  global.mchat = JSON.parse(fs.readFileSync('data/mchat.json').toString());
} catch (e) {
  console.error('mchat restore failed, mchat empty');
  console.error(e);
  global.mchat = [];
}
try {
  global.viewshist = JSON.parse(fs.readFileSync('data/views.json').toString());
} catch (e) {
  console.error('viewshist restore failed, viewshist empty');
  console.error(e);
  global.viewshist = {};
}
try {
  global.savedvarsa = JSON.parse(fs.readFileSync('data/savedvars.json').toString());
} catch (e) {
  console.error('savedvars restore failed, savedvars empty');
  console.error(e);
  global.savedvarsa = {};
}
try {
  global.saveddat = JSON.parse(fs.readFileSync('data/saveddat.json').toString());
} catch (e) {
  console.error('saveddat restore failed, saveddat empty');
  console.error(e);
  global.savedvarsa = {};
}
while (colog.length < datajs.feat.lim.colog) {
  colog.unshift(['', '{}']);
}
while (cologd.length < datajs.feat.lim.cologd) {
  cologd.unshift(['', '{}']);
}
global.savedvars = Object.assign(savedvars, savedvarsa);
delete global.savedvarsa;
global.savev = function savev() {
  fs.writeFile('data/chat.json', JSON.stringify(chat), function (err) {});
  fs.writeFile('data/rchat.json', JSON.stringify(rchat), function (err) {});
  fs.writeFile('data/mchat.json', JSON.stringify(mchat), function (err) {});
  fs.writeFile('data/views.json', JSON.stringify(viewshist), function (err) {});
  switch (datajs.feat.enc) {
    case 'b64':
      fs.writeFile('data/colog.dat', b64a.encode(JSON.stringify(colog)), function (err) {});
      fs.writeFile('data/cologd.dat', b64a.encode(JSON.stringify(cologd)), function (err) {});
      break;
    case 'aes':
      fs.writeFile('data/colog.dat', CryptoJS.AES.encrypt(JSON.stringify(colog), b64a.server), function (err) {});
      fs.writeFile('data/cologd.dat', CryptoJS.AES.encrypt(JSON.stringify(cologd), b64a.server), function (err) {});
      break;
  }
  fs.writeFile('data/savedvars.json', JSON.stringify(savedvars), function (err) {});
  fs.writeFile('data/saveddat.json', JSON.stringify(saveddat), function (err) {});
};
adm = datajs.adm;
comm = datajs.comm.run;
datajs.tick.on();
datajs.consm.create('default');
datajs.consm.create('terminal', 'bash');
process.on('uncaughtException', function (err) {
  console.error('An exception occured and was caught to prevent server shutdown. Server may be unstable.');
  console.error(err);
});
process.on('unhandledRejection', function (reason, p) {
  console.error('Unhandled rejection from ' + p + ':');
  console.error(reason);
});
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
global.serverf = function serverf(req, resa, nolog) {
  let res, ipaddr, proto, url, cookies, nam = null, sn = false;
  try {
  savedvars.timeout = 0;
  if (datajs.feat.bwlimits.main == Infinity) {
    res = resa;
  } else {
    res = new Throttle({bps:datajs.feat.bwlimits.main});
  	res.writeHead = resa.writeHead;
  	res._storeHeader = resa._storeHeader;
  	res.pipe(resa);
  }
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
  if (req.headers.host) {
    url = req.headers.host;
  } else {
    url = 'null';
  }
  cookies = datajs.rm.parsecookies(req);
  if (cookies.sid) {
    for (let i in loginid) {
      if (loginid[i][1] == cookies.sid) {
        nam = loginid[i][2];
      }
    }
  }
  global.stime = new Date();
  if (datajs.feat.debreq) {
    debreq.push(datajs.rm.reqinfo(req, stime.getTime(), ipaddr, proto, url, cookies, nam));
    if (debreq.length > datajs.feat.lim.debreq) {
      debreq.splice(0, debreq.length - datajs.feat.lim.debreq);
    }
  }
  if (!nolog) {
    if (datajs.feat.el.cons.indexOf(req.url) < 0 && ['/s?her=', '/s?typ=', '/a?co=', '/a?cd=', '/a?ccp=', '/a?rc='].every(datajs.notstartswith, req.url)) {
      let tsd = stime.toISOString();
      if (baniplist.indexOf(ipaddr.replace('::ffff:', '')) > -1 || (req.connection.remoteAddress != '::ffff:127.0.0.1' && datajs.feat.intmode)) {
        console.log(datajs.tn('[' + tsd + '] ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + url + ' ' + req.url, datajs.feat.lim.cologm) + ' banned');
        cologdadd('[' + tsd + '] ' + datajs.ipform(req.connection.remoteAddress) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + req.url + ' ' + req.headers['x-forwarded-for'] + ' banned');
        res.writeHead(403, {'Content-Type':'text/plain; charset=utf-8'});
        res.write('You are banned.');
        res.end();
        return;
      } else {
        console.log(datajs.tn('[' + tsd + '] ' + datajs.ipform(ipaddr) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + req.url, datajs.feat.lim.cologm));
        cologdadd('[' + tsd + '] ' + datajs.ipform(req.connection.remoteAddress) + ' ' + proto.padEnd(5) + ' ' + req.method + ' ' + url + ' ' + req.url + ' ' + req.headers['x-forwarded-for']);
      }
    }
  }
  if (proto == 'http' && datajs.feat.httpsf) {
    res.writeHead(303, {'Location' : 'https://' + url + req.url});
    res.end();
    return;
  }
  if (locked && datajs.feat.el.lockl.indexOf(req.url) < 0 && req.url.substr(0, 2) != '/a') {return;}
  if (req.method == 'GET') {
    if (!nolog) {
      if (datajs.feat.el.vhl.indexOf(req.url) < 0 && datajs.feat.el.vhs.every(datajs.notstartswith, req.url) && Object.keys(datajs.handlerp).every(datajs.notstartswith, req.url)) {
        if (viewshist[req.url] === undefined) {
          viewshist[req.url] = 1;
        } else {
          viewshist[req.url] += 1;
        }
      }
    }
    if (req.url.substr(0, 2) == '/s' && datajs.feat.tost) {
      adm.ipban(ipaddr); 
    }
    reqg(req, res, ipaddr, proto, url, cookies, nam);
  } else if (req.method == 'HEAD') {
    reqh(req, res, ipaddr, proto, url, cookies, nam);
  } else {
    res.writeHead(501);
    res.end();
  }
  req10s = true;
  global.etime = new Date();
  } catch (e) {
    console.error(e);
    try {
      fs.readFile('websites/perr.html', function (err, data) {
        try {
          res.writeHead(500, {'Content-Type':'text/html; charset=utf-8'});
          res.write(data.toString().replace('{error}', util.inspect(e).replace('\n', '<br>')));
          res.end();
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
};
global.serv = http.createServer(serverf).listen(8080, undefined, function (err) {
  if (err) {
    console.log('[' + new Date().toISOString() + '] Error: ' + err);
  } else {
    console.log('[' + new Date().toISOString() + '] Server Listening on Port 8080');
  }
});