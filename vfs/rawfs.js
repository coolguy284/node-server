// jshint -W041
let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystem {
  constructor(opts) {
    if (typeof opts == 'string') {
      this.importSystem(opts);
      return;
    } else if (typeof opts == 'boolean') {
      opts = {writable:opts};
    }
    if (opts === undefined) opts = {};
    if (opts.writable === undefined) opts.writable = false;
    if (opts.inoarr === undefined) opts.inoarr = [Buffer.alloc(0)];
    if (opts.inodarr === undefined) {
      let ctime = getcTime();
      //opts.inodarr = [['d', 0, 1, ctime, ctime, ctime, 0o777, 'root', 'root']];
      /* fs flags:
      i immutable
      a appendonly
      s secure delete
      S system
      A noatime
      */
      opts.inodarr = [Buffer.from([
        0x04, // file type: 4 - directory, 10 - file, 12 - symlink
        0x00, // fs flags: iasSA---
        0x00, 0x01, // refrence count
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // create time
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // modify time
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // access time
        0x01, 0xff, // permissions
        0x00, 0x00, 0x00, 0x00, // uid
        0x00, 0x00, 0x00, 0x00 // gid
      ])];
      opts.inodarr[0].writeUIntBE(ctime, 4, 6);
      opts.inodarr[0].writeUIntBE(ctime, 10, 6);
      opts.inodarr[0].writeUIntBE(ctime, 16, 6);
    }
    if (opts.fi === undefined) opts.fi = [];
    this.writable = opts.writable;
    this.inoarr = opts.inoarr;
    this.inodarr = opts.inodarr;
    this.fi = opts.fi;
  }
  getInod(ino, ind) {
    switch (ind) {
      case 0: return this.inodarr[ino].readUInt8(0);
      case 1: return this.inodarr[ino].readUInt8(1);
      case 2: return this.inodarr[ino].readUInt16BE(2);
      case 3: return this.inodarr[ino].readUIntBE(4, 6);
      case 4: return this.inodarr[ino].readUIntBE(10, 6);
      case 5: return this.inodarr[ino].readUIntBE(16, 6);
      case 6: return this.inodarr[ino].readUInt16BE(22);
      case 7: return this.inodarr[ino].readUInt32BE(24);
      case 8: return this.inodarr[ino].readUInt32BE(28);
    }
  }
  setInod(ino, ind, val) {
    switch (ind) {
      case 0: return this.inodarr[ino].writeUInt8(val, 0);
      case 1: return this.inodarr[ino].writeUInt8(val, 1);
      case 2: return this.inodarr[ino].writeUInt16BE(val, 2);
      case 3: return this.inodarr[ino].writeUIntBE(val, 4, 6);
      case 4: return this.inodarr[ino].writeUIntBE(val, 10, 6);
      case 5: return this.inodarr[ino].writeUIntBE(val, 16, 6);
      case 6: return this.inodarr[ino].writeUInt16BE(val, 22);
      case 7: return this.inodarr[ino].writeUInt32BE(val, 24);
      case 8: return this.inodarr[ino].writeUInt32BE(val, 28);
    }
  }
  incref(ino) {
    this.setInod(ino, 2, this.getInod(ino, 2) + 1);
  }
  decref(ino) {
    this.setInod(ino, 2, this.getInod(ino, 2) - 1);
    if (this.getInod(ino, 2) <= 0) this.fi.push(ino);
  }
  parseFolder(buf, encoding) {
    let foldarr = buf.toString(encoding).split('\n');
    if (foldarr.length == 1 && foldarr[0] == '') foldarr.pop();
    foldarr = foldarr.map(x => x.split(':'));
    if (encoding == 'buffer') for (var i in foldarr) foldarr[i][0] = Buffer.from(foldarr[i][0]);
    for (var i in foldarr) foldarr[i][1] = parseInt(foldarr[i][1]);
    return foldarr;
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
    this.inodarr[ino] = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    this.setInod(ino, 0, typ);
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
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
      let cp = normalize(patharr.slice(0, parseInt(i) + 1).join('/'));
      let fc = this.parseFolder(this.inoarr[ino]);
      let nino = null;
      for (let j in fc) {
        if (fc[j][0] == patharr[i]) {
          nino = fc[j][1];
          break;
        }
      }
      if (nino != null) {
        ino = nino;
      } else {
        return null;
      }
      if (this.getInod(ino, 0) == 10 && (symlink || parseInt(i) != patharr.length - 1)) {
        ino = this.getInode(normalize(this.inoarr[ino].toString(), parentPath(cp)));
      } else if (this.getInod(ino, 0) != 4 && parseInt(i) != patharr.length - 1) {
        throw new Error(cp + ' not a directory');
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
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.exists(path)) throw new Error('path already exists');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new Error('parent folder immutable');
    let ino = this.popfi(typ);
    this.appendFolder(inop, pathEnd(path), ino);
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
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  exists(path) {
    return this.getInode(path) != null;
  }
  stat(path, options) {
    let ino = this.geteInode(path);
    if (options && options.bigint) {
      return new fs.Stats(null, BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), BigInt(this.getInod(ino, 2)), BigInt(this.getInod(ino, 7)), BigInt(this.getInod(ino, 8)), null, BigInt(1), BigInt(ino), BigInt(this.inoarr[ino].length), BigInt(this.inoarr[ino].length), BigInt(this.getInod(ino, 5)), BigInt(this.getInod(ino, 4)), BigInt(this.getInod(ino, 3)), BigInt(this.getInod(ino, 3)));
    } else {
      return new fs.Stats(null, this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), this.getInod(ino, 2), this.getInod(ino, 7), this.getInod(ino, 8), null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.getInod(ino, 5), this.getInod(ino, 4), this.getInod(ino, 3), this.getInod(ino, 3));
    }
  }
  lstat(path, options) {
    let ino = this.geteInode(path, false);
    if (options && options.bigint) {
      return new fs.Stats(null, BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), BigInt(this.getInod(ino, 2)), BigInt(this.getInod(ino, 7)), BigInt(this.getInod(ino, 8)), null, BigInt(1), BigInt(ino), BigInt(this.inoarr[ino].length), BigInt(this.inoarr[ino].length), BigInt(this.getInod(ino, 5)), BigInt(this.getInod(ino, 4)), BigInt(this.getInod(ino, 3)), BigInt(this.getInod(ino, 3)));
    } else {
      return new fs.Stats(null, this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), this.getInod(ino, 2), this.getInod(ino, 7), this.getInod(ino, 8), null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.getInod(ino, 5), this.getInod(ino, 4), this.getInod(ino, 3), this.getInod(ino, 3));
    }
  }
  statFD(ino, options) {
    if (options && options.bigint) {
      return new fs.Stats(null, BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), BigInt(this.getInod(ino, 2)), BigInt(this.getInod(ino, 7)), BigInt(this.getInod(ino, 8)), null, BigInt(1), BigInt(ino), BigInt(this.inoarr[ino].length), BigInt(this.inoarr[ino].length), BigInt(this.getInod(ino, 5)), BigInt(this.getInod(ino, 4)), BigInt(this.getInod(ino, 3)), BigInt(this.getInod(ino, 3)));
    } else {
      return new fs.Stats(null, this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), this.getInod(ino, 2), this.getInod(ino, 7), this.getInod(ino, 8), null, 1, ino, this.inoarr[ino].length, this.inoarr[ino].length, this.getInod(ino, 5), this.getInod(ino, 4), this.getInod(ino, 3), this.getInod(ino, 3));
    }
  }
  chmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  lchmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chmodFD(ino, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chown(path, uid, gid) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  lchown(path, uid, gid) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chownFD(ino, uid, gid) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chattr(path, attrb) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (attrb < 0 && attrb > 255) throw new Error('invalid file attributes');
    let ino = this.geteInode(path);
    this.setInod(ino, 1, attrb);
  }
  lchattr(path, attrb) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (attrb < 0 && attrb > 255) throw new Error('invalid file attributes');
    let ino = this.geteInode(path, false);
    this.setInod(ino, 1, attrb);
  }
  utimes(path, atime, mtime) {
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 5, Number(atime));
    this.setInod(ino, 4, Number(mtime));
  }
  utimesFD(ino, atime, mtime) {
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.setInod(ino, 5, Number(atime));
    this.setInod(ino, 4, Number(mtime));
  }
  readFile(path, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = null;
    let ino = this.geteInode(path);
    if (this.writable) this.setInod(ino, 5, getcTime());
    if (options.encoding === null) return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  readFileFD(ino, sp, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = null;
    if (this.writable) this.setInod(ino, 5, getcTime());
    if (options.encoding === null) return Buffer.from(this.inoarr[ino].slice(sp, Infinity));
    else return this.inoarr[ino].slice(sp, Infinity).toString(options.encoding);
  }
  writeFile(path, buf, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.getcInode(path, 8);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.inoarr[ino] = Buffer.from(buf, options.encoding);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  writeFileFD(ino, sp, buf, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    buf = Buffer.from(buf, options.encoding);
    if (buf.length + sp < this.inoarr[ino].length) {
      buf.copy(this.inoarr[ino], sp);
    } else {
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buf]);
    }
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  appendFile(path, buf, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (!this.writable) throw new Error('read-only filesystem');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    let ino = this.getcInode(path, 8);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  appendFileFD(ino, sp, buf, options) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (!this.writable) throw new Error('read-only filesystem');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  truncate(path, len) {
    if (len === undefined) len = 0;
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
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
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  truncateFD(ino, len) {
    if (len === undefined) len = 0;
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
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
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  createReadStream(path) {
    let ino = this.geteInode(path);
    let s = new datajs.s.BufReadStream(this.inoarr[ino]);
    if (this.writable) this.setInod(ino, 5, getcTime());
    return s;
  }
  createWriteStream(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.getcInode(path, 8);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    let s = new datajs.s.BufWriteStream(undefined, true);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    s.on('finish', function () {
      this.inoarr[ino] = s.ibuf;
      let ctime = getcTime();
      this.setInod(ino, 4, ctime);
      this.setInod(ino, 5, ctime);
    });
    return s;
  }
  link(pathf, patht, nincref) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf, false);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    if (!nincref) this.incref(ino);
  }
  unlink(path, ndecref) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new Error('parent folder immutable');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    let pf = this.parseFolder(this.inoarr[inop]);
    let delino = null, pathlast = path.split('/').slice(-1)[0];
    for (let i in pf) if (pf[i][0] == pathlast && pf[i][1] == ino) delino = i;
    pf.splice(delino, 1);
    this.inoarr[inop] = Buffer.from(pf.map(x => x.join(':')).join('\n'));
    if (!ndecref) this.decref(ino);
    let ctime = getcTime();
    this.setInod(inop, 4, ctime);
    this.setInod(inop, 5, ctime);
  }
  copyFile(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inof = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    let inot = this.getcInode(patht, 8);
    this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    this.setInod(inof, 5, this.getInod(inot, 3));
  }
  readlink(path, options) {
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 0) != 10) throw new Error('path not a symbolic link');
    if (this.writable) this.setInod(ino, 5, getcTime());
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  symlink(target, path) {
    if (this.exists(path)) throw new Error('path already exists');
    let ino = this.getcInode(path, 10);
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    this.inoarr[ino] = Buffer.from(target);
  }
  readdir(path, options) {
    if (options === undefined) options = {};
    if (options.encoding) options.encoding = 'utf8';
    if (options.withFileTypes === undefined) options.withFileTypes = false;
    let ino = this.geteInode(path);
    let pf = this.parseFolder(this.inoarr[ino], options.encoding);
    if (this.writable) this.setInod(ino, 5, getcTime());
    if (options.withFileTypes) {
      return pf.map(x => fs.Dirent(x[0], this.getInod(x[1], 0)));
    } else {
      return pf.map(x => x[0]);
    }
  }
  mkdir(path) {
    this.createFile(path, 4);
  }
  rename(pathf, patht) {
    this.link(pathf, patht, true);
    this.unlink(pathf, true);
  }
  rmdir(path, inl) {
    if (inl === undefined) inl = [];
    let ino = this.geteInode(path, false);
    let typ = this.getInod(ino, 0);
    if (typ == 8) throw new Error('cannot rmdir a file');
    if (typ == 10) {
      this.unlink(path);
      return;
    }
    let arr = this.parseFolder(this.inoarr[ino]);
    for (let i in arr) {
      let inof = arr[i][1];
      let inot = this.getInod(inof, 0);
      if (inot == 4 && inl.indexOf(inof) < 0) {
        inl.push(inof);
        this.rmdir(path + '/' + arr[i][0], inl);
      } else {
        this.unlink(path + '/' + arr[i][0]);
      }
    }
    this.unlink(path);
  }
  read(ino, sp, buffer, offset, length, position) {
    if (offset + length > buffer.length) throw new Error('buffer too short');
    if (typeof position == 'number' && position < 0) throw new Error('invalid position');
    if (position == null) {
      if (sp + length > this.inoarr[ino].length) throw new Error('cannot read beyond end of file');
      this.inoarr[ino].copy(buffer, offset, sp, sp + length);
    } else {
      if (position + length > this.inoarr[ino].length) throw new Error('cannot read beyond end of file');
      this.inoarr[ino].copy(buffer, offset, position, position + length);
    }
    if (this.writable) this.setInod(ino, 5, getcTime());
    return [length, buffer];
  }
  write(ino, sp, buffer, offset, length, position) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    if (offset + length > buffer.length) throw new Error('buffer too short');
    if (typeof position == 'number' && position < 0) throw new Error('invalid position');
    if (position == null) {
      if (sp + length > this.inoarr[ino].length) throw new Error('cannot write beyond end of file');
      buffer.copy(this.inoarr[ino], sp, offset, offset + length);
    } else {
      if (position + length > this.inoarr[ino].length) throw new Error('cannot write beyond end of file');
      buffer.copy(this.inoarr[ino], position, offset, offset + length);
    }
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    return [length, buffer];
  }
  writeStr(ino, sp, string, position, encoding) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.getInod(ino, 1) & 128) throw new Error('file immutable');
    if (typeof position == 'number' && position < 0) throw new Error('invalid position');
    let buf = Buffer.from(string, encoding);
    if (position == null) {
      if (sp + buf.length > this.inoarr[ino].length) throw new Error('cannot write beyond end of file');
      buffer.copy(this.inoarr[ino], sp);
    } else {
      if (position + buf.length > this.inoarr[ino].length) throw new Error('cannot write beyond end of file');
      buffer.copy(this.inoarr[ino], position);
    }
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    return [buf.length, string];
  }
  reverseLookup(ino, symlink, inos, path, inods, lkp) {
    if (symlink === undefined) symlink = false;
    if (inos === undefined) inos = 0;
    if (path === undefined) path = '/';
    if (inods === undefined) inods = [0];
    if (lkp === undefined) lkp = [];
    if (symlink) {
      try {
        if (inos == ino) return [path];
        let fc = this.parseFolder(this.inoarr[inos]);
        for (var i in fc) {
          if (inods.indexOf(fc[i][1]) > -1) continue;
          if (fc[i][1] == ino) {
            lkp.push(path + fc[i][0]);
          } else {
            if (this.getInod(ino, 0) == 10) ino = this.geteInode(normalize(this.inoarr[ino].toString(), path));
            this.reverseLookup(ino, symlink, fc[i][1], path + fc[i][0] + '/', [...inods, fc[i][1]], lkp);
          }
        }
      } catch (e) {}
    } else {
      try {
        if (inos == ino) return [path];
        let fc = this.parseFolder(this.inoarr[inos]);
        for (var i in fc) {
          //if (inods.indexOf(fc[i][1]) > -1) continue;
          if (fc[i][1] == ino) {
            lkp.push(path + fc[i][0]);
          } else {
            this.reverseLookup(ino, symlink, fc[i][1], path + fc[i][0] + '/', [...inods, fc[i][1]], lkp);
          }
        }
      } catch (e) {}
    }
    return lkp;
  }
  lookupAll() {
    let arr = [];
    for (var i = 0; i < this.inoarr.length; i++) {
      if (this.fi.indexOf(i) > -1) continue;
      arr.push(this.reverseLookup(i));
    }
    return arr;
  }
  exportSystemRaw() {
    let arr = [this.writable, [], [], []];
    for (var i = 0; i < this.inoarr.length; i++) arr[1].push(this.inoarr[i].toString('binary'));
    for (var i = 0; i < this.inodarr.length; i++) arr[2].push(this.inodarr[i].toString('binary'));
    for (var i = 0; i < this.fi.length; i++) arr[3].push(this.fi[i]);
    return arr;
  }
  exportSystem() {
    return JSON.stringify(this.exportSystemRaw());
  }
  importSystemRaw(arr) {
    this.writable = arr[0];
    this.inoarr.splice(0, Infinity);
    this.inodarr.splice(0, Infinity);
    this.fi.splice(0, Infinity);
    for (var i = 0; i < arr[1].length; i++) this.inoarr.push(Buffer.from(arr[1][i], 'binary'));
    for (var i = 0; i < arr[2].length; i++) this.inodarr.push(Buffer.from(arr[2][i], 'binary'));
    for (var i = 0; i < arr[3].length; i++) this.fi.push(arr[3][i]);
  }
  importSystem(str) {
    this.importSystemRaw(JSON.parse(str));
  }
}
module.exports = {FileSystem, init};