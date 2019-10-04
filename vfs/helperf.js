function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
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
function fnbufencode(buf) {
  let bufslices = [];
  let s = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] == 0x0a) {
      if (i > s) bufslices.push(buf.slice(s, i));
      bufslices.push(Buffer.from([0xff, 0x20]));
      s = i + 1;
    } else if (buf[i] == 0xff) {
      if (i > s) bufslices.push(buf.slice(s, i));
      bufslices.push(Buffer.from([0xff, 0xff]));
      s = i + 1;
    }
  }
  if (s < buf.length) bufslices.push(buf.slice(s, buf.length));
  return Buffer.concat(bufslices);
}
function fnbufdecode(buf) {
  let bufslices = [];
  let s = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] == 0xff) {
      if (i > s) bufslices.push(buf.slice(s, i));
      if (buf[i + 1] == 0x20) bufslices.push(Buffer.from([0x0a]));
      else if (buf[i + 1] == 0xff) bufslices.push(Buffer.from([0xff]));
      s = i + 2;
      i++;
    }
  }
  if (s < buf.length) bufslices.push(buf.slice(s, buf.length));
  return Buffer.concat(bufslices);
}
module.exports = { getcTime, parentPath, pathEnd, normalize, fnbufencode, fnbufdecode };