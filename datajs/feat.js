// panel of switches for the server
module.exports = {
  chat: true,
  chates: true, // eventstream chat
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
  reqtimelog: false, // log request time
  errmsg: false, // show message with server error
  enc: 'aes',
  datadir: 'data', // directory to save server state, '' for no state saving
  ipdm: 1,
  httpsf: true,
  httpsdm: 2,
  tickint: 1000, // server ticking interval
  savefreq: 10, // server saves state every nth tick
  intmode: false, // only allows requests from 127.0.0.1 ip address, useful for reverse proxy
  loginip: true, // whether ip address is used for login
  bwlimits: {
    main: Infinity, // server webpage bandwidth limit
  },
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
    cologm: 300,
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
    consv: ['/s?her=', '/s?typ=', '/m?cnl=', '/a?co=', '/a?cd=', '/a?ccp=', '/a?rc='],
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
    '/helo.html' : [{'Content-Type':'text/plain; charset=utf-8'}, 'ｈｅｌｏ']
  },
};