function getcTime() {
  return new Date().getTime();
}
function parentPath(path) {
  if (path == '/') return '/';
  let patharr = path.split('/');
  return patharr.slice(0, patharr.length - 1).join('/');
}
function pathEnd(path) {
  let patharr = path.split('/');
  return patharr[patharr.length - 1];
}
function normalize(path, cwd) {
  if (/^<\d+>$/.test(path)) return path;
  if (cwd === undefined) cwd = '/';
  if (cwd[cwd.length - 1] != '/') cwd += '/';
  if (path[0] != '/' && !/^<\d+>$/.test(path.split('/')[0])) path = cwd + path;
  path = path.replace(/\/+$/, '');
  let patharr = path.split('/');
  let bp = [];
  for (let i in patharr) {
    if (patharr[i] == '..') {if (bp.length > 1) bp.pop();} 
    else if (patharr[i] != '.') bp.push(patharr[i]);
  }
  let rbp = bp.join('/');
  if (rbp[0] != '/' && !/^<\d+>$/.test(rbp[0])) bp = '/' + bp;
  return rbp;
}
module.exports = { getcTime, parentPath, pathEnd, normalize };