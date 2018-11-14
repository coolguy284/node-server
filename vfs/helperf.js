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
  if (cwd === undefined) cwd = '';
  if (path[0] != '/') {
    if (path[0] == '.') path = cwd + '/' + path;
    else path = cwd + path;
  }
  let patharr = path.split('/');
  let bp = [];
  for (let i in patharr) {
    if (patharr[i] == '..') {
      bp.pop();
    } else if (patharr[i] != '.') {
      bp.push(patharr[i]);
    }
  }
  return bp.join('/');
}
module.exports = {getcTime, parentPath, pathEnd, normalize};