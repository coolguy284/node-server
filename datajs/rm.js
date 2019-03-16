module.exports = {
  sn: function (res) {
    res.writeHead(204);
    res.end();
  },
  restext: function restext(res, text) {
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
    res.write(text);
    res.end();
  },
  reshead: function reshead(res) {
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
    res.end();
  },
  reqinfo: function reqinfo(req, ts, ipaddr, proto, url, cookies, nam) {
    let socket = {
      encrypted: req.socket.encrypted,
      localAddress: req.socket.localAddress,
      localPort: req.socket.localPort,
      remoteAddress: req.socket.remoteAddress,
      remoteFamily: req.socket.remoteFamily,
      remotePort: req.socket.remotePort,
    };
    return {
      method: req.method,
      url: req.url,
      timestamp: ts,
      headers: req.headers,
      connection: socket,
      socket: socket,
      ipaddr: ipaddr,
      proto: proto,
      hosturl: url,
      host: url,
      cookies: cookies,
      nam: nam,
    };
  },
  parsecookies: function parsecookies(req) {
    var list = {};
    var rc = req.headers.cookie;
    rc && rc.split(';').forEach(function (cookie) {
      var parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
  },
};