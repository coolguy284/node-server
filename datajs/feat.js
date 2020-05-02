// panel of switches for the server
module.exports = {
  chat: true,
  chates: false, // eventstream chat
  chathere: true,
  chattyp: true,
  chatkick: true,
  rchat: true,
  mchat: true,
  views: true,
  comm: true,
  colog: true,
  debreq: true,
  cons: true,
  stdincons: false, // whether stdin can execute code
  reqtimelog: false, // log time to complete request
  errmsg: false, // show message with server error
  activeconn: true, // maintain array of active connections
  enc: 'aes',
  pkeysize: 1024,
  datadir: 'data', // directory to save server state, '' for no state saving
  // file logging flags (add values together) NOT IMPLEMENTED
  // 1 - log colog
  // 2 - log cologd
  // 4 - log json of requests
  filelog: 0,
  // mode of determining client ip address
  // 0 - use req.connection.remoteAddress
  // 1 - use x-forwarded-for, pick the third item from the end of list, if list is shorter than 3, then pick first item in list, if header nonexistent then req.connection.remoteAddress
  // 2 - use x-forwarded-for, pick last item in list, if nonexistent then req.connection.remoteAddress
  ipdm: 2,
  httpsf: true,
  // mode of determining whether connection is https or not
  // 0 - use req.connection.encrypted
  // 1 - use x-forwarded-proto, if nonexistent then req.connection.encrypted
  // 2 - use x-forwarded-proto, if nonexistent then https
  httpsdm: 1,
  tickint: 1000, // server ticking interval
  savefreq: 10, // server saves state every nth tick
  intmode: false, // only allows requests from 127.0.0.1 ip address, useful for reverse proxy
  loginip: true, // whether ip address is used for login
  bwlimits: {
    main: Infinity, // server webpage bandwidth limit
  },
  permissiverange: false, // whether server is permissive of bad range requests
  debug: {
    js: false, // whether files from outside websites folder can be accessed
    testerr: false, // whether test error url exists
  },
  tost: false,
  lim: { // controls maximum array entries for things
    chat: 100,
    rchat: 100,
    mchat: 100,
    colog: 100,
    cologd: 100,
    cologmin: 100,
    cologdmin: 100,
    cologm: 300, // request log character limit
    debreq: 100000,
  },
  cache: {
    rp: {},
    adv: false,
  },
  hosts: {
    main: [
      'server--coolguy284.repl.co',
      'server.coolguy284.repl.co',
      'coolguy284.repl.co',
      'c284.herokuapp.com',
    ],
    map: {
      'test.coolguy284.com': 'test',
    },
    test: [
      'test.coolguy284.com',
    ],
  },
  el: {
    // urls that dont get logged in console
    cons: ['/livechat.dat', '/liverchat.json', '/liveviews.dat', '/comms.json', '/colog.dat', '/cologd.dat', '/livechathere.dat', '/livechattyp.dat', '/livechatkick.dat', '/lat.log'],
    // url startswiths that dont get logged in console
    consv: ['/s?her=', '/s?typ=', '/m?cnl=', '/a?co=', '/a?cd=', '/a?ccp=', '/a?rc=', '/a?fstyp=', '/a?fsdir=', '/a?fstex='],
    // locked server allowable urls
    lockl: ['/admin.html', '/colog.dat', '/cologd.dat'],
    // urls that dont show up in viewshist
    vh: ['/ftx.txt', '/chathid.html', '/chatprivate.html', 'mchat.html', '/lat.log'],
    // url startswiths that dont show up in viewshist
    vhv: ['/s?', '/r?', '/m?', '/a?', '/pagg?=', '/oi?vr=', '/livechatd.log?id=', '/user', '/login?v=', '/logout?v='],
    // ajax urls
    ajaxl: ['/livechat.dat', '/liverchat.json', '/liveviews.dat', '/comms.json', '/colog.dat', '/cologd.dat', '/livechathere.dat', '/livechattyp.dat', '/livechatkick.dat', '/lat.log'],
    // variable urls
    vl: ['/s?', '/r?', '/m?', '/a?'],
  },
  idstr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  tempp: { // simple temporary pages, for functions use handlerf or handlerp
    '/helo.html' : [{'Content-Type': 'text/plain; charset=utf-8'}, 'ｈｅｌｏ'],
    '/images/hell.png': [{'Content-Type': 'text/plain; charset=utf-8'}, 'sans haha']
  },
};