//jshint maxerr:1000 -W041 -W061
//---------------index.js---------------
global.cologappend = function cologappend(value, temp, colog) {
  if (!colog) { colog = global.colog; }
  if (value.search('\n') > -1) {
    let sl = value.split('\n');
    for (let i in sl) {
      if (sl[i] != '') {
        cologadd(sl[i], temp, colog);
      }
    }
    if (!value.endsWith('\n')) {
      colog.nendsnl = true;
    } else {
      colog.nendsnl = false;
    }
    return;
  }
  if (!colog.nendsnl) {
    cologadd(value.split('\n')[0], temp, colog);
    if (!value.endsWith('\n')) {
      colog.nendsnl = true;
    } else {
      colog.nendsnl = false;
    }
  } else {
    colog[colog.length - 1][0] += value;
    if (!value.endsWith('\n')) {
      colog.nendsnl = true;
    } else {
      colog.nendsnl = false;
    }
  }
};

var chat = [];
var rchat = [];
var viewshist = {};
var colog = Array.apply(null, Array(100)).map(function () {return ['', '{}'];});
var cologd = Array.apply(null, Array(100)).map(function () {return ['', '{}'];});

//global.aes = require('node-cryptojs-aes');
//global.CryptoJS = aes.CryptoJS;

if (req.url == '/delay-inf.log') {
  let ic = 0;
  let dfunc = function () {res.write(ic + '\n'); ic += 1;};
  res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
  let inter = setInterval(dfunc, 200);
  req.on('close', function () {clearInterval(inter);});
}
//jshint ignore:start
case '/delaybusy.log':
  res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
  for (let dc = 0; dc < 10; dc ++) {
    datajs.busywait(200);
    res.write(dc + '\n');
  }
  res.end();
  break;
//jshint ignore:end
if (req.url.substr(0, 7) == '/s?joi=') {
  let cv = b64.decode(req.url.substr(7, 2048));
  if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0) {
    chat.push(JSON.stringify(['[' + new Date().toISOString() + ']', '[server]', cv + ' joined']));
    if (chat.length > 100) {
      chat.splice(0, chat.length - 100);
    }
  }
  sn = true;
} else if (req.url.substr(0, 7) == '/s?lef=') {
  let cv = b64.decode(req.url.substr(7, 2048));
  if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0) {
    chat.push(JSON.stringify(['[' + new Date().toISOString() + ']', '[server]', cv + ' left']));
    if (chat.length > 100) {
      chat.splice(0, chat.length - 100);
    }
  }
  sn = true;
}

if (req.url.substr(0, 6) == '/a?cr=') {
  let resp;
  try {
  // let cv = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(req.url.substr(6, Infinity), b64a.server));
  if (cv[0] == 'o') {
    let tx = cv.substr(1, Infinity);
    console.log('>> ' + tx);
    if (tx[0] != ':') {
      resp = eval(tx);
      if (resp !== undefined) {
        console.log('<- ' + util.inspect(resp));
      }
    } else {
      comm(tx.substr(1, Infinity));
    }
  }
  } catch (e) {
    resp = e.toString();
  } finally {
    res.writeHead('200', {'Content-Type':'text/plain; charset=utf-8'});
    res.write(resp);
    res.end();
  }
}

if (req.url.substr(0, 8) == '/fs?dir=') {
  let dp = b64a.decode(req.url.substr(8, Infinity));
  if (dp[0] == 'o') {
    fs.readdir(dp.substr(1, Infinity), function (err, files) {
      if (err !== undefined) {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.write('Folder dosen\'t exist');
        res.end();
      } else {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.write(b64a.encode(JSON.parse(files)));
      }
    });
  }
}

fs.readFile('websites' + req.url, function (err, data) {
  if (data !== undefined) {
    let dl = req.url.split('.');
    res.writeHead(200, {'Content-Type':(datajs.mimes[dl[dl.length-1]]+'; charset=utf-8')});
    res.write(data);
    res.end();
  } else {
    fs.readFile(req.url.substr(1, Infinity), function (err, data) {
      if (data !== undefined && datajs.feat.debug) {
        let dl = req.url.split('.');
        res.writeHead(200, {'Content-Type':(datajs.mimes[dl[dl.length-1]]+'; charset=utf-8')});
        res.write(data);
        res.end();
        delete viewshist[req.url];
      } else {
        fs.readFile('websites/p404.html', function (err, data) {
          res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
          res.write(data);
          res.end();
        });
      }
    });
  }
});

//feat.debug
/* && ['204.9.147.208', '67.186.8.144'].indexOf(req.headers['x-forwarded-for'].split(', ')[0]) > -1*/

//---------------data.js---------------

/*'busywait' : function (ms) {
  let et = new Date().getTime() + ms;
  while (new Date().getTime() < et) {}
},*/

//---------------b64.js---------------

Base64.s = '';
Base64.s += 'TmGn=FzUa4';
Base64.s += 'SlHo5EyVb9';
Base64.s += 'RkIp0DxWc3';
Base64.s += 'QjJq6CwXd8';
Base64.s += 'PiKr1BvYe/';
Base64.s += 'OhLs+AuZf7';
Base64.s += 'NgMt2';

//---------------chat.html---------------
var keys = [];
window.addGlobalHotkey = function(callback,keyValues){
  if(typeof keyValues === "number")
    keyValues = [keyValues];
    var fnc = function(cb,val){
      return function(e){
        keys[e.keyCode] = true;
        executeHotkeyTest(cb,val);
      };        
    }(callback,keyValues);
    window.addEventListener('keydown',fnc);
    return fnc;
};
window.executeHotkeyTest = function(callback,keyValues){
  var allKeysValid = true;
  for(var i = 0; i < keyValues.length; ++i)
    allKeysValid = allKeysValid && keys[keyValues[i]];
  if(allKeysValid)
    callback();
};
window.addEventListener('keyup',function(e){
  keys[e.keyCode] = false;
});
addGlobalHotkey(function(){
  if (parseInt(showhtm.value) == 1) {
    showhtm.value = 0;
  } else {
    showhtm.value = 1;
  }
  ChatReload(true);
},[17,81]);
addGlobalHotkey(function(){
  if (parseInt(showind.value) == 1) {
    showind.value = 0;
  } else {
    showind.value = 1;
  }
  ChatReload(true);
},[17,73]);
//keypress
if ([37, 38, 39, 40, 16, 17, 18, 20, 91, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 27].indexOf(e.keyCode) != -1) {return;} // also in admin.html