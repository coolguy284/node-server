// jshint maxerr:1000 -W041 -W061
module.exports = function getf(req, res, ipaddr, proto, url, cookies, nam) {
  let mode = 0;
  switch (req.url) {
    case '/':
      let rs = fs.createReadStream('websites/indexredirect.html');
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      rs.pipe(res);
      break;
    case '/admin.html':
      fs.readFile('websites/admin.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{enc}', datajs.feat.enc));
        res.end();
      });
      break;
    case '/delay.log':
      let dfunc = function (val) {res.write(val + '\n');};
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      for (let dc = 0; dc < 10; dc++) {
        setTimeout(dfunc, dc * 200, dc);
      }
      setTimeout(function () {res.end();}, 2000);
      break;
    case '/evtsrc.log':
      let dfunc2 = function (val) {res.write('event: tester\ndata: ' + val + '\n\n');};
      let dfunc3 = function () {res.end();};
      res.writeHead(200, {'Content-Type':'text/event-stream','Connection':'keep-alive','Cache-Control':'no-cache','Transfer-Encoding':'chunked'});
      for (let dc = 0; dc < 11; dc++) {
        if (dc == 10) {
          setTimeout(dfunc3, dc * 1000, dc);
        } else {
          setTimeout(dfunc2, dc * 1000, dc);
        }
      }
      break;
    case '/livechat.dat':
      if (datajs.feat.chat) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(chat)));
      } else {datajs.rm.sn(res);}
      break;
    case '/livechathere.dat':
      if (datajs.feat.chathere) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(chatherelist)));
      } else {datajs.rm.sn(res);}
      break;
    case '/livechattyp.dat':
      if (datajs.feat.chattyp) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(chattyplist)));
      } else {datajs.rm.sn(res);}
      break;
    case '/livechatkick.dat':
      if (datajs.feat.chatkick) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(chatkicklist)));
      } else {datajs.rm.sn(res);}
      break;
    case '/liverchat.json':
      if (datajs.feat.rchat) {
        datajs.rm.restext(res, JSON.stringify(rchat));
      } else {datajs.rm.sn(res);}
      break;
    case '/liveviews.dat':
      if (datajs.feat.views) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(viewshist)));
      } else {datajs.rm.sn(res);}
      //"henlo this is an comment." - corn
      break;
    case '/comms.json':
      if (datajs.feat.comm) {
        datajs.rm.restext(res, JSON.stringify(codel));
      } else {datajs.rm.sn(res);}
      break;
    case '/debug/owneyes.html':
      let gid = (Math.random() * 1000000 + '').split('.')[0];
      owneyesid.push([gid, stime.getTime()]);
      fs.readFile('websites/debug/owneyes.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{id}', gid));
        res.end();
      });
      break;
    case '/colog.dat':
      if (datajs.feat.colog) {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        switch (datajs.feat.enc) {
          case 'b64':
            res.write(b64a.encode(JSON.stringify(colog)));
            break;
          case 'aes':
            res.write(CryptoJS.AES.encrypt(JSON.stringify(colog), b64a.serverp).toString());
            break;
        }
        res.end();
      } else {datajs.rm.sn(res);}
      break;
    case '/cologd.dat':
      if (datajs.feat.colog) {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        switch (datajs.feat.enc) {
          case 'b64':
            res.write(b64a.encode(JSON.stringify(cologd)));
            break;
          case 'aes':
            res.write(CryptoJS.AES.encrypt(JSON.stringify(cologd), b64a.serverp).toString());
            break;
        }
        res.end();
      } else {datajs.rm.sn(res);}
      break;
    case '/lat.log':
      datajs.rm.sn(res);
      break;
    default:
      mode = 1;
      break;
  }
  let cv;
  switch ((mode == 1) ? true : 'corn') {
    case req.url.substr(0, 18) == '/livechatd.dat?ts=':
      if (datajs.feat.chat) {
        let done = false;
        let ss = req.url.substr(18, Infinity);
        for (let i in chat) {
          if (ss == JSON.parse(chat[i])[0]) {
            done = true;
            datajs.rm.restext(res, JSON.stringify(chat.slice(parseInt(i) + 1, 100)));
          }
        }
        if (!done) {
          datajs.rm.restext(res, '[]');
        }
      } else {datajs.rm.sn(res);}
      break;
    case req.url.substr(0, 5) == '/r?u=':
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', decodeURIComponent(req.url.substr(5, 2048))));
        res.end();
      });
      break;
    case req.url.substr(0, 5) == '/r?e=':
      let rurl = b64.decode(req.url.substr(5, 2048));
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', rurl));
        res.end();
      });
      break;
    case req.url.substr(0, 6) == '/r?uh=':
      res.writeHead(303, {'Location' : decodeURIComponent(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 6) == '/r?eh=':
      res.writeHead(303, {'Location' : b64.decode(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 7) == '/s?tex=':
      if (datajs.feat.chat) {
        cv = JSON.parse(b64.decode(req.url.substr(7, 65536)));
        if (chatbanlist.indexOf(cv[0]) < 0 && chatbaniplist.indexOf(ipaddr) < 0) {
          chat.push(['[' + stime.toISOString() + ']', '<' + cv[0] + '>', cv[1]]);
          if (chat.length > datajs.feat.lim.chat) {
            chat.splice(0, chat.length - datajs.feat.lim.chat);
          }
          setTimeout(datajs.cleartyplist, 1000, cv[0]);
        }
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/s?her=':
      if (datajs.feat.chathere) {
        cv = b64.decode(req.url.substr(7, 2048));
        if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0) {
          chatherelist.push([stime.getTime(), cv]);
        }
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/s?typ=':
      if (datajs.feat.chattyp) {
        cv = b64.decode(req.url.substr(7, 2048));
        if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0) {
          chattyplist.push([stime.getTime(), cv]);
        }
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/s?kic=':
      if (datajs.feat.chatkick) {
        let kn = b64.decode(req.url.substr(7, Infinity));
        chatkicklist = chatkicklist.filter(na => na != kn);
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/r?tex=':
      if (datajs.feat.rchat) {
        if (rchatbaniplist.indexOf(ipaddr) < 0) {
          cv = req.url.substr(7, 2048);
          rchat.push(cv);
          if (rchat.length > datajs.feat.lim.rchat) {
            rchat.splice(0, rchat.length - datajs.feat.lim.rchat);
          }
        }
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/m?tex=':
      if (datajs.feat.mchat) {
        if (rchatbaniplist.indexOf(ipaddr) < 0) {
          cv = JSON.parse(req.url.substr(7, 2048));
          if (mchat[cv[0]]) {
            mchat[cv[0]].push(cv[1]);
            if (mchat[cv[0]].length > datajs.feat.lim.mchat) {
              mchat[cv[0]].splice(0, mchat.length - datajs.feat.lim.mchat);
            }
            datajs.rm.sn(res);
          } else {
            res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8'});
            res.write('0');
            res.end();
          }
        }
      }
      break;
    case req.url.substr(0, 6) == '/r?co=':
      let dell = req.url.substr(6, Infinity).split('|');
      let dec = b64d.decode(dell[0], codel[dell[1]]);
      if (dec[0] == 'o') {
        codel.splice(dell[1], 1);
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/pagg?=':
      if (req.url.substr(7, 2048) == 'tism') {
        let rs = fs.createReadStream('user_websites/coolguy284/tism.html');
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        rs.pipe(res);
      } else {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.write('no.');
        res.end();
      }
      break;
    case req.url.substr(0, 7) == '/oi?vr=':
      for (let i in owneyesid) {
        if (req.url.substr(7, Infinity) == owneyesid[i][0]) {
          res.writeHead(200, {'Content-Type':'text/plain'});
          res.write('ｈｅｌｏ');
          res.end();
          break;
        }
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/a?ccp=':
      let ta = JSON.parse(b64.decode(req.url.substr(7, 2048)));
      if (consoles[ta[1]] && consoleswpenc.indexOf(ta[1]) > -1) {
        if (sha256.hex(ta[0]) == (consoles[ta[1]].phash || b64a.server)) {
          datajs.rm.restext(res, b64.encode(consoles[ta[1]].penc));
        }
      } else if (sha256.hex(ta[0]) == b64a.server) {
        datajs.rm.restext(res, b64.encode(b64a.serverp));
      }
      break;
    case req.url.substr(0, 6) == '/a?cc=':
      try {
      switch (datajs.feat.enc) {
        case 'b64':
          cv = JSON.parse(b64a.decode(req.url.substr(6, Infinity)));
          break;
        case 'aes':
          cv = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(req.url.substr(6, Infinity), b64a.serverp)));
          break;
      }
      if (sha256.hex(cv[0]) == b64a.server) {
        let tx = cv[1];
        console.log('>> ' + tx);
        if (tx[0] != ':') {
          let resp = eval(tx);
          if (resp !== undefined) {
            console.log('<- ' + util.inspect(resp));
          }
        } else {
          let resp = comm(tx.substr(1, Infinity));
          if (resp !== undefined) {
            console.log('<- ' + util.inspect(resp));
          }
        }
      } else {
        datajs.rm.restext(res, '1');
        return;
      }
      } catch (e) { console.error(e); datajs.rm.restext(res, '2'); return; }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 6) == '/a?rc=':
      let ra = JSON.parse(b64.decode(req.url.substr(6, Infinity)));
      if (datajs.feat.colog && consoles[ra[0]]) {
        if (sha256.hex(ra[1]) == (consoles[ra[0]].phash || b64a.server)) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          switch (datajs.feat.enc) {
            case 'b64':
              res.write(b64a.encode(JSON.stringify(consoles[ra[0]].colog)));
              break;
            case 'aes':
              res.write(CryptoJS.AES.encrypt(JSON.stringify(consoles[ra[0]].colog), (consoles[ra[0]].penc || b64a.serverp)).toString());
              break;
          }
          res.end();
        } else {datajs.rm.sn(res);}
      } else {datajs.rm.sn(res);}
      break;
    case req.url.substr(0, 6) == '/a?sc=':
      let aconsole;
      try {
      try {
      switch (datajs.feat.enc) {
        case 'b64':
          cv = JSON.parse(b64a.decode(req.url.substr(6, Infinity)));
          break;
        case 'aes':
          let pass = false;
          for (let i in consoleswpenc) {
            let tcv = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(req.url.substr(6, Infinity), consoles[consoleswpenc[i]].penc));
            if (tcv != '') {
              cv = JSON.parse(tcv);
              pass = true;
            }
          }
          if (!pass) {
            cv = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(req.url.substr(6, Infinity), b64a.serverp)));
          }
          break;
      }
      } catch (e) {
        console.error(e);
      }
      let consol;
      if (consoles[cv[1]]) {
        aconsole = consoles[cv[1]].console;
        consol = consoles[cv[1]];
      } else {
        datajs.rm.sn(res);
        return;
      }
      if (sha256.hex(cv[0]) == (consol.phash || b64a.server)) {
        let tx = cv[2];
        aconsole.log('>> ' + tx);
        if (tx[0] != ':') {
          let resp;
          switch (consol.type) {
            case 'normal':
              resp = eval(tx);
              break;
            case 'vm':
              resp = vm.runInContext(tx, consol.context);
              break;
            case 'bash':
              if (!consol.running) {
                let ca = datajs.parseexec(tx);
                consol.running = true;
                consol.cp = cp.spawn(ca[0], ca.slice(1, Infinity), {windowsHide: true}, function (err) {if (err) {consol.console.error(err);}});
                consol.cp.stdout.pipe(new datajs.s.ConsoleStream(consol.console.log));
                consol.cp.stderr.pipe(new datajs.s.ConsoleStream(consol.console.error));
                consol.cp.on('exit', function () {
                  consol.running = false;
                });
                consol.cp.inspect = function () {
                  return 'Process {}';
                };
              } else {
                if (tx == '^C') {
                  pstree(consol.cp.pid, function (err, children) {
                    //cp.spawn('kill', ['-15'].concat(children.map(function (p) { return p.PID })));
                    children.forEach(function (val) {process.kill(val.PID, 'SIGINT');});
                    setTimeout(function () {consol.cp.kill(); delete consol.cp;}, 100);
                  });
                } else {
                  try {
                    consol.cp.stdin.write(Buffer.from(tx + '\n', 'utf8'));
                  } catch (e) {
                    consol.running = false;
                  }
                }
              }
              break;
          }
          if (resp !== undefined) {
            aconsole.log('<- ' + util.inspect(resp));
          }
        } else {
          let resp = comm(tx.substr(1, Infinity), aconsole);
          if (resp !== undefined) {
            aconsole.log('<- ' + util.inspect(resp));
          }
        }
      } else {
        datajs.rm.restext(res, '0');
        return;
      }
      } catch (e) { aconsole.error(e); datajs.rm.restext(res, '0'); return; }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 6) == '/a?ng=':
      cv = JSON.parse(b64.decode(req.url.substr(6, Infinity)));
      if (saveddat.hasOwnProperty(cv[0]) && sha256.hex(cv[1]) == b64a.server) {
        datajs.rm.restext(res, saveddat[cv[0]]);
      } else {
        datajs.rm.sn(res);
      }
      break;
    case req.url.substr(0, 6) == '/a?ns=':
      cv = JSON.parse(b64.decode(req.url.substr(6, Infinity)));
      if (saveddat.hasOwnProperty(cv[0]) && sha256.hex(cv[1]) == b64a.server) {
        saveddat[cv[0]] = cv[2];
      }
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 9) == '/login?v=':
      let uparr = JSON.parse(b64.decode(req.url.substr(9, 2048)));
      if (b64a.upar.hasOwnProperty(uparr[0])) {
        if (b64a.upar[uparr[0]] == sha256.hex(uparr[1])) {
          let id = datajs.genid(32);
          if (datajs.feat.loginip) {
            loginid.push([stime.getTime(), id, uparr[0], ipaddr]);
          } else {
            loginid.push([stime.getTime(), id, uparr[0]]);
          }
          datajs.rm.restext(res, id);
        } else {
          datajs.rm.restext(res, '1');
        }
      } else {
        datajs.rm.restext(res, '0');
      }
      break;
    case req.url.substr(0, 10) == '/logout?v=':
      let loid = req.url.substr(10, 2048);
      global.loginid = loginid.filter(function (val) {return val[1] != loid});
      datajs.rm.sn(res);
      break;
    case true:
      mode = 2;
      break;
  }
  if (mode == 2) {
    let v = req.url.split('/');
    if (v[v.length-1] === '' && v[v.length-2].indexOf('.') > -1) {
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', req.url.replace(/\/{1,}$/g, '')));
        res.end();
      });
      return;
    } else if (v[v.length-1] === '' && v[v.length-2].indexOf('.') < 0) {
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', req.url + 'index.html'));
        res.end();
      });
      return;
    }
    if (req.headers.range) {
      if (req.headers.range.substr(0, 6) == 'bytes=') {
        let rse = req.headers.range.substr(6, 100).split('-');
        let rstart = parseInt(rse[0]);
        let rend = parseInt(rse[1]);
        if (fs.existsSync('websites' + req.url)) {
          let rs = fs.createReadStream('websites' + req.url, {start: rstart, end: rend});
          let size = fs.statSync('websites' + req.url).size;
          res.writeHead(206, {
            'Content-Type':(datajs.mime.get(req.url) + '; charset=utf-8'),
            'Content-Range':('bytes ' + rstart + '-' + rend + '/' + size),
            'Content-Length':Math.min(rend - rstart, size),
          });
          rs.pipe(res);
        } else if (fs.existsSync(req.url.substr(1, Infinity)) && datajs.feat.debug) {
          let rs = fs.createReadStream(req.url.substr(1, Infinity), {start: rstart, end: rend});
          let size = fs.statSync(req.url.substr(1, Infinity)).size;
          res.writeHead(206, {
            'Content-Type':(datajs.mime.get(req.url) + '; charset=utf-8'),
            'Content-Range':('bytes ' + rstart + '-' + rend + '/' + size),
            'Content-Length':Math.min(rend - rstart, size),
          });
          rs.pipe(res);
        } else {
          let rs = fs.createReadStream('websites/p404.html');
          res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
          rs.pipe(res);
        }
        return;
      } else {
        res.writeHead(416);
        res.end();
        return;
      }
    }
    let rpath = 'websites' + req.url;
    let runelse = false;
    if (fs.existsSync(rpath) && datajs.subdir('websites', rpath)) {
      if (fs.statSync(rpath).isFile()) {
        let rs = fs.createReadStream(rpath);
        res.writeHead(200, {
          'Content-Type':(datajs.mime.get(req.url) + '; charset=utf-8'),
          'Content-Length':fs.statSync(rpath).size,
          'Accept-Ranges':'bytes'
        });
        rs.pipe(res);
      } else {
        runelse = true;
      }
    } else if (fs.existsSync(req.url.substr(1, Infinity)) && datajs.feat.debug) {
      let rs = fs.createReadStream(req.url.substr(1, Infinity));
      res.writeHead(200, {
        'Content-Type':(datajs.mime.get(req.url) + '; charset=utf-8'),
        'Content-Length':fs.statSync(req.url.substr(1, Infinity)).size,
        'Accept-Ranges':'bytes'
      });
      rs.pipe(res);
    } else {
      if (req.url.substr(0, 5) == '/user') {
        let rurl = req.url.substr(5, Infinity);
        if (nam) {
          if (fs.existsSync('user_websites/' + nam + rurl)) {
            let rs = fs.createReadStream('user_websites/' + nam + rurl);
            res.writeHead(200, {
              'Content-Type':(datajs.mime.get(req.url) + '; charset=utf-8'),
              'Content-Length':fs.statSync('user_websites/' + nam + rurl).size,
              'Accept-Ranges':'bytes'
            });
            rs.pipe(res);
          } else {
            runelse = true;
          }
        } else {
          runelse = true;
        }
      } else {
        runelse = true;
      }
    }
    if (runelse) {
      let hanp = '';
      Object.keys(datajs.handlerp).forEach(function (val) {if (req.url.startsWith(val) && val.startsWith(hanp)) {hanp = val;}});
      if (hanp) {
        datajs.handlerp[hanp](req, res);
      } else if (datajs.handlerf.hasOwnProperty(req.url)) {
        datajs.handlerf[req.url](req, res);
      } else if (datajs.feat.tempp.hasOwnProperty(req.url)) {
        res.writeHead(200, datajs.feat.tempp[req.url][0]);
        res.write(datajs.feat.tempp[req.url][1]);
        res.end();
      } else {
        let rs = fs.createReadStream('websites/p404.html');
        res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
        rs.pipe(res);
        let rp = 'p404';
        if (viewshist.reg[req.url]) rp = 'reg';
        else if (viewshist.ajax[req.url]) rp = 'ajax';
        if (rp != 'p404') {
          viewshist[rp][req.url]--;
          if (viewshist[rp][req.url] <= 0) {
            delete viewshist.reg[req.url];
          }
        }
        if (!viewshist.p404[req.url]) {
          viewshist.p404[req.url] = 1;
        } else {
          viewshist.p404[req.url]++;
        }
      }
    }
  }
};