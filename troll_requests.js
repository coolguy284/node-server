// fun data for bad web crawlers
/* request urls summary:
 * bad ones:
  - GET  /index.php?s=/Index/\think\app/invokefunction&function=call_user_func_array&vars[0]=md5&vars[1][]=HelloThinkPHP
  - GET  /?XDEBUG_SESSION_START=phpstorm
  - POST /api/jsonws/invoke
  - GET  /vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php
  - POST /vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php
  - GET  /owa/auth/logon.aspx?url=https%3a%2f%2f1%2fecp%2f
 * normal ones:
  - GET  /TP/public/index.php
 */
module.exports = function trollsf(req, res, rrid, ipaddr, proto, url, cookies, nam) {
  if (!datajs.feat.trolls) return;
  if (req.url.startsWith('/?a=fetch&content=')) {
    // apparantly ips will request this type of url to have the server echo back the HTML and PHP given, must be a security vulnerability
    let content = req.url.slice(18, Infinity);
    console.log('Fetching "content" (may be PHP 😜): ' + content);
    // give them some "content"
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(content);
    // then bomdard with 128MiB random data
    let seedfunc = datajs.prng.xmur3(new Date().toISOString());
    new datajs.s.RandomStream(
      2 ** 27, 
      {randbytesfunc: datajs.prng.sfc32_multifunc(
        seedfunc(), seedfunc(), seedfunc(), seedfunc()
      ).randomBytes}
    ).pipe(new datajs.Throttle({bps: 2 ** 20})).pipe(res);
    return 1;
  } else if (req.url == '/?XDEBUG_SESSION_START=phpstorm') {
    res.end();
    return 1;
  } else if (req.url == '/api/jsonws/invoke') {
    // client wants some json web services data
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data).toString();
      console.log('Getting JSON data 😜 (jsonws invoke)');
      console.log(util.inspect(data));
      // gives client 16MiB+ garbage data
      (async () => {
        let returneddata = [], seedpart = new Date().toISOString();
        for (let i = 0; i < 1024; i++) {
          returneddata.push(JSON.stringify(datajs.prng.randomBytes(2 ** 14, seedpart + '+' + ('' + i).padStart(4, '0')).toString()));
          await datajs.sleepImmediate();
        }
        res.write('[' + returneddata.join(',') + ']');
        res.end();
      })();
    });
    return 1;
  } else if (req.url == '/solr/admin/info/system?wt=json') {
    res.end();
    return 1;
  } else if (req.url == '/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php') {
    // anything sent as request body is executed by vulnerable php servers
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data);
      console.log('Someone wants to execute some code (phpunit eval-stdin)');
      console.log(data);
      console.log(util.inspect(data.toString()));
      // bomdard with 128MiB random data
      let seedfunc = datajs.prng.xmur3(new Date().toISOString());
      new datajs.s.RandomStream(
        2 ** 27, 
        {randbytesfunc: datajs.prng.sfc32_multifunc(
          seedfunc(), seedfunc(), seedfunc(), seedfunc()
        ).randomBytes}
      ).pipe(new datajs.Throttle({bps: 2 ** 20})).pipe(res);
    });
    return 1;
  }
};