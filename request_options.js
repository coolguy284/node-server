module.exports = function optionsf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  res.writeHead(204, {'Allow': 'OPTIONS, GET, HEAD'});
  res.end();
};