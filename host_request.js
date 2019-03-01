module.exports = function hreq(req, res, ipaddr, proto, url, althost, cookies, nam) {
  if (althost == 'test') {
    if (req.method == 'GET') {
      if (req.url == '/') {
        let rs = fs.createReadStream('host_websites/test/indexredirect.html');
        res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
        rs.pipe(res);
      } else {
        let rpath = 'host_websites/test' + req.url;
        if (fs.existsSync(rpath) && datajs.subdir('host_websites/test', rpath)) {
          if (fs.statSync(rpath).isFile()) {
            let rs = fs.createReadStream(rpath);
            res.writeHead(200, {
              'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
              'Content-Length': fs.statSync(rpath).size,
              'Accept-Ranges': 'none',
            });
            rs.pipe(res);
          } else {
            let rs = fs.createReadStream('host_websites/test/p404.html');
            res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
            rs.pipe(res);
          }
        }
      }
    }
  }
};