module.exports = {
  'chat' : true,
  'chathere' : true,
  'chattyp' : true,
  'chatkick' : true,
  'rchat' : true,
  'mchat' : true,
  'views' : true,
  'comm' : true,
  'colog' : true,
  'debreq' : true,
  'cons' : true,
  'stdincons' : false,
  'reqtimelog' : false,
  'enc' : 'aes',
  'datadir' : 'data',
  'ipdm' : 1,
  'httpsf' : true,
  'httpsdm' : 2,
  'tickint' : 1000,
  'savefreq' : 10,
  'intmode' : false,
  'loginip' : true,
  'bwlimits' : {
    'main' : Infinity,
  },
  'debug' : false,
  'tost' : false,
  'lim' : {
    'chat' : 100,
    'rchat' : 100,
    'colog' : 100,
    'cologd' : 100,
    'cologmin' : 100,
    'cologdmin' : 100,
    'cologm' : 300,
    'debreq' : 100000,
  },
  'cache' : {
    'rp' : {},
    'adv' : false,
  },
  'hosts' : {
    'main' : [
      'server--coolguy284.repl.co',
      'server.coolguy284.repl.co',
      'coolguy284.repl.co',
      'c284.herokuapp.com',
    ],
    'map': {
    },
    'test' : [
    ],
  },
  'el' : {
    'cons' : ['/livechat.dat', '/liverchat.json', '/liveviews.dat', '/comms.json', '/colog.dat', '/cologd.dat', '/livechathere.dat', '/livechattyp.dat', '/livechatkick.dat', '/lat.log'],
    'consv' : ['/s?her=', '/s?typ=', '/a?co=', '/a?cd=', '/a?ccp=', '/a?rc='],
    'lockl' : ['/admin.html', '/colog.dat', '/cologd.dat'],
    'vh' : ['/ftx.txt', '/chathid.html', '/chatprivate.html', '/lat.log'],
    'vhv' : ['/s', '/r', '/a', '/pagg?=', '/oi?vr=', '/livechatd.log?id=', '/user', '/login?v=', '/logout?v='],
    'ajaxl' : ['/livechat.dat', '/liverchat.json', '/liveviews.dat', '/comms.json', '/colog.dat', '/cologd.dat', '/livechathere.dat', '/livechattyp.dat', '/livechatkick.dat', '/lat.log'],
    'vl' : ['/s?', '/r?', '/a?'],
  },
  'idstr' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  'tempp' : {
    '/helo.html' : [{'Content-Type':'text/plain; charset=utf-8'}, 'ｈｅｌｏ']
  },
};