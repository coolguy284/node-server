module.exports = {
  main: {
    '/dat.html': function (req, res, rrid, ipaddr, proto, url, cookies, nam) {
      if (req.method != 'GET' && req.method != 'HEAD') return;
      res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      if (req.method == 'GET') res.write(new Date().toString());
      res.end();
    },
  },
  coolguy284: {
    '/user/adv-calculator.html': async function (req, res) {
      if (req.method != 'GET') return;
      let str = (await fs.promises.readFile('websites/tools/calculator/index.html')).toString(),
        jsstr = '      ' +
        (await fs.promises.readFile('websites/tools/calculator/images_port.js')) + '\n' +
        (await fs.promises.readFile('websites/js/utilinspect.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/constants.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/types.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/typessupp.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/operators.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/compops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/matrixops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/surrops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/funccall.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/namespace.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/exprconvert.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/exprparser.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/stmtconvert.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/stmtparser.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/index.js')),
        cssstr = '      ' +
        (await fs.promises.readFile('websites/tools/calculator/index.css')),
        helpstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/help.png')).toString('base64'),
        settstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/settings.png')).toString('base64'),
        closstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/close.png')).toString('base64');
      jsstr = jsstr.replace(/\n/g, '\n      ');
      jsstr = jsstr.replace('{helpsrc}', '\'' + helpstr + '\'');
      jsstr = jsstr.replace('{settingssrc}', '\'' + settstr + '\'');
      jsstr = jsstr.replace('{closesrc}', '\'' + closstr + '\'');
      cssstr = cssstr.replace(/\n/g, '\n      ');
      str = str.replace(/<link rel = 'stylesheet' href = 'index.css'>/g, '<style>\n' + cssstr + '\n    </style>');
      str = str.replace(/<script[^]*\/script>/g, '<script>\n' + jsstr + '\n    </script>\n    <!-- original source of next script: https://cdnjs.cloudflare.com/ajax/libs/mathjs/5.10.3/math.min.js -->\n    <script src = \'../js/math-5.10.3.min.js\'></script>');
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      if (datajs.feat.cache.adv) {
        datajs.handlerf.coolguy284['/user/adv-calculator.html'] = function (req, res) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write(str);
          res.end();
          return -1;
        };
      }
      return -1;
    },
    '/user/adv-calculator-2.html': async function (req, res) {
      if (req.method != 'GET') return;
      let str = (await fs.promises.readFile('websites/tools/calculator/index.html')).toString(),
        jsstr = '      ' +
        (await fs.promises.readFile('websites/tools/calculator/images_port.js')) + '\n' +
        (await fs.promises.readFile('websites/js/utilinspect.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/constants.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/types.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/typessupp.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/operators.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/compops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/matrixops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/surrops.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/funccall.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/namespace.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/exprconvert.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/exprparser.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/stmtconvert.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/stmtparser.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/calculator/index.js')) + '\n' +
        '// original source of next script: https://cdnjs.cloudflare.com/ajax/libs/mathjs/5.10.3/math.min.js' +
        (await fs.promises.readFile('websites/js/math-5.10.3.min.js')),
        cssstr = '      ' +
        (await fs.promises.readFile('websites/tools/calculator/index.css')),
        helpstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/help.png')).toString('base64'),
        settstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/settings.png')).toString('base64'),
        closstr = 'data:image/png;base64,' + (await fs.promises.readFile('websites/images/close.png')).toString('base64');
      jsstr = jsstr.replace(/\n/g, '\n      ');
      jsstr = jsstr.replace('{helpsrc}', '\'' + helpstr + '\'');
      jsstr = jsstr.replace('{settingssrc}', '\'' + settstr + '\'');
      jsstr = jsstr.replace('{closesrc}', '\'' + closstr + '\'');
      cssstr = cssstr.replace(/\n/g, '\n      ');
      str = str.replace(/<link rel = 'stylesheet' href = 'index.css'>/g, '<style>\n' + cssstr + '\n    </style>');
      str = str.replace(/<script[^]*\/script>/g, '<script>\n' + jsstr + '\n    </script>');
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      if (datajs.feat.cache.adv) {
        datajs.handlerf.coolguy284['/user/adv-calculator-2.html'] = function (req, res) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write(str);
          res.end();
          return -1;
        };
      }
      return -1;
    },
    '/user/adv-systemdata.html': async function (req, res) {
      if (req.method != 'GET') return;
      let str = (await fs.promises.readFile('websites/tools/systemdata/index.html')).toString(),
        jsstr = '      ' + 
        (await fs.promises.readFile('websites/js/base64.js')) + '\n' +
        (await fs.promises.readFile('websites/js/utilinspect.js')) + '\n' +
        (await fs.promises.readFile('websites/js/utilformat.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/systemdata/systemdata.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/systemdata/consoleedit.js')) + '\n' +
        (await fs.promises.readFile('websites/tools/systemdata/conc.js'));
      jsstr = jsstr.replace(/\n/g, '\n      ');
      str = str.replace(/<script[^]*\/script>/g, '<script>\n' + jsstr + '\n    </script>');
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      if (datajs.feat.cache.adv) {
        datajs.handlerf.coolguy284['/user/adv-systemdata.html'] = function (req, res) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write(str);
          res.end();
          return -1;
        };
      }
      return -1;
    },
    '/user/adv-coderunner.html': async function (req, res) {
      if (req.method != 'GET') return;
      let str = (await fs.promises.readFile('websites/tools/coderunner.html')).toString(),
        jsstr = '      ' + 
        (await fs.promises.readFile('websites/js/utilinspect.js')) + '\n' +
        (await fs.promises.readFile('websites/js/utilformat.js'));
      jsstr = jsstr.replace(/\n/g, '\n      ');
      str = str.replace(/\n[ ]*worker.postMessage(['import', .*]);/g, '');
      str = str.replace(/<script id = 'workerscr' type = 'javascript\/worker'>/g, '<script id = \'workerscr\' type = \'javascript/worker\'>\n' + jsstr);
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      if (datajs.feat.cache.adv) {
        datajs.handlerf.coolguy284['/user/adv-coderunner.html'] = function (req, res) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write(str);
          res.end();
          return -1;
        };
      }
      return -1;
    },
    '/user/adv-sitemap.xml': async function (req, res) {
      if (req.method != 'GET') return;
      let str = (await fs.promises.readFile('user_websites/coolguy284/sitemap.xml')).toString(),
        tstr = (await fs.promises.readFile('user_websites/coolguy284/sitemappart.xml')).toString(),
        bstr = [];
      let cr = datajs.crawl.crawl('/index.html');
      for (var i in cr) {
        bstr.push(tstr.replace('{path}', cr[i][0]).replace('{date}', cr[i][1]).replace('{priority}', cr[i][2]));
      }
      str = str.replace('{info}', bstr.join('\n'));
      res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
      res.write(str);
      res.end();
      if (datajs.feat.cache.adv) {
        datajs.handlerf.coolguy284['/user/adv-sitemap.xml'] = function (req, res) {
          res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
          res.write(str);
          res.end();
          return -1;
        };
      }
      return -1;
    },
  },
};