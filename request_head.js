// jshint maxerr:1000
module.exports = function headf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let mode = 0, runelse = false;
  switch (req.url) {
    case '/':
    case '/delay.log':
      datajs.rm.reshead(res);
      break;
    case '/evtsrc.log':
      res.writeHead(200, {'Content-Type': 'text/event-stream','Connection': 'keep-alive','Cache-Control': 'no-cache','Transfer-Encoding': 'chunked'});
      res.end();
      break;
    case '/candoes.dat':
      datajs.rm.reshead(res);
      break;
    case '/livechat.dat':
      if (datajs.feat.chat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/liverchat.json':
      if (datajs.feat.rchat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/liverchates.dat':
      if (datajs.feat.rchat && datajs.feat.es) {
        res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
        res.end();
      } else datajs.rm.sn(res);
      break;
    case '/liveviews.dat':
      if (datajs.feat.views) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/liveviewses.dat':
      if (datajs.feat.es) {
        res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
        res.end();
      } else datajs.rm.sn(res);
      break;
    case '/comms.json':
      if (datajs.feat.comm) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/debug/owneyes.html':
      if (datajs.feat.owneyes) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end();
      } else datajs.rm.sn(res);
      break;
    case '/pkey.log':
      datajs.rm.reshead(res);
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
  if (mode == 1) {
    if (req.url.substr(0, 5) == '/r?u=' ||
      req.url.substr(0, 5) == '/r?e=') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
    } else if (req.url.substr(0, 6) == '/r?uh=') {
      res.writeHead(303, {'Location': decodeURIComponent(req.url.substr(6, 2048))});
      res.end();
    } else if (req.url.substr(0, 6) == '/r?eh=') {
      res.writeHead(303, {'Location': b64.decode(req.url.substr(6, 2048))});
      res.end();
    } else if (req.url.substr(0, 18) == '/livechatd.dat?ts=') {
      if (datajs.feat.chat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 15) == '/livechates.dat') {
      if (datajs.feat.chat) {
        let nam = b64.decode(req.url.substr(20));
        if (datajs.feat.es && nam) {
          res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
          res.end();
        } else datajs.rm.sn(res);
      } else datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/s?tex=' ||
        req.url.substr(0, 7) == '/s?her=' ||
        req.url.substr(0, 7) == '/s?typ=' ||
        req.url.substr(0, 10) == '/s?typnew=' ||
        req.url.substr(0, 7) == '/s?kic=' ||
        req.url.substr(0, 7) == '/s?joi=' ||
        req.url.substr(0, 7) == '/s?lef=' ||
        req.url.substr(0, 7) == '/r?tex=' ||
        req.url.substr(0, 7) == '/m?ccl=' ||
        req.url.substr(0, 7) == '/m?cnl=' ||
        req.url.substr(0, 10) == '/m?cnlnew=' ||
        req.url.substr(0, 7) == '/m?tex=' ||
        req.url.substr(0, 6) == '/r?co=') {
      datajs.rm.sn(res);
    } else if (req.url.substr(0, 7) == '/pagg?=') {
      datajs.rm.reshead(res);
    } else if (req.url.substr(0, 7) == '/oi?vr=' ||
        req.url.substr(0, 7) == '/a?ccp=' ||
        req.url.substr(0, 6) == '/a?rc=' ||
        req.url.substr(0, 9) == '/a?rcnew=' ||
        req.url.substr(0, 6) == '/a?sc=' ||
        req.url.substr(0, 6) == '/a?ng=' ||
        req.url.substr(0, 9) == '/a?fstyp=' ||
        req.url.substr(0, 9) == '/a?fsdir=' ||
        req.url.substr(0, 9) == '/a?fstex=' ||
        req.url.substr(0, 9) == '/login?v=' ||
        req.url.substr(0, 10) == '/logout?v=') {
      datajs.rm.sn(res);
    } else if (req.url[0] != '/') runelse = true;
    else {
      let v = req.url.split('/');
      if (v[v.length-1] === '' && v[v.length-2].indexOf('.') > -1) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end();
        return;
      } else if (v[v.length-1] === '' && v[v.length-2].indexOf('.') < 0) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end();
        return;
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
        if (req.headers.range) {
          if (/bytes=[0-9]*-[0-9]*/.test(req.headers.range)) {
            let rse = req.headers.range.substr(6, Infinity).split('-');
            let rstart = rse[0] == '' ? 0 : parseInt(rse[0]);
            let rend = rse[1] == '' ? Infinity : parseInt(rse[1]);
            if (fs.existsSync(rpath) && datajs.subdir('websites', rpath)) {
              let size = fs.statSync(rpath).size;
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
                'Content-Type': (datajs.mime.get(fpathslash) + '; charset=utf-8'),
                'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
                'Content-Length': Math.min(rend - rstart + 1, size),
              });
              res.end();
            } else if (fs.existsSync(fpath) && datajs.feat.debug.js) {
              let size = fs.statSync(fpath).size;
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
                'Content-Type': (datajs.mime.get(rpath) + '; charset=utf-8'),
                'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
                'Content-Length': Math.min(rend - rstart + 1, size),
              });
              res.end();
            } else {
              res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
              res.end();
            }
            return -1;
          } else {
            res.writeHead(416);
            res.end();
            return -1;
          }
        }
        if (fs.existsSync(rpath) && datajs.subdir('websites', rpath)) {
          res.writeHead(200, {
            'Content-Type': (datajs.mime.get(rpath) + '; charset=utf-8'),
            'Content-Length': fs.statSync(rpath).size,
            'Accept-Ranges': 'bytes'
          });
          res.end();
        } else if (datajs.feat.debug.js && fs.existsSync(fpath)) {
          res.writeHead(200, {
            'Content-Type': (datajs.mime.get(fpath) + '; charset=utf-8'),
            'Content-Length': fs.statSync(fpath).size,
            'Accept-Ranges': 'bytes'
          });
          res.end();
        } else runelse = true;
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
      res.end();
    } else {
      res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
      return 'p404';
    }
  }
};