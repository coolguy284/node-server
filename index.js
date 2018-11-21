global.cp = require('child_process');
global.serv = null;
global.letterm = false;
global.checkable = true;
global.checkt = 0;
global.scint = 0;
global.rstimes = 0;
global.timeout = 5000;
global.maxrstimes = 5;
function prepserv() {
  process.stdin.unpipe();
  global.serv = cp.spawn('node', ['aaa.js'], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
  process.stdin.pipe(serv.stdin);
  serv.stdout.pipe(process.stdout);
  serv.stderr.pipe(process.stderr);
  serv.on('message', function(val) {
    switch (val[0]) {
      case 'alertchecked':
        global.checkable = true;
        global.rstimes = 0;
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
        global.timeout = val[1];
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
      global.serv = null;
    }
  });
}
prepserv();
global.scint = setInterval(function () {
  if (serv) {
    if (checkable) {
      serv.send(['alertcheck']);
      global.checkable = false;
      global.checkt = new Date().getTime() + timeout;
    } else if (new Date().getTime() > checkt) {
      serv.kill();
      global.checkable = true;
    }
  }
}, 1000);