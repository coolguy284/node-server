module.exports = {
  mimel: {
    html: 'text/html',
    htm: 'text/html',
    js: 'text/js',
    css: 'text/css',
    png: 'image/png',
    ico: 'image/vnd.microsoft.icon',
    log: 'text/plain',
    txt: 'text/plain',
  },
  get: function get(fn) {
    let dl = fn.split('.');
    let ext = dl[dl.length-1];
    let val = module.exports.mimel[ext];
    if (val) return val;
    val = global.mime.getType(ext);
    if (val) return val; else return 'text/plain';
  },
};