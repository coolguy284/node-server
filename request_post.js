module.exports = function postf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let cv, runelse = false;
  switch (req.url) {
    case '/a?ns':
      let ar = [];
      req.on('data', (c) => ar.push(c));
      req.on('end', () => {
        let buf = Buffer.concat(ar);
        cv = JSON.parse(b64.decode(buf.toString()));
        let prop = nam != null ? nam : 'main';
        let eq1 = Buffer.from(sha256.hex(cv[1]), 'hex'), eq2 = Buffer.from(b64a.server, 'hex');
        if (/*saveddat[prop].hasOwnProperty(cv[0]) && */eq1.length == eq2.length && crypto.timingSafeEqual(eq1, eq2)) {
          saveddat[prop][cv[0]] = cv[2];
          global.saveddatVars++;
        }
      });
      datajs.rm.sn(res);
      break;
    default:
      if (datajs.feat.upload && req.url == '/uploader.html') {
        let ws = fs.createWriteStream(`saves/${Date.now()}.txt`);
        req.on('data', c => ws.write(c));
        req.on('end', () => {
          ws.end();
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write('its good close tab now.');
          res.end();
        });
      } else runelse = true;
      break;
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