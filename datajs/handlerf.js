module.exports = {
  '/dat.html' : new Function('req', 'res', 'res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});res.write(new Date().toString());res.end();'),
  '/calculator.js' : function (req, res) {
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
    let v = Buffer.from('\n');
    res.write(Buffer.concat([fs.readFileSync('websites/js/utilinspect.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/constants.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/types.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/operators.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/funccall.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/namespace.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/exprconvert.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/exprparser.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/stmtconvert.js'), v]));
    res.write(Buffer.concat([fs.readFileSync('websites/calculator/stmtparser.js'), v]));
    res.write(fs.readFileSync('websites/calculator/index.js'));
    res.end();
    return -1;
  },
};