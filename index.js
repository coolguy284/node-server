var cp = require('child_process');
var serv = null;
var letterm = false;
var checkable = true;
var checkt = 0;
var scint = 0;
var rstimes = 0;
var timeout = 5000;
var maxrstimes = 5;
function prepserv() {
  process.stdin.unpipe();
  serv = cp.spawn('node', ['aaa.js'], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
  process.stdin.pipe(serv.stdin);
  serv.stdout.pipe(process.stdout);
  serv.stderr.pipe(process.stderr);
  serv.on('message', function(val) {
    switch (val[0]) {
      case 'alertchecked':
        checkable = true;
        rstimes = 0;
        break;
      case 'term':
        global.letterm = true;
        global.checkable = false;
        clearInterval(scint);
        serv.kill();
        break;
      case 'restart':
        serv.kill();
        break;
      case 'settimeout':
        timeout = val[1];
        break;
      case 'gettimeout':
        serv.send(['timeout', global.timeout]);
        break;
    }
  });
  serv.on('exit', function (code, signal) {
    console.log('server exited with signal [' + signal + '] with code ' + code);
    if (!letterm && ++rstimes < maxrstimes) {
      prepserv();
    } else {
      serv = null;
    }
  });
}
prepserv();
scint = setInterval(function () {
  if (serv) {
    if (checkable) {
      serv.send(['alertcheck']);
      checkable = false;
      checkt = new Date().getTime() + timeout;
    } else if (new Date().getTime() > checkt) {
      serv.kill();
      checkable = true;
    }
  }
}, 1000);