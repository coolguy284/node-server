module.exports = function postf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let cv;
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
  }
};