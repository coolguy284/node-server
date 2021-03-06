module.exports = function postf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let cv, runelse = false;
  switch (true) {
    case req.url == '/a?ns':
      let ar = [];
      req.on('data', (c) => ar.push(c));
      req.on('end', () => {
        let buf = Buffer.concat(ar);
        cv = JSON.parse(b64.decode(buf.toString()));
        let prop = nam != null ? nam : 'main';
        if (/*saveddat[prop].hasOwnProperty(cv[0]) && */sha256.hex(cv[1]) == b64a.server) {
          saveddat[prop][cv[0]] = cv[2];
        }
      });
      datajs.rm.sn(res);
      break;
    /*case req.url == '/uploader.html':
      let ws = fs.createWriteStream(`saves/${Date.now()}.txt`);
      req.on('data', c => ws.write(c));
      req.on('end', () => {
        ws.end();
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.write('its good close tab now.');
        res.end();
      });*/
    default:
      runelse = true;
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