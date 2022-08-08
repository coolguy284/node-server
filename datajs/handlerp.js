module.exports = {
  '/hen/': function (req, res) {
    if (req.method != 'GET' && req.method != 'HEAD') return;
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    if (req.method == 'GET') res.write(req.url);
    res.end();
  },
  '/ng?n=': function (req, res) {
    if (Object.keys(savedvars.np).length < 1000) {
      if (savedvars.np) savedvars.np.push(decodeURIComponent(req.url.substr(6, Infinity)));
      global.savedvarsVers++;
    }
    res.writeHead(204);
  },
};