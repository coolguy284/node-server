// jshint maxerr:1000 -W041 -W061
module.exports = async function getf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let mode = 0, runelse = false;
  switch (req.url) {
    case '/':
      let rs = fs.createReadStream('websites/indexredirect.html');
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      rs.pipe(res);
      break;
    case '/delay.log':
      let dfunc = function (val) {res.write(val + '\n');};
      res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      for (let dc = 0; dc < 10; dc++) {
        setTimeout(dfunc, dc * 200, dc);
      }
      setTimeout(function () {res.end();}, 2000);
      break;
    case '/evtsrc.log':
      let dfunc2 = function (val) {res.write('event: tester\ndata: ' + val + '\n\n');};
      let dfunc3 = function () {res.end();};
      res.writeHead(200, {'Content-Type': 'text/event-stream','Connection': 'keep-alive','Cache-Control': 'no-cache','Transfer-Encoding': 'chunked'});
      for (let dc = 0; dc < 11; dc++) {
        if (dc == 10) {
          setTimeout(dfunc3, dc * 1000, dc);
        } else {
          setTimeout(dfunc2, dc * 1000, dc);
        }
      }
      break;
    case '/candoes.dat':
      datajs.rm.restext(res, datajs.feat.es ? '1' : '0');
      break;
    case '/livechat.dat':
      if (datajs.feat.chat) {
        let chatobj = {};
        chatobj.chat = chat;
        if (datajs.feat.chathere)
          chatobj.here = chatherelist;
        if (datajs.feat.chattyp)
          chatobj.typ = chattyplist;
        if (datajs.feat.chatkick)
          chatobj.kick = chatkicklist;
        datajs.rm.restext(res, b64.encode(JSON.stringify(chatobj)));
      } else datajs.rm.sn(res);
      break;
    case '/liverchat.json':
      if (datajs.feat.rchat) {
        datajs.rm.restext(res, JSON.stringify(rchat));
      } else datajs.rm.sn(res);
      break;
    case '/liverchates.dat':
      if (datajs.feat.rchat) {
        if (datajs.feat.es) {
          res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
          let RChatMsg = function (v) {
            res.write('event: message\ndata: ' + JSON.stringify(v) + '\n\n');
          }, RChatRefresh = function () {
            res.write('event: refresh\ndata: ' + JSON.stringify(rchat) + '\n\n');
          }, RChatSplicei = function (i) {
            res.write('event: splicei\ndata: ' + i + '\n\n');
          }, RChatSpliceb = function (i) {
            res.write('event: spliceb\ndata: ' + i + '\n\n');
          }, RChatClear = function () {
            res.write('event: clear\ndata:\n\n');
          };
          rchates.on('message', RChatMsg);
          rchates.on('refresh', RChatRefresh);
          rchates.on('splicei', RChatSplicei);
          rchates.on('spliceb', RChatSpliceb);
          rchates.on('clear', RChatClear);
          let closefunc = function () {
            rchates.off('message', RChatMsg);
            rchates.off('refresh', RChatRefresh);
            rchates.off('splicei', RChatSplicei);
            rchates.off('spliceb', RChatSpliceb);
            rchates.off('clear', RChatClear);
          };
          res.on('close', closefunc);
          res.on('destroy', closefunc);
          RChatRefresh();
        } else {
          datajs.rm.reses(res, 'no-es');
        }
      } else datajs.rm.sn(res);
      break;
    case '/liveviews.dat':
      if (datajs.feat.views) {
        datajs.rm.restext(res, b64.encode(JSON.stringify(viewshist)));
      } else datajs.rm.sn(res);
      //"henlo this is an comment." - corn
      break;
    case '/liveviewses.dat':
      if (datajs.feat.es) {
        res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
        let VhUpdate = function (rp, url, val) {
          res.write('event: update\ndata: ' + JSON.stringify([rp, url, val]) + '\n\n');
        }, VhDelete = function (rp, urls) {
          res.write('event: delete\ndata: ' + JSON.stringify([rp, urls]) + '\n\n');
        }, VhRefresh = function () {
          res.write('event: refresh\ndata: ' + JSON.stringify(viewshist) + '\n\n');
        };
        viewshistes.on('update', VhUpdate);
        viewshistes.on('delete', VhDelete);
        viewshistes.on('refresh', VhRefresh);
        let closefunc = function () {
          viewshistes.off('update', VhUpdate);
          viewshistes.off('delete', VhDelete);
          viewshistes.off('refresh', VhRefresh);
        };
        res.on('close', closefunc);
        res.on('destroy', closefunc);
        VhRefresh();
      } else {
        datajs.rm.reses(res, 'no-es');
      }
      break;
    case '/comms.json':
      if (datajs.feat.comm) {
        datajs.rm.restext(res, JSON.stringify(codel));
      } else datajs.rm.sn(res);
      break;
    case '/debug/owneyes.html':
      if (datajs.feat.owneyes) {
        let gid = (Math.random() * 1000000 + '').split('.')[0];
        owneyesid.push([gid, stime.getTime()]);
        fs.readFile('websites/debug/owneyes.html', function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          res.write(data.toString().replace('{id}', gid));
          res.end();
        });
      } else datajs.rm.sn(res);
      break;
    case '/pkey.log':
      if (pkeydat < process.hrtime()[0] - 60) {
        global.pkey = new rsa.JSEncrypt({default_key_size: datajs.feat.pkeysize});
        global.pkeydat = process.hrtime()[0];
      }
      datajs.rm.restext(res, b64.encode(pkey.getPublicKey()));
      break;
    case '/lat.log':
      datajs.rm.sn(res);
      break;
    case '/errtest.log':
      if (datajs.feat.debug.testerr) throw new Error('test error');
      else datajs.rm.sn(res);
      break;
    case '/index-notprod.html':
    case '/sitemap-notprod.xml':
      runelse = true;
      break;
    default:
      mode = 1;
      break;
  }
  let cv;
  if (mode == 1) {
    if (req.url.substr(0, 5) == '/r?u=') {
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', decodeURIComponent(req.url.substr(5, 2048))));
        res.end();
      });
    } else if (req.url.substr(0, 5) == '/r?e=') {
      let rurl = b64.decode(req.url.substr(5, 2048));
      fs.readFile('websites/redirecttemplate.html', function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write(data.toString().replace('{redirect-url}', rurl));
        res.end();
      });
    } else if (req.url.substr(0, 6) == '/r?uh=') {
      res.writeHead(303, {'Location': decodeURIComponent(req.url.substr(6, 2048))});
      res.end();
    } else if (req.url.substr(0, 6) == '/r?eh=') {
      res.writeHead(303, {'Location': b64.decode(req.url.substr(6, 2048))});
      res.end();
    } else if (req.url.substr(0, 18) == '/livechatd.dat?ts=') {
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
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 15) == '/livechates.dat') {
      if (datajs.feat.chat) {
        let nam = b64.decode(req.url.substr(20));
        if (datajs.feat.es && nam) {
          res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
          let ChatMsg = function (ts, nam, tex) {
            res.write('event: message\ndata: ' + JSON.stringify([ts, nam, tex]) + '\n\n');
          }, ChatRefresh = function () {
            res.write('event: refresh\ndata: ' + JSON.stringify(chat) + '\n\n');
          }, ChatSplicei = function (i) {
            res.write('event: splicei\ndata: ' + i + '\n\n');
          }, ChatSpliceb = function (i) {
            res.write('event: spliceb\ndata: ' + i + '\n\n');
          }, ChatClear = function () {
            res.write('event: clear\ndata:\n\n');
          }, ChatJoin = function (nam) {
            res.write('event: join\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatLeave = function (nam) {
            res.write('event: leave\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatHereRefresh = function () {
            res.write('event: hererefresh\ndata: ' + JSON.stringify(chatherelist) + '\n\n');
          }, ChatTypingStart = function (nam) {
            res.write('event: typingstart\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatTypingStop = function (nam) {
            res.write('event: typingstop\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatTypingRefresh = function () {
            res.write('event: typingrefresh\ndata: ' + JSON.stringify(chattyplist) + '\n\n');
          }, ChatKick = function (nam) {
            res.write('event: kick\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatUnKick = function (nam) {
            res.write('event: unkick\ndata: ' + JSON.stringify(nam) + '\n\n');
          }, ChatKickRefresh = function () {
            res.write('event: kickrefresh\ndata: ' + JSON.stringify(chatkicklist) + '\n\n');
          };
          chates.on('message', ChatMsg);
          chates.on('refresh', ChatRefresh);
          chates.on('splicei', ChatSplicei);
          chates.on('spliceb', ChatSpliceb);
          chates.on('clear', ChatClear);
          chates.on('join', ChatJoin);
          chates.on('leave', ChatLeave);
          chates.on('hererefresh', ChatHereRefresh);
          chates.on('typingstart', ChatTypingStart);
          chates.on('typingstop', ChatTypingStop);
          chates.on('typingrefresh', ChatTypingRefresh);
          chates.on('kick', ChatKick);
          chates.on('unkick', ChatUnKick);
          chates.on('kickrefresh', ChatKickRefresh);
          let closefunc = function () {
            chates.off('message', ChatMsg);
            chates.off('refresh', ChatRefresh);
            chates.off('splicei', ChatSplicei);
            chates.off('spliceb', ChatSpliceb);
            chates.off('clear', ChatClear);
            chates.off('join', ChatJoin);
            chates.off('leave', ChatLeave);
            chates.off('hererefresh', ChatHereRefresh);
            chates.off('typingstart', ChatTypingStart);
            chates.off('typingstop', ChatTypingStop);
            chates.off('typingrefresh', ChatTypingRefresh);
            chates.off('kick', ChatKick);
            chates.off('unkick', ChatUnKick);
            chates.off('kickrefresh', ChatKickRefresh);
            adm.chathereremove(nam);
            adm.chattypremove(nam);
          };
          res.on('close', closefunc);
          res.on('destroy', closefunc);
          adm.chathereadd(nam);
          ChatRefresh();
          ChatHereRefresh();
          ChatTypingRefresh();
          ChatKickRefresh();
        } else {
          datajs.rm.reses(res, 'no-es');
        }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?tex=') {
      if (datajs.feat.chat) {
        cv = JSON.parse(b64.decode(req.url.substr(7, 65536)));
        if (chatbanlist.indexOf(cv[0]) < 0 && chatbaniplist.indexOf(ipaddr) < 0)
          adm.addchat(stime, '<' + cv[0] + '>', cv[1], true);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?her=') {
      if (datajs.feat.chathere) {
        cv = b64.decode(req.url.substr(7, 2048));
        if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0)
          adm.chathereadd(cv);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?typ=') {
      if (datajs.feat.chattyp) {
        cv = b64.decode(req.url.substr(7, 2048));
        if (chatbanlist.indexOf(cv) < 0 && chatbaniplist.indexOf(ipaddr) < 0)
          adm.chattypadd(cv);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 10) == '/s?typnew=') {
      if (datajs.feat.chattyp) {
        cv = JSON.parse(b64.decode(req.url.substr(10)));
        if (cv[1]) adm.chattypadd(cv[0]);
        else adm.chattypremove(cv[0]);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?kic=') {
      if (datajs.feat.chatkick) {
        let kn = b64.decode(req.url.substr(7, Infinity));
        adm.chatunkick(kn);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?joi=' ||
        req.url.substr(0, 7) == '/s?lef=') {
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/r?tex=') {
      if (datajs.feat.rchat) {
        if (rchatbaniplist.indexOf(ipaddr) < 0) {
          adm.raddchat(req.url.substr(7, 2048));
        }
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/m?ccl=') {
      if (datajs.feat.mchat) {
        let ar = JSON.parse(b64.decode(req.url.substr(7, 2048)));
        res.resAwait = new Promise(r => setTimeout(r, 15));
        let mchatExist = Boolean(mchat[ar[0]]);
        let mchatHash = Buffer.from(mchat[ar[0]]?.hash || '', 'hex'), arrHash = Buffer.from(ar[1], 'hex');
        let sendState;
        if (mchatHash.length == arrHash.length && crypto.timingSafeEqual(mchatHash, arrHash)) {
          sendState = 0;
        } else if (!mchatExist && datajs.feat.mcreatechat) {
          adm.mcreatechat(ar[0], ar[1]);
          sendState = 0;
        } else sendState = 1;
        await res.resAwait;
        switch (sendState) {
          case 0: datajs.rm.sn(res); break;
          case 1: datajs.rm.restext(res, '1'); break;
        }
      } else datajs.rm.restext(res, '0');
    } else if (req.url.substr(0, 7) == '/m?cnl=') {
      if (datajs.feat.mchat) {
        let ar = JSON.parse(b64.decode(req.url.substr(7, 2048)));
        res.resAwait = new Promise(r => setTimeout(r, 15));
        let mchatHash = Buffer.from(mchat[ar[0]]?.hash || '', 'hex'), arrHash = Buffer.from(ar[1], 'hex');
        let sendState;
        if (mchatHash.length == arrHash.length && crypto.timingSafeEqual(mchatHash, arrHash)) {
          sendState = 0;
        } else sendState = 1;
        await res.resAwait;
        switch (sendState) {
          case 0: datajs.rm.restext(res, b64.encode(JSON.stringify(mchat[ar[0]].chat))); break;
          case 1: datajs.rm.restext(res, '1'); break;
        }
      } else datajs.rm.restext(res, '0');
    } else if (req.url.substr(0, 10) == '/m?cnlnew=') {
      if (datajs.feat.es) {
        if (datajs.feat.mchat) {
          let ar = JSON.parse(b64.decode(req.url.substr(10, 2048)));
          res.resAwait = new Promise(r => setTimeout(r, 15));
          let mchatExist = Boolean(mchat[ar[0]]);
          let mchatHash = Buffer.from(mchat[ar[0]]?.hash || '', 'hex'), arrHash = Buffer.from(ar[1], 'hex');
          if (mchatHash.length == arrHash.length && crypto.timingSafeEqual(mchatHash, arrHash)) {
            sendState = 0;
          } else if (!mchatExist && datajs.feat.mcreatechat) {
            adm.mcreatechat(ar[0], ar[1]);
            sendState = 0;
          } else sendState = 1;
          await res.resAwait;
          if (sendState) {
            datajs.rm.reses(res, 'no-channel');
          } else {
            let mchatObj = mchat[ar[0]];
            let mchates = mchatObj.es;
            res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
            let MChatMsg = function (ts, j) {
              res.write('event: message\ndata: ' + b64.encode(JSON.stringify([ts, j])) + '\n\n');
            }, MChatRefresh = function () {
              res.write('event: refresh\ndata: ' + b64.encode(JSON.stringify(mchatObj.chat)) + '\n\n');
            }, MChatSplicei = function (i) {
              res.write('event: splicei\ndata: ' + b64.encode('' + i) + '\n\n');
            }, MChatSpliceb = function (i) {
              res.write('event: spliceb\ndata: ' + b64.encode('' + i) + '\n\n');
            }, MChatClear = function () {
              res.write('event: clear\ndata:\n\n');
            };
            mchates.on('message', MChatMsg);
            mchates.on('refresh', MChatRefresh);
            mchates.on('splicei', MChatSplicei);
            mchates.on('spliceb', MChatSpliceb);
            mchates.on('clear', MChatClear);
            let closefunc = function () {
              mchates.off('message', MChatMsg);
              mchates.off('refresh', MChatRefresh);
              mchates.off('splicei', MChatSplicei);
              mchates.off('spliceb', MChatSpliceb);
              mchates.off('clear', MChatClear);
            };
            res.on('close', closefunc);
            res.on('destroy', closefunc);
            MChatRefresh();
          }
        } else {
          datajs.rm.reses(res, 'no-mchat');
        }
      } else {
        datajs.rm.reses(res, 'no-es');
      }
    } else if (req.url.substr(0, 7) == '/m?tex=') {
      if (datajs.feat.mchat) {
        cv = JSON.parse(b64.decode(req.url.substr(7, 2048)));
        res.resAwait = new Promise(r => setTimeout(r, 15));
        let mchatHash = Buffer.from(mchat[cv[0]]?.hash || '', 'hex'), arrHash = Buffer.from(cv[1], 'hex');
        if (mchatHash.length == arrHash.length && crypto.timingSafeEqual(mchatHash, arrHash)) {
          sendState = 0;
          adm.maddchat(cv[0], null, cv[2]);
        } else sendState = 1;
        await res.resAwait;
        if (sendState == 0 && mchatbaniplist.indexOf(ipaddr) < 0)
          datajs.rm.restext(res, '0');
        else datajs.rm.restext(res, '1');
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 6) == '/r?co=') {
      let dell = req.url.substr(6, Infinity).split('|');
      let dec = b64d.decode(dell[0], codel[dell[1]]);
      if (dec[0] == 'o') {
        codel.splice(dell[1], 1);
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/pagg?=') {
      if (req.url.substr(7, 2048) == 'tism') {
        let rs = fs.createReadStream('user_websites/coolguy284/tism.html');
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        rs.pipe(res);
      } else {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('no.');
        res.end();
      }
    } else if (req.url.substr(0, 7) == '/oi?vr=') {
      for (let i in owneyesid) {
        if (req.url.substr(7, Infinity) == owneyesid[i][0]) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('ｈｅｌｏ');
          res.end();
          break;
        }
      }
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/a?ccp=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        try {
          let ta = JSON.parse(b64.decode(req.url.substr(7, 2048)));
          let customConsole = ta[1] in consoles;
          let eq1 = Buffer.from(sha256.hex(ta[0]), 'hex'), eq2 = Buffer.from((consoles[ta[1]]?.phash || b64a.server), 'hex');
          if (customConsole && consoleswpenc.indexOf(ta[1]) > -1) {
            if (eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) sendState = 0;
          } else if (eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) {
            sendState = 1;
          } else sendState = 2;
          await res.resAwait;
          switch (sendState) {
            case 0: datajs.rm.restext(res, b64.encode(consoles[ta[1]].penc)); break;
            case 1: datajs.rm.restext(res, b64.encode(b64a.serverp)); break;
            case 2: datajs.rm.sn(res); break;
          }
        } catch (e) { await res.resAwait; datajs.rm.sn(res); }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 6) == '/a?rc=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        try {
          let ra, pass = false;
          for (let i in consoleswpenc) {
            let tra = cjsdec(req.url.substr(6, Infinity), consoles[consoleswpenc[i]].penc);
            if (tra != '') {
              ra = JSON.parse(tra);
              pass = true;
              break;
            }
          }
          if (!pass) {
            ra = JSON.parse(cjsdec(req.url.substr(6, Infinity), b64a.serverp));
          }
          let eq1 = Buffer.from(sha256.hex(ra[1]), 'hex'), eq2 = Buffer.from(consoles[ra[0]].phash || b64a.server, 'hex');
          let sendStateTxt, sendState;
          if (datajs.feat.colog && consoles[ra[0]]) {
            if (crypto.timingSafeEqual(eq1, eq2)) {
              if (datajs.feat.enc == 'b64') {
                sendStateTxt = b64a.encode(JSON.stringify(consoles[ra[0]].colog));
              } else if (datajs.feat.enc == 'aes') {
                sendStateTxt = cjsenc(JSON.stringify(consoles[ra[0]].colog), (consoles[ra[0]].penc || b64a.serverp));
              }
              sendState = 0;
            } else sendState = 1;
          } else sendState = 1;
          await res.resAwait;
          switch (sendState) {
            case 0: datajs.rm.restext(res, sendStateTxt); break;
            case 1: datajs.rm.sn(res); break;
          }
        } catch (e) { await res.resAwait; datajs.rm.sn(res); }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 9) == '/a?rcnew=') {
      if (datajs.feat.es) {
        if (datajs.feat.cons) {
          res.resAwait = new Promise(r => setTimeout(r, 15));
          try {
            let ra, pass = false;
            for (let i in consoleswpenc) {
              let tra = cjsdec(req.url.substr(6, Infinity), consoles[consoleswpenc[i]].penc);
              if (tra != '') {
                ra = JSON.parse(tra);
                pass = true;
                break;
              }
            }
            if (!pass) {
              ra = JSON.parse(cjsdec(req.url.substr(9, Infinity), b64a.serverp));
            }
            let eq1 = Buffer.from(sha256.hex(ra[1]), 'hex'), eq2 = Buffer.from(consoles[ra[0]].phash || b64a.server, 'hex');
            let sendStateTxt, sendState;
            if (datajs.feat.colog && consoles[ra[0]]) {
              if (crypto.timingSafeEqual(eq1, eq2)) {
                if (datajs.feat.enc == 'b64') {
                  sendStateTxt = b64a.encode(JSON.stringify(consoles[ra[0]].colog));
                } else if (datajs.feat.enc == 'aes') {
                  sendStateTxt = cjsenc(JSON.stringify(consoles[ra[0]].colog), consoles[ra[0]].penc || b64a.serverp);
                }
                sendState = 0;
              } else sendState = 1;
            } else sendState = 1;
            await res.resAwait;
            switch (sendState) {
              case 0:
                let consl = consoles[ra[0]];
                res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
                let ConsMessage = function (m) {
                  res.write(
                    'event: adm\ndata: ' +
                    cjsenc(
                      JSON.stringify({
                        type: 'message',
                        data: m,
                      }),
                      consl.penc || b64a.serverp
                    ) +
                    '\n\n'
                  );
                }, ConsSpliceb = function (i) {
                  res.write(
                    'event: adm\ndata: ' +
                    cjsenc(
                      JSON.stringify({
                        type: 'spliceb',
                        data: i,
                      }),
                      consl.penc || b64a.serverp
                    ) +
                    '\n\n'
                  );
                }, ConsRefresh = function () {
                  res.write(
                    'event: adm\ndata: ' +
                    cjsenc(
                      JSON.stringify({
                        type: 'refresh',
                        data: consl.colog,
                      }),
                      consl.penc || b64a.serverp
                    ) +
                    '\n\n'
                  );
                };
                consl.es.on('message', ConsMessage);
                consl.es.on('spliceb', ConsSpliceb);
                consl.es.on('refesh', ConsRefresh);
                let closefunc = function () {
                  consl.es.off('message', ConsMessage);
                  consl.es.off('spliceb', ConsSpliceb);
                  consl.es.off('refesh', ConsRefresh);
                };
                res.on('close', closefunc);
                res.on('destroy', closefunc);
                ConsRefresh();
                break;
              case 1:
                datajs.rm.reses(res, 'no-cons');
                break;
            }
          } catch (e) {
            await res.resAwait;
            datajs.rm.reses(res, 'no-cons');
          }
        } else {
          datajs.rm.reses(res, 'no-cons');
        }
      } else {
        datajs.rm.reses(res, 'no-es');
      }
    } else if (req.url.substr(0, 6) == '/a?sc=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        let aconsole;
        try {
          try {
            if (datajs.feat.enc == 'b64') {
              cv = JSON.parse(b64a.decode(req.url.substr(6, Infinity)));
            } else if (datajs.feat.enc == 'aes') {
              let pass = false;
              for (let i in consoleswpenc) {
                let tcv = cjsdec(req.url.substr(6, Infinity), consoles[consoleswpenc[i]].penc);
                if (tcv != '') {
                  cv = JSON.parse(tcv);
                  pass = true;
                  break;
                }
              }
              if (!pass) {
                cv = JSON.parse(cjsdec(req.url.substr(6, Infinity), b64a.serverp));
              }
            }
          } catch (e) { console.error(e); }
          let consol;
          if (consoles[cv[1]]) {
            aconsole = consoles[cv[1]].console;
            consol = consoles[cv[1]];
          } else { await res.resAwait; datajs.rm.sn(res); return; }
          let eq1 = Buffer.from(sha256.hex(cv[0]), 'hex'), eq2 = Buffer.from(consol.phash || b64a.server, 'hex');
          if (eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) {
            let tx = cv[2];
            if (consol.type != 'bash') aconsole.log('>> ' + tx);
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
                    aconsole.log('>> ' + tx);
                    let ca = datajs.parseexec(tx);
                    consol.running = true;
                    consol.cp = cp.spawn(ca[0], ca.slice(1, Infinity), {windowsHide: true}, function (err) {if (err) consol.console.error(err);});
                    consol.cp.stdout.pipe(consol.stdout, {end:false});
                    consol.cp.stderr.pipe(consol.stderr, {end:false});
                    consol.cp.on('exit', function () {
                      consol.running = false;
                    });
                    consol.cp.inspect = function () {
                      return 'Process {}';
                    };
                  } else {
                    consol.stdout.write(tx + '\n');
                    if (tx == '^C') {
                      try {
                        datajs.pstree.getallchilds(consol.cp.pid).reverse().forEach(function (val) {
                          process.kill(val, 'SIGINT');
                        });
                        consol.cp.kill();
                        delete consol.cp;
                      } catch (e) {
                        process.kill(consol.cp.pid, 'SIGINT');
                      }
                    } else {
                      try {
                        consol.cp.stdin.write(Buffer.from(tx + '\n'));
                      } catch (e) {
                        consol.running = false;
                      }
                    }
                  }
                  break;
              }
              if (resp !== undefined) aconsole.log('<- ' + util.inspect(resp));
            } else {
              let resp = comm(tx.substr(1, Infinity), aconsole);
              if (resp !== undefined) aconsole.log('<- ' + util.inspect(resp));
            }
          } else { await res.resAwait; datajs.rm.restext(res, '0'); return; }
        } catch (e) { aconsole.error(e); await res.resAwait; datajs.rm.restext(res, '0'); return; }
      }
      await res.resAwait;
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 6) == '/a?ng=') {
      cv = JSON.parse(b64.decode(req.url.substr(6, Infinity)));
      let prop = nam != null ? nam : 'main';
      res.resAwait = new Promise(r => setTimeout(r, 15));
      let eq1 = Buffer.from(sha256.hex(cv[1]), 'hex'), eq2 = Buffer.from(b64a.server, 'hex');
      if (saveddat[prop].hasOwnProperty(cv[0]) && eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) {
        datajs.rm.restext(res, saveddat[prop][cv[0]]);
      } else {
        await res.resAwait;
        datajs.rm.sn(res);
      }
    } else if (req.url.substr(0, 9) == '/a?fstyp=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        try {
          cv = JSON.parse(cjsdec(req.url.substr(9, Infinity), b64a.serverp));
          let dcon;
          try {
            switch (cv[0]) {
              case 'reg':
                dcon = await fs.promises.stat(cv[1]);
                break;
              case 'vfs':
                dcon = vfs.fs.statSync(cv[1]);
                break;
            }
            var t = 10;
            while (dcon.isSymbolicLink()) {
              if (t < 0) {
                datajs.rm.restext(res, cjsenc('1', b64a.serverp));
                return;
              }
              switch (cv[0]) {
                case 'reg':
                  cv[1] = await fs.promises.readlink(cv[1]);
                  dcon = await fs.promises.stat(cv[1]);
                  break;
                case 'vfs':
                  cv[1] = vfs.fs.readlink(cv[1]);
                  dcon = vfs.fs.statSync(cv[1]);
                  break;
              }
              t--;
            }
            if (dcon.isFile()) typ = 8;
            else if (dcon.isDirectory()) typ = 4;
            else typ = 0;
            datajs.rm.restext(res, cjsenc(JSON.stringify(typ), b64a.serverp));
          } catch (e) { await res.resAwait; datajs.rm.restext(res, cjsenc('0', b64a.serverp)); }
        } catch (e) { await res.resAwait; datajs.rm.sn(res); }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 9) == '/a?fsdir=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        try {
          cv = JSON.parse(cjsdec(req.url.substr(9, Infinity), b64a.serverp));
          let dcon;
          switch (cv[0]) {
            case 'reg':
              dcon = await fs.promises.readdir(cv[1], { withFileTypes: true });
              break;
            case 'vfs':
              dcon = vfs.fs.readdirSync(cv[1], { withFileTypes: true });
              break;
          }
          dcon = dcon.map(x => {
            if (x.isFile()) typ = 8;
            else if (x.isDirectory()) typ = 4;
            else if (x.isSymbolicLink()) typ = 10;
            else typ = 0;
            return [x.name, typ];
          });
          datajs.rm.restext(res, cjsenc(JSON.stringify(dcon), b64a.serverp));
        } catch (e) { await res.resAwait; datajs.rm.sn(res); }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 9) == '/a?fstex=') {
      if (datajs.feat.cons) {
        res.resAwait = new Promise(r => setTimeout(r, 15));
        try {
          cv = JSON.parse(cjsdec(req.url.substr(9, Infinity), b64a.serverp));
          let dcon;
          switch (cv[0]) {
            case 'reg':
              dcon = (await fs.promises.readFile(cv[1])).toString();
              break;
            case 'vfs':
              dcon = vfs.fs.readFileSync(cv[1]).toString();
              break;
          }
          datajs.rm.restext(res, cjsenc(dcon, b64a.serverp));
        } catch (e) { await res.resAwait; datajs.rm.sn(res); }
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 9) == '/login?v=') {
      let tx = b64.decode(req.url.substr(9, 2048)), dtx, uparr;
      res.resAwait = new Promise(r => setTimeout(r, 15));
      try {
        dtx = pkey.decrypt(tx);
      } finally {
        if (dtx == '') {
          await res.resAwait;
          datajs.rm.restext(res, '1');
          return;
        }
      }
      uparr = JSON.parse(dtx);
      if (b64a.upar.hasOwnProperty(uparr[0])) {
        let eq1 = Buffer.from(b64a.upar[uparr[0]], 'hex'), eq2 = Buffer.from(sha256.hex(uparr[1]), 'hex');
        if (eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) {
          let id = datajs.genid(32);
          if (datajs.feat.loginip) {
            loginid.push([stime.getTime(), id, uparr[0], ipaddr]);
          } else {
            loginid.push([stime.getTime(), id, uparr[0]]);
          }
          datajs.rm.restext(res, id);
        } else {
          await res.resAwait;
          datajs.rm.restext(res, '0');
        }
      } else {
        await res.resAwait;
        datajs.rm.restext(res, '0');
      }
    } else if (req.url.substr(0, 10) == '/logout?v=') {
      res.resAwait = new Promise(r => setTimeout(r, 15));
      let loid = req.url.substr(10, 2048);
      global.loginid = loginid.filter(function (val) {return val[1] != loid});
      await res.resAwait;
      datajs.rm.sn(res);
    } else if (req.url[0] != '/') runelse = true;
    else {
      let v = req.url.split('/');
      if (v[v.length-1] === '' && v[v.length-2].indexOf('.') > -1) {
        fs.readFile('websites/redirecttemplate.html', function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          res.write(data.toString().replace('{redirect-url}', req.url.replace(/\/{1,}$/g, '')));
          res.end();
        });
        return -1;
      } else if (v[v.length-1] === '' && v[v.length-2].indexOf('.') < 0) {
        fs.readFile('websites/redirecttemplate.html', function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          res.write(data.toString().replace('{redirect-url}', req.url + 'index.html'));
          res.end();
        });
        return -1;
      }
      let runelse2 = false;
      if (req.url.startsWith('/important/')) {
        if (!datajs.feat.notprodm) runelse = true;
        else runelse2 = true;
      } else runelse2 = true;
      if (runelse2) {
        let fpath = decodeURI(req.url.substr(1, Infinity));
        if (datajs.feat.notprodm) {
          if (fpath == 'index.html') fpath = 'index-notprod.html';
          if (fpath == 'sitemap.xml') fpath = 'sitemap-notprod.xml';
        }
        let fpathslash = '/' + fpath;
        let rpath = decodeURI('websites' + fpathslash);
        let rpathgz = rpath + '.gz';
        if (req.headers.range) {
          if (/bytes=[0-9]*-[0-9]*/.test(req.headers.range)) {
            let rse = req.headers.range.substr(6, Infinity).split('-');
            let rstart = rse[0] == '' ? 0 : parseInt(rse[0]);
            let rend = rse[1] == '' ? Infinity : parseInt(rse[1]);
            if ((await datajs.fsPromisesExists(rpath)) && datajs.subdir('websites', rpath)) {
              let size = (await fs.promises.stat(rpath)).size;
              if (rend == Infinity) rend = size - 1;
              if (rend >= size) {
                if (datajs.feat.permissiverange) rend = size - 1;
                else {
                  res.writeHead(416);
                  res.end();
                  return -1;
                }
              }
              let rs = fs.createReadStream(rpath, {start: rstart, end: rend});
              res.writeHead(206, {
                'Content-Type': (datajs.mime.get(rpath) + '; charset=utf-8'),
                'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
                'Content-Length': Math.min(rend - rstart + 1, size),
                'X-Robots-Tag': 'noindex'
              }); // why is the end of a range referencing the id of that byte, instead of the next one like in js?
              rs.pipe(res);
            } else if (datajs.feat.debug.js && (await datajs.fsPromisesExists(fpath))) {
              let size = (await fs.promises.stat(fpath)).size;
              if (rend == Infinity) rend = size - 1;
              if (rend >= size) {
                if (datajs.feat.permissiverange) rend = size - 1;
                else {
                  res.writeHead(416);
                  res.end();
                  return -1;
                }
              }
              let rs = fs.createReadStream(fpath, {start: rstart, end: rend});
              res.writeHead(206, {
                'Content-Type': (datajs.mime.get(fpath) + '; charset=utf-8'),
                'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
                'Content-Length': Math.min(rend - rstart + 1, size),
                'X-Robots-Tag': 'noindex'
              });
              rs.pipe(res);
            } else if (datajs.feat.tempp.hasOwnProperty(req.url) && Buffer.isBuffer(datajs.feat.tempp[req.url][1])) {
              let file = datajs.feat.tempp[req.url][1];
              let size = file.length;
              if (rend == Infinity) rend = size - 1;
              if (rend >= size) {
                if (datajs.feat.permissiverange) rend = size - 1;
                else {
                  res.writeHead(416);
                  res.end();
                  return -1;
                }
              }
              res.writeHead(206, {
                ...datajs.feat.tempp[req.url][0],
                'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
                'Content-Length': Math.min(rend - rstart + 1, size),
              });
              res.write(file.slice(rstart, rend + 1));
              res.end();
            } else {
              let rs = fs.createReadStream('websites/p404.html');
              res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
              rs.pipe(res);
            }
            return -1;
          } else {
            res.writeHead(416);
            res.end();
            return -1;
          }
        }
        if (datajs.subdir('websites', rpath) && (await datajs.fsPromisesExists(rpath))) {
          if ((await fs.promises.stat(rpath)).isFile()) {
            let rs = fs.createReadStream(rpath);
            res.writeHead(200, {
              'Content-Type': (datajs.mime.get(fpathslash) + '; charset=utf-8'),
              'Content-Length': (await fs.promises.stat(rpath)).size,
              'Accept-Ranges': 'bytes',
              'X-Robots-Tag': 'noindex'
            });
            rs.pipe(res);
          } else runelse = true;
        } else if (datajs.feat.gzipfiles && datajs.subdir('websites', rpathgz) && (await datajs.fsPromisesExists(rpathgz))) {
          if ((await fs.promises.stat(rpathgz)).isFile()) {
            let gzsize = (await fs.promises.stat(rpathgz)).size;
            let gzhandle = await fs.promises.open(rpathgz, 'r');
            let filsizbuf = Buffer.alloc(4);
            await gzhandle.read(filsizbuf, 0, 4, gzsize - 4);
            await gzhandle.close();
            let rs = fs.createReadStream(rpathgz);
            res.writeHead(200, {
              'Content-Type': (datajs.mime.get(fpathslash) + '; charset=utf-8'),
              'Content-Length': filsizbuf.readUInt32LE(0),
              'Accept-Ranges': 'none',
              'X-Robots-Tag': 'noindex'
            });
            rs.pipe(zlib.createGunzip()).pipe(res);
          } else runelse = true;
        } else if (datajs.feat.debug.js && (await datajs.fsPromisesExists(fpath))) {
          let rs = fs.createReadStream(fpath);
          res.writeHead(200, {
            'Content-Type': (datajs.mime.get(fpathslash) + '; charset=utf-8'),
            'Content-Length': (await fs.promises.stat(fpath)).size,
            'Accept-Ranges': 'bytes',
            'X-Robots-Tag': 'noindex'
          });
          rs.pipe(res);
        } else {
          if (fpathslash.substr(0, 5) == '/user') {
            let rurl = fpathslash.substr(5, Infinity);
            if (nam) {
              if (await datajs.fsPromisesExists('user_websites/' + nam + rurl)) {
                let rs = fs.createReadStream('user_websites/' + nam + rurl);
                res.writeHead(200, {
                  'Content-Type': datajs.mime.get(fpathslash) + '; charset=utf-8',
                  'Content-Length': (await fs.promises.stat('user_websites/' + nam + rurl)).size,
                  'Accept-Ranges': 'bytes',
                });
                rs.pipe(res);
              } else runelse = true;
            } else {
              let rs = fs.createReadStream('websites/user/signedout.html');
              res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
              rs.pipe(res);
            }
          } else runelse = true;
        }
      }
    }
  }
  if (runelse) {
    let hanp = '';
    Object.keys(datajs.handlerp).forEach(function (val) {if (req.url.startsWith(val) && val.startsWith(hanp)) {hanp = val;}});
    if (hanp) {
      return datajs.handlerp[hanp](req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else if (datajs.handlerf.main.hasOwnProperty(req.url)) {
      return datajs.handlerf.main[req.url](req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else if (nam !== null && datajs.handlerf.hasOwnProperty(nam) && datajs.handlerf[nam].hasOwnProperty(req.url)) {
      return datajs.handlerf[nam][req.url](req, res, rrid, ipaddr, proto, url, cookies, nam);
    } else if (datajs.feat.tempp.hasOwnProperty(req.url)) {
      res.writeHead(200, datajs.feat.tempp[req.url][0]);
      res.write(datajs.feat.tempp[req.url][1]);
      res.end();
    } else {
      let rs = fs.createReadStream('websites/p404.html');
      res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
      rs.pipe(res);
      return 'p404';
    }
  }
};