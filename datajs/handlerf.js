module.exports = {
  'null/dat.html' : new Function('req', 'res', 'res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});res.write(new Date().toString());res.end();'),
  'coolguy284/user/tools/adv-calculator.html' : function (req, res) {
    let str = fs.readFileSync('websites/tools/calculator/index.html').toString(),
      jsstr = '      ' + 
      fs.readFileSync('websites/js/utilinspect.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/constants.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/types.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/operators.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/compops.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/matrixops.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/surrops.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/funccall.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/namespace.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/exprconvert.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/exprparser.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/stmtconvert.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/stmtparser.js') + '\n' +
      fs.readFileSync('websites/tools/calculator/index.js'),
      helpstr = 'data:image/png;base64,' + fs.readFileSync('websites/images/help.png').toString('base64'),
      settstr = 'data:image/png;base64,' + fs.readFileSync('websites/images/settings.png').toString('base64'),
      closstr = 'data:image/png;base64,' + fs.readFileSync('websites/images/close.png').toString('base64');
    jsstr = jsstr.replace(/\n/g, '\n      ');
    jsstr = jsstr.replace('../../images/close.png', closstr);
    str = str.replace('../../images/help.png', helpstr);
    str = str.replace('../../images/settings.png', settstr);
    str = str.replace(/<script[^]*\/script>/g, '<script>\n' + jsstr + '\n    </script>');
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
    res.write(str);
    res.end();
    datajs.handlerf['coolguy284/user/tools/adv-calculator.html'] = function (req, res) {
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      return -1;
    }
    return -1;
  },
};