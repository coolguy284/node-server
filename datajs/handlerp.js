module.exports = {
  '/hen/': function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    res.write(req.url);
    res.end();
  },
  '/ng?n=': function (req, res) {
    savedvars.np.push(decodeURIComponent(req.url.substr(6, Infinity)));
    res.writeHead(204);
  },
};