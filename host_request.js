module.exports = async function hreq(req, res, rrid, ipaddr, proto, url, althost, cookies, nam) {
  if (althost == 'test') {
    if (req.method == 'GET') {
      if (req.url == '/') {
        let rs = fs.createReadStream('host_websites/test/indexredirect.html');
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        rs.pipe(res);
      } else {
        let rpath = 'host_websites/test' + req.url, runelse = false;
        if ((await fs.promises.exists(rpath)) && datajs.subdir('host_websites/test', rpath)) {
          let stat = await fs.promises.stat(rpath);
          if (stat.isFile()) {
            let rs = fs.createReadStream(rpath);
            res.writeHead(200, {
              'Content-Type': (datajs.mime.get(req.url) + '; charset=utf-8'),
              'Content-Length': stat.size,
              'Accept-Ranges': 'none',
            });
            rs.pipe(res);
          } else runelse = true;
        } else runelse = true;
        if (runelse) {
          let rs = fs.createReadStream('host_websites/test/p404.html');
          res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
          rs.pipe(res);
        }
      }
    }
  }
};