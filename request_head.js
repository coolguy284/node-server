// jshint maxerr:1000
module.exports = function headf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let mode = 0;
  switch (req.url) {
    case '/':
    case '/admin.html':
    case '/delay.log':
      datajs.rm.reshead(res);
      break;
    case '/evtsrc.log':
      res.writeHead(200, {'Content-Type': 'text/event-stream','Connection': 'keep-alive','Cache-Control': 'no-cache','Transfer-Encoding': 'chunked'});
      res.end();
      break;
    case '/livechat.dat':
      if (datajs.feat.chat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/livechates.dat':
      if (datajs.feat.chates) {
        res.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Transfer-Encoding': 'chunked'});
        res.end();
      } else datajs.rm.sn(res);
      break;
    case '/liverchat.json':
      if (datajs.feat.rchat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case '/liveviews.dat':
      if (datajs.feat.views) {
        datajs.rm.reshead(res);
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
    case '/colog.dat':
    case '/cologd.dat':
      if (datajs.feat.colog) {
        datajs.rm.reshead(res);
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
    default:
      mode = 1;
      break;
  }
  switch ((mode == 1) ? true : 'corn') {
    case req.url.substr(0, 18) == '/livechatd.dat?ts=':
      if (datajs.feat.chat) {
        datajs.rm.reshead(res);
      } else datajs.rm.sn(res);
      break;
    case req.url.substr(0, 5) == '/r?u=':
    case req.url.substr(0, 5) == '/r?e=':
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
      break;
    case req.url.substr(0, 6) == '/r?uh=':
      res.writeHead(303, {'Location': decodeURIComponent(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 6) == '/r?eh=':
      res.writeHead(303, {'Location': b64.decode(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 7) == '/s?tex=':
    case req.url.substr(0, 7) == '/s?her=':
    case req.url.substr(0, 7) == '/s?typ=':
    case req.url.substr(0, 7) == '/s?kic=':
    case req.url.substr(0, 7) == '/r?tex=':
    case req.url.substr(0, 7) == '/m?ccl=':
    case req.url.substr(0, 7) == '/m?cnl=':
    case req.url.substr(0, 7) == '/m?tex=':
    case req.url.substr(0, 6) == '/r?co=':
      datajs.rm.sn(res);
      break;
    case req.url.substr(0, 7) == '/pagg?=':
      datajs.rm.reshead(res);
      break;
    case req.url.substr(0, 7) == '/oi?vr=':
    case req.url.substr(0, 7) == '/a?ccp=':
    case req.url.substr(0, 6) == '/a?cc=':
    case req.url.substr(0, 6) == '/a?rc=':
    case req.url.substr(0, 6) == '/a?sc=':
    case req.url.substr(0, 6) == '/a?ng=':
    case req.url.substr(0, 9) == '/a?fstyp=':
    case req.url.substr(0, 9) == '/a?fsdir=':
    case req.url.substr(0, 9) == '/a?fstex=':
    case req.url.substr(0, 9) == '/login?v=':
    case req.url.substr(0, 10) == '/logout?v=':
      datajs.rm.sn(res);
      break;
    case true:
      mode = 2;
      break;
  }
  if (mode == 2) {
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
    let rpath = decodeURI('websites' + req.url), fpath = decodeURI(req.url.substr(1, Infinity));
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
            'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
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
            'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
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
        'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
        'Content-Length': fs.statSync('websites' + req.url).size,
        'Accept-Ranges': 'bytes'
      });
      res.end();
    } else if (fs.existsSync(fpath) && datajs.feat.debug.js) {
      res.writeHead(200, {
        'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
        'Content-Length': fs.statSync(fpath).size,
        'Accept-Ranges': 'bytes'
      });
      res.end();
    } else {
      res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
    }
  }
};