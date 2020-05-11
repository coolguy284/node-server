module.exports = function optionsf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  let mode = 0;
  switch (true) {
    case true:
      mode = 1;
  }
  if (mode == 1) {
    res.writeHead(204, {'Allow': 'OPTIONS, GET, HEAD'});
    res.end();
  }
};