function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function getcTime() {
  return new Date().getTime();
}

function pathSplit(path) {
  if (typeof path == 'string') {
    return path.split('/');
  } else if (Buffer.isBuffer(path)) {
    return path.toString('latin1').split('/').map(x => Buffer.from(x, 'latin1'));
    /*let patharr = [], s = 0;
    for (let i = 0; i < path.length; i++) {
      if (path[i] == 0x2f) {
        patharr.push(Buffer.from(path.slice(s, i)));
        if (i == path.length - 1) patharr.push(Buffer.alloc(0));
        s = i + 1;
      }
    }
    if (s < path.length) patharr.push(Buffer.from(path.slice(s, path.length)));
    return patharr;*/
  }
}
function pathJoin(patharr) {
  if (patharr.length == 0) return '';
  if (typeof patharr[0] == 'string') {
    return patharr.join('/');
  } else if (Buffer.isBuffer(patharr[0])) {
    return Buffer.from(patharr.map(x => x.toString('latin1')).join('/'), 'latin1');
    /*let bca = [], sep = Buffer.from('/');
    for (let i = 0; i < patharr.length - 1; i++) {
      bca.push(patharr[i], sep);
    }
    bca.push(patharr[patharr.length - 1]);
    return Buffer.concat(bca);*/
  }
}

function parentPath(path) {
  if (path == '/') return '/';
  if (Buffer.isBuffer(path) && path.length == 1 && path[0] == 0x2f) return Buffer.from('/');
  let patharr = pathSplit(path);
  return pathJoin(patharr.slice(0, patharr.length - 1));
}

function pathEnd(path) {
  let patharr = pathSplit(path);
  return patharr[patharr.length - 1];
}

function normalize(path, cwd) {
  let isbuf;
  if (Buffer.isBuffer(path) || Buffer.isBuffer(cwd)) {
    isbuf = true;
  }
  if (cwd === undefined) cwd = '/';
  if (isbuf) {
    path = path.toString('latin1');
    cwd = cwd.toString('latin1');
  } else {
    path = path.toString();
    cwd = cwd.toString();
  }
  if (/^<\d+>$/.test(path)) {
    if (isbuf) return Buffer.from(path, 'latin1');
    else return path;
  }
  if (cwd[cwd.length - 1] != '/') {
    cwd += '/';
  }
  if (path[0] != '/' && !/^<\d+>$/.test(path.split('/')[0]))
    path = cwd + path;
  path = path.replace(/\/+$/, '');
  let patharr = path.split('/');
  let bp = [];
  for (let i in patharr) {
    if (patharr[i] == '..') {if (bp.length > 1) bp.pop();} 
    else if (patharr[i] != '.') bp.push(patharr[i]);
  }
  let rbp = bp.join('/');
  if (rbp[0] != '/' && !/^<\d+>$/.test(rbp[0])) rbp = '/' + rbp;
  if (isbuf) return Buffer.from(rbp, 'latin1');
  else return rbp;
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

let MINORBITS = 20;
let MINORMASK = (1 << MINORBITS) - 1;

let major = (dev) => dev >> MINORBITS;
let minor = (dev) => dev & MINORMASK;
let makedev = (ma, mi) => (ma << MINORBITS) | mi;

module.exports = { getcTime, pathSplit, pathJoin, parentPath, pathEnd, normalize, fnbufencode, fnbufdecode, MINORBITS, MINORMASK, major, minor, makedev };