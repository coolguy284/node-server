module.exports = {
  '/hen' : new Function('req', 'res', 'res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"});res.write(req.url);res.end();'),
  '/ng?n=' : new Function('req', 'res', 'savedvars.np.push(decodeURIComponent(req.url.substr(6, Infinity)));res.writeHead(204);')
};