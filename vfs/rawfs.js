// jshint -W041
let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystem {
  constructor(writable, inoarr, inodarr, fi, groups) {
    if (writable === undefined) writable = false;
    if (inoarr === undefined) {
      inoarr = [Buffer.alloc(0)];
    }
    if (inodarr === undefined) {
      let ctime = getcTime();
      inodarr = [['d', 1, ctime, ctime, ctime, 0o777, 'root', 'root']];
      /*inodarr = [Buffer.from([
        0x01,
        0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x01, 0xff,
        0x72, 0x6f, 0x6f, 0x74, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x72, 0x6f, 0x6f, 0x74, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])];*/
    }
    if (fi === undefined) fi = [];
    if (groups === undefined) groups = {};
    this.writable = writable;
    this.inoarr = inoarr;
    this.inodarr = inodarr;
    this.fi = fi;
    this.groups = groups;
  }
  parseFolder(buf) {
    return buf.toString().split('\n').map(x => x.split(':'));
  }
  popfi(typ) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.fi.length > 0) {
      let ino = this.fi.splice(0, 1)[0];
      let ctime = getcTime();
      this.inoarr[ino] = Buffer.alloc(0);
      this.inodarr[ino] = [typ, 0, ctime, ctime, ctime, 0o777, 'root', 'root'];
      return ino;
    } else {
      let ctime = getcTime();
      this.inoarr.push(Buffer.alloc(0));
      this.inodarr.push([typ, 0, ctime, ctime, ctime, 0o777, 'root', 'root']);
      return this.inoarr.length - 1;
    }
  }
  getInode(path, symlink) {
    if (symlink === undefined) symlink = true;
    if (path == '/') {
      return 0;
    } else if (/^<\d+>$/.test(path)) {
      return parseInt(path.substring(1, path.length - 1));
    }
    let ino = 0;
    let patharr = path.split('/');
    if (/^<\d+>$/.test(patharr[0])) {
      ino = parseInt(patharr[0].substring(1, patharr[0].length - 1));
    }
    patharr.splice(0, 1);
    for (let i in patharr) {
      let fc = this.parseFolder(this.inoarr[ino]);
      let nino = null;
      for (let j in fc) {
        if (fc[j][0] == patharr[i]) {
          nino = parseInt(fc[j][1]);
          break;
        }
      }
      if (nino != null) {
        ino = nino;
      } else {
        return null;
      }
      if (this.inodarr[ino][0] == 's' && (symlink || parseInt(i) != patharr.length - 1)) {
        ino = this.getInode(this.inoarr[ino].toString());
      } else if (this.inodarr[ino][0] != 'd' && parseInt(i) != patharr.length - 1) {
        throw new Error(patharr.slice(0, i).join('/') + ' not a directory');
      }
    }
    return ino;
  }
  geteInode(path, symlink) {
    let rv = this.getInode(path, symlink);
    if (rv === null) {
      throw new Error('ENOENT no such file or directory: ' + path);
    }
    return rv;
  }
  createFile(path, typ) {
    let ino = this.popfi(typ);
    this.appendFolder(this.geteInode(parentPath(path)), pathEnd(path), ino);
    this.inodarr[ino][1]++;
    return ino;
  }
  getcInode(path, typ, symlink) {
    let ino = this.getInode(path, symlink);
    if (ino === null) {
      return this.createFile(path, typ);
    } else {
      return ino;
    }
  }
  appendFolder(ino, nam, inot) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.inoarr[ino].length == 0) {
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino], Buffer.from(nam + ':' + inot)]);
    } else {
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino], Buffer.from('\n' + nam + ':' + inot)]);
    }
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  exists(path) {
    return this.getInode(path) != null;
  }
  stat(path) {
    let ino = this.geteInode(path);
    let inof;
    switch (this.inodarr[ino][0]) {
      case 'f': inof = 0o100000; break;
      case 'd': inof = 0o40000; break;
      case 's': inof = 0o120000; break;
    }
    return new fs.Stat(null, inof + this.inodarr[ino][5], this.inodarr[ino][1], this.inodarr[ino][6], this.inodarr[ino][7], null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.inodarr[ino][4], this.inodarr[ino][3], this.inodarr[ino][2], this.inodarr[ino][2]);
  }
  lstat(path) {
    let ino = this.geteInode(path, false);
    let inof;
    switch (this.inodarr[ino][0]) {
      case 'f': inof = 0o100000; break;
      case 'd': inof = 0o40000; break;
      case 's': inof = 0o120000; break;
    }
    return new fs.Stat(null, inof + this.inodarr[ino][5], this.inodarr[ino][1], this.inodarr[ino][6], this.inodarr[ino][7], null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.inodarr[ino][4], this.inodarr[ino][3], this.inodarr[ino][2], this.inodarr[ino][2]);
  }
  chmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path);
    this.inodarr[ino][5] = mode;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  lchmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    this.inodarr[ino][5] = mode;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  chown(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(path);
    this.inodarr[ino][6] = user;
    this.inodarr[ino][7] = group;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  lchown(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    this.inodarr[ino][6] = user;
    this.inodarr[ino][7] = group;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  utimes(path, atime, mtime) {
    let ino = this.geteInode(path);
    this.inodarr[ino][4] = Number(atime);
    this.inodarr[ino][3] = Number(mtime);
  }
  readFile(path) {
    let ino = this.geteInode(path);
    if (this.writable) this.inodarr[ino][4] = getcTime();
    return Buffer.from(this.inoarr[ino]);
  }
  writeFile(path, buf) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.getcInode(path, 'f');
    this.inoarr[ino] = Buffer.from(buf);
  }
  appendFile(path, buf) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (typeof buf == 'string') buf = Buffer.from(buf);
    let ino = this.getcInode(path, 'f');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  truncate(path, len) {
    if (len === undefined) len = 0;
    let ino = this.geteInode(path);
    if (this.inoarr[ino].length > len) {
      let nbuf = Buffer.allocUnsafe(len);
      this.inoarr[ino].copy(nbuf, 0, 0, len);
      this.inoarr[ino] = nbuf;
    } else if (this.inoarr[ino].length < len) {
      let nbuf = Buffer.alloc(len);
      this.inoarr[ino].copy(nbuf);
      this.inoarr[ino] = nbuf;
    }
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  createReadStream(path) {
    let s = new datajs.s.BufReadStream(this.inoarr[this.geteInode(path)]);
    if (this.writable) this.inodarr[ino][4] = getcTime();
    return s;
  }
  createWriteStream(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let s = new datajs.s.BufWriteStream(undefined, true);
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
    s.on('finish', function () {
      this.inoarr[this.getcInode(path, 'f')] = s.ibuf;
      let ctime = getcTime();
      this.inodarr[ino][3] = ctime;
      this.inodarr[ino][4] = ctime;
    });
    return s;
  }
  link(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.inodarr[ino][1]++;
  }
  unlink(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inop = this.geteInode(parentPath(path));
    let ino = this.geteInode(path, true);
    let pf = this.parseFolder(this.inoarr[inop]);
    let delino = null;
    for (let i in pf) {
      if (pf[i] == ino) delino = i;
    }
    pf.splice(delino, 1);
    this.inoarr[inop] = Buffer.from(pf.map(x => x.join(':')).join('\n'));
    this.inodarr[ino][1]--;
    if (this.inodarr[ino][1] <= 0) this.fi.push(ino);
    let ctime = getcTime();
    this.inodarr[inop][3] = ctime;
    this.inodarr[inop][4] = ctime;
  }
  copyFile(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inof = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    let inot = this.getcInode(patht, 'f');
    this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    this.inodarr[inof][4] = this.inodarr[inot][2];
  }
  readlink(path, options) {
    let ino = this.geteInode(path, false);
    if (this.inodarr[ino][0] != 's') throw new Error('path not a symbolic link');
    if (this.writable) this.inodarr[ino][4] = getcTime();
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  symlink(target, path) {
    if (this.exists(path)) throw new Error('path already exists');
    let ino = this.getcInode(path, 's');
    this.inoarr[ino] = Buffer.from(target);
  }
  readdir(path) {
    let ino = this.geteInode(path);
    if (this.writable) this.inodarr[ino][4] = getcTime();
    return this.parseFolder(this.inoarr[ino]).map(x => x[0]);
  }
  mkdir(path) {
    this.createFile(path, 'd');
  }
  rename(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.unlink(pathf);
  }
  // rmdir :(
}
module.exports = {FileSystem, init};