module.exports = {
  'mimel' : {
    'html' : 'text/html',
    'htm' : 'text/html',
    'js' : 'text/js',
    'css' : 'text/css',
    'png' : 'image/png',
    'ico' : 'image/vnd.microsoft.icon',
    'log' : 'text/plain',
    'txt' : 'text/plain',
  },
  'get' : function get(fn) {
    let dl = fn.split('.');
    let ext = dl[dl.length-1];
    let val = module.exports.mimel[ext];
    if (val === undefined) {
      val = global.mime.getType(ext);
    } else {
      return val;
    }
    if (val === null) {
      return 'text/plain';
    } else {
      return val;
    }
  },
};