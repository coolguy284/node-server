// jshint maxerr:1000
module.exports = function headf(req, res, ipaddr, proto, url, cookies, nam) {
  let mode = 0;
  switch (req.url) {
    case '/':
    case '/delay.log':
    case '/admin.html':
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
      break;
    case '/livechat.dat':
      if (datajs.feat.chat) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/livechathere.dat':
      if (datajs.feat.chathere) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/livechattyp.dat':
      if (datajs.feat.chattyp) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/livechatkick.dat':
      if (datajs.feat.chatkick) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/liverchat.json':
      if (datajs.feat.rchat) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/liveviews.dat':
      if (datajs.feat.views) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/comms.json':
      if (datajs.feat.comm) {
        datajs.rm.reshead(res);
      } else {datajs.rm.sn(res);}
      break;
    case '/colog.dat':
    case '/cologd.dat':
      if (datajs.feat.colog) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
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
  switch ((mode == 1) ? true : 'corn') {
    case req.url.substr(0, 18) == '/livechatd.dat?ts=':
      if (datajs.feat.chat) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end();
      } else {datajs.rm.sn(res);}
      break;
    case req.url.substr(0, 5) == '/r?u=':
    case req.url.substr(0, 5) == '/r?e=':
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
      break;
    case req.url.substr(0, 6) == '/r?uh=':
      res.writeHead(303, {'Location' : decodeURIComponent(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 6) == '/r?eh=':
      res.writeHead(303, {'Location' : b64.decode(req.url.substr(6, 2048))});
      res.end();
      break;
    case req.url.substr(0, 6) == '/a?rc=':
    case req.url.substr(0, 9) == '/login?v=':
      datajs.rm.reshead(res);
      break;
    case req.url.substr(0, 7) == '/s?tex=':
    case req.url.substr(0, 7) == '/r?tex=':
    case req.url.substr(0, 7) == '/s?her=':
    case req.url.substr(0, 7) == '/s?typ=':
    case req.url.substr(0, 7) == '/s?kic=':
    case req.url.substr(0, 6) == '/r?co=':
    case req.url.substr(0, 7) == '/oi?vr=':
    case req.url.substr(0, 6) == '/a?cc=':
    case req.url.substr(0, 6) == '/a?sc=':
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
    if (req.headers.range) {
      if (req.headers.range.substr(0, 6) == 'bytes=') {
        let rse = req.headers.range.substr(6, 100).split('-');
        let rstart = parseInt(rse[0]);
        let rend = parseInt(rse[1]);
        if (fs.existsSync('websites' + req.url)) {
          let size = fs.statSync('websites' + req.url).size;
          res.writeHead(206, {
            'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
            'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
            'Content-Length': Math.min(rend - rstart, size),
          });
          res.end();
        } else if (fs.existsSync(req.url.substr(1, Infinity)) && datajs.feat.debug.js) {
          let size = fs.statSync(req.url.substr(1, Infinity)).size;
          res.writeHead(206, {
            'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
            'Content-Range': ('bytes ' + rstart + '-' + rend + '/' + size),
            'Content-Length': Math.min(rend - rstart, size),
          });
          res.end();
        } else {
          res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
          res.end();
        }
        return;
      } else {
        res.writeHead(416);
        res.end();
        return;
      }
    }
    if (fs.existsSync('websites' + req.url)) {
      let rs = fs.createReadStream('websites' + req.url);
      res.writeHead(200, {
        'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
        'Content-Length': fs.statSync('websites' + req.url).size,
        'Accept-Ranges': 'bytes'
      });
      res.end();
    } else if (fs.existsSync(req.url.substr(1, Infinity)) && datajs.feat.debug.js) {
      let rs = fs.createReadStream(req.url.substr(1, Infinity));
      res.writeHead(200, {
        'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
        'Content-Length': fs.statSync(req.url.substr(1, Infinity)).size,
        'Accept-Ranges': 'bytes'
      });
      res.end();
    } else {
      res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
      res.end();
    }
  }
};