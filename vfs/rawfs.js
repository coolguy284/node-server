// jshint -W041
let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystem {
  constructor(writable, opts) {
    if (writable === undefined) writable = false;
    if (opts === undefined) opts = {};
    if (opts.inoarr === undefined) opts.inoarr = [Buffer.alloc(0)];
    if (opts.inodarr === undefined) {
      let ctime = getcTime();
      //opts.inodarr = [['d', 1, ctime, ctime, ctime, 0o777, 'root', 'root']];
      opts.inodarr = [Buffer.from([0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])];
      opts.inodarr[0].writeUIntBE(ctime, 3, 6);
      opts.inodarr[0].writeUIntBE(ctime, 9, 6);
      opts.inodarr[0].writeUIntBE(ctime, 15, 6);
    }
    if (opts.fi === undefined) opts.fi = [];
    if (opts.uids === undefined) opts.uids = ['root'];
    if (opts.gids === undefined) opts.gids = ['root'];
    if (opts.groups === undefined) opts.groups = {};
    this.writable = writable;
    this.inoarr = opts.inoarr;
    this.inodarr = opts.inodarr;
    this.fi = opts.fi;
    this.uids = opts.uids;
    this.gids = opts.gids;
    this.groups = opts.groups;
  }
  getInod(ino, ind) {
    switch (ind) {
      case 0: return this.inodarr[ino].readUInt8(0);
      case 1: return this.inodarr[ino].readUInt16BE(1);
      case 2: return this.inodarr[ino].readUIntBE(3, 6);
      case 3: return this.inodarr[ino].readUIntBE(9, 6);
      case 4: return this.inodarr[ino].readUIntBE(15, 6);
      case 5: return this.inodarr[ino].readUInt16BE(21);
      case 6: return this.inodarr[ino].readUInt32BE(23);
      case 7: return this.inodarr[ino].readUInt32BE(27);
    }
  }
  setInod(ino, ind, val) {
    switch (ind) {
      case 0: return this.inodarr[ino].writeUInt8(val, 0);
      case 1: return this.inodarr[ino].writeUInt16BE(val, 1);
      case 2: return this.inodarr[ino].writeUIntBE(val, 3, 6);
      case 3: return this.inodarr[ino].writeUIntBE(val, 9, 6);
      case 4: return this.inodarr[ino].writeUIntBE(val, 15, 6);
      case 5: return this.inodarr[ino].writeUInt16BE(val, 21);
      case 6: return this.inodarr[ino].writeUInt32BE(val, 23);
      case 7: return this.inodarr[ino].writeUInt32BE(val, 27);
    }
  }
  incref(ino) {
    this.setInod(ino, 1, this.getInod(ino, 1) + 1);
  }
  decref(ino) {
    this.setInod(ino, 1, this.getInod(ino, 1) - 1);
    if (this.getInod(ino, 1) <= 0) this.fi.push(ino);
  }
  parseFolder(buf) {
    return buf.toString().split('\n').map(x => x.split(':'));
  }
  popfi(typ) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino;
    if (this.fi.length > 0) {
      ino = this.fi.splice(0, 1)[0];
    } else {
      this.inoarr.push(null);
      this.inodarr.push(null);
      ino = this.inoarr.length - 1;
    }
    let ctime = getcTime();
    this.inoarr[ino] = Buffer.alloc(0);
    this.inodarr[ino] = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    this.setInod(ino, 0, typ);
    this.setInod(ino, 2, ctime);
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
    return ino;
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
      if (this.getInod(ino, 0) == 12 && (symlink || parseInt(i) != patharr.length - 1)) {
        ino = this.getInode(normalize(this.inoarr[ino].toString(), patharr.slice(0, i).join('/')));
      } else if (this.getInod(ino, 0) != 4 && parseInt(i) != patharr.length - 1) {
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
    this.incref(ino);
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
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  exists(path) {
    return this.getInode(path) != null;
  }
  stat(path) {
    let ino = this.geteInode(path);
    return new fs.Stat(null, this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 5), this.getInod(ino, 1), this.getInod(ino, 6), this.getInod(ino, 7), null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.getInod(ino, 4), this.getInod(ino, 3), this.getInod(ino, 2), this.getInod(ino, 2));
  }
  lstat(path) {
    let ino = this.geteInode(path, false);
    return new fs.Stat(null, this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 5), this.getInod(ino, 1), this.getInod(ino, 6), this.getInod(ino, 7), null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.getInod(ino, 4), this.getInod(ino, 3), this.getInod(ino, 2), this.getInod(ino, 2));
  }
  chmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path);
    this.setInod(ino, 5, mode);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  lchmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    this.setInod(ino, 5, mode);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  chown(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    let uid = this.fs.uids.indexOf(user), gid = this.fs.gids.indexOf(group);
    if (uid < 0) throw new Error('nonexistent user');
    if (gid < 0) throw new Error('nonexistent group');
    let ino = this.geteInode(path);
    this.setInod(ino, 6, uid);
    this.setInod(ino, 7, gid);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  lchown(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    let uid = this.fs.uids.indexOf(user), gid = this.fs.gids.indexOf(group);
    if (uid < 0) throw new Error('nonexistent user');
    if (gid < 0) throw new Error('nonexistent group');
    let ino = this.geteInode(path, false);
    this.setInod(ino, 6, uid);
    this.setInod(ino, 7, gid);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  utimes(path, atime, mtime) {
    let ino = this.geteInode(path);
    this.setInod(ino, 4, Number(atime));
    this.setInod(ino, 3, Number(mtime));
  }
  readFile(path) {
    let ino = this.geteInode(path);
    if (this.writable) this.setInod(ino, 4, getcTime());
    return Buffer.from(this.inoarr[ino]);
  }
  writeFile(path, buf) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.getcInode(path, 10);
    this.inoarr[ino] = Buffer.from(buf);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  appendFile(path, buf) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (typeof buf == 'string') buf = Buffer.from(buf);
    let ino = this.getcInode(path, 10);
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
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
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
  }
  createReadStream(path) {
    let s = new datajs.s.BufReadStream(this.inoarr[this.geteInode(path)]);
    if (this.writable) this.setInod(ino, 4, getcTime());
    return s;
  }
  createWriteStream(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let s = new datajs.s.BufWriteStream(undefined, true);
    let ctime = getcTime();
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
    s.on('finish', function () {
      this.inoarr[this.getcInode(path, 10)] = s.ibuf;
      let ctime = getcTime();
      this.setInod(ino, 3, ctime);
      this.setInod(ino, 4, ctime);
    });
    return s;
  }
  link(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.incref(ino);
  }
  unlink(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inop = this.geteInode(parentPath(path));
    let ino = this.geteInode(path, false);
    let pf = this.parseFolder(this.inoarr[inop]);
    let delino = null;
    for (let i in pf) {
      if (pf[i] == ino) delino = i;
    }
    pf.splice(delino, 1);
    this.inoarr[inop] = Buffer.from(pf.map(x => x.join(':')).join('\n'));
    this.decref(ino);
    let ctime = getcTime();
    this.setInod(inop, 3, ctime);
    this.setInod(inop, 4, ctime);
  }
  copyFile(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inof = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    let inot = this.getcInode(patht, 10);
    this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    this.setInod(inof, 4, this.getInod(inot, 2));
  }
  readlink(path, options) {
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 0) != 12) throw new Error('path not a symbolic link');
    if (this.writable) this.setInod(ino, 4, getcTime());
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  symlink(target, path) {
    if (this.exists(path)) throw new Error('path already exists');
    let ino = this.getcInode(path, 12);
    this.inoarr[ino] = Buffer.from(target);
  }
  readdir(path) {
    let ino = this.geteInode(path);
    if (this.writable) this.setInod(ino, 4, getcTime());
    return this.parseFolder(this.inoarr[ino]).map(x => x[0]);
  }
  mkdir(path) {
    this.createFile(path, 4);
  }
  rename(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.unlink(pathf);
  }
  rmdir(path) {
    let ino = this.geteInode(path, false);
    let typ = this.getInod(ino, 0) == 12;
    if (typ == 10) throw new Error('cannot rmdir a file');
    if (typ == 12) {
      this.unlink(path);
      return;
    }
    let arr = this.parseFolder(this.inoarr[ino]);
    for (let i in arr) {
      let inof = parseInt(arr[i][1]);
      let inot = this.getInod(inof, 0);
      if (inot == 4) {
        this.rmdir(path + '/' + arr[i][0]);
      } else {
        this.unlink(path + '/' + arr[i][0]);
      }
    }
    this.unlink(path);
  }
}
module.exports = {FileSystem, init};