// jshint -W041
var fs = require('fs');
let { getcTime, parentPath, pathEnd, normalize } = require('./helperf.js');
let { ReadOnlyFSError, OSFSError } = require('./errors.js');
let BLKSIZE = 4096;

class FileSystem {
  constructor(opts) {
    if (typeof opts == 'string') {
      this.importSystemString(opts);
      return;
    } else if (typeof opts == 'boolean') {
      opts = {writable:opts};
    } else if (opts instanceof Buffer) {
      this.importSystem(opts);
      return;
    }
    if (opts === undefined) opts = {};
    if (opts.writable === undefined) opts.writable = true;
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
    this.inodarr = opts.inodarr;
    this.inoarr = opts.inoarr;
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

  popfi(typ, mode, uid, gid) {
    if (mode === undefined) mode = 0o777;
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (!this.writable) throw new OSFSError('EROFS');
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
    this.inodarr[ino] = Buffer.alloc(32);
    this.setInod(ino, 0, typ);
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    this.setInod(ino, 6, mode);
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
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
        throw new OSFSError('ENOTDIR', cp);
      }
    }
    return ino;
  }
  geteInode(path, symlink) {
    let rv = this.getInode(path, symlink);
    if (rv === null) {
      throw new OSFSError('ENOENT', path);
    }
    return rv;
  }
  createFile(path, typ, mode, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.exists(path)) throw new OSFSError('EEXIST');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.popfi(typ, mode, uid, gid);
    this.appendFolder(inop, pathEnd(path), ino);
    this.incref(ino);
    return ino;
  }
  getcInode(path, typ, symlink, mode, uid, gid) {
    let ino = this.getInode(path, symlink);
    if (ino === null) {
      return this.createFile(path, typ, mode, uid, gid);
    } else {
      return ino;
    }
  }
  appendFolder(ino, nam, inot) {
    if (!this.writable) throw new OSFSError('EROFS');
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
      return new fs.Stats(
        50, // dev
        BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), // mode
        BigInt(this.getInod(ino, 2)), // nlink
        BigInt(this.getInod(ino, 7)), // uid
        BigInt(this.getInod(ino, 8)), // gid
        0, // rdev
        BigInt(BLKSIZE), // blksize
        BigInt(ino), // ino
        BigInt(this.inoarr[ino].length), // size
        BigInt(Math.ceil(this.inoarr[ino].length / BLKSIZE)), // blocks
        BigInt(this.getInod(ino, 5)), // atim_msec
        BigInt(this.getInod(ino, 4)), // mtim_msec
        BigInt(this.getInod(ino, 3)), // ctim_msec
        BigInt(this.getInod(ino, 3)) // birthtim_msec
      );
    } else {
      return new fs.Stats(
        50, // dev
        this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), // mode
        this.getInod(ino, 2), // nlink
        this.getInod(ino, 7), // uid
        this.getInod(ino, 8), // gid
        0, // rdev
        BLKSIZE, // blksize
        ino, // ino
        this.inoarr[ino].length, // size
        Math.ceil(this.inoarr[ino].length / BLKSIZE), // blocks
        this.getInod(ino, 5), // atim_msec
        this.getInod(ino, 4), // mtim_msec
        this.getInod(ino, 3), // ctim_msec
        this.getInod(ino, 3) // birthtim_msec
      );
    }
  }
  lstat(path, options) {
    let ino = this.geteInode(path, false);
    if (options && options.bigint) {
      return new fs.Stats(
        50, // dev
        BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), // mode
        BigInt(this.getInod(ino, 2)), // nlink
        BigInt(this.getInod(ino, 7)), // uid
        BigInt(this.getInod(ino, 8)), // gid
        0, // rdev
        BigInt(BLKSIZE), // blksize
        BigInt(ino), // ino
        BigInt(this.inoarr[ino].length), // size
        BigInt(Math.ceil(this.inoarr[ino].length / BLKSIZE)), // blocks
        BigInt(this.getInod(ino, 5)), // atim_msec
        BigInt(this.getInod(ino, 4)), // mtim_msec
        BigInt(this.getInod(ino, 3)), // ctim_msec
        BigInt(this.getInod(ino, 3)) // birthtim_msec
      );
    } else {
      return new fs.Stats(
        50, // dev
        this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), // mode
        this.getInod(ino, 2), // nlink
        this.getInod(ino, 7), // uid
        this.getInod(ino, 8), // gid
        0, // rdev
        BLKSIZE, // blksize
        ino, // ino
        this.inoarr[ino].length, // size
        Math.ceil(this.inoarr[ino].length / BLKSIZE), // blocks
        this.getInod(ino, 5), // atim_msec
        this.getInod(ino, 4), // mtim_msec
        this.getInod(ino, 3), // ctim_msec
        this.getInod(ino, 3) // birthtim_msec
      );
    }
  }
  statFD(ino, options) {
    if (options && options.bigint) {
      return new fs.Stats(
        50, // dev
        BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), // mode
        BigInt(this.getInod(ino, 2)), // nlink
        BigInt(this.getInod(ino, 7)), // uid
        BigInt(this.getInod(ino, 8)), // gid
        0, // rdev
        BigInt(BLKSIZE), // blksize
        BigInt(ino), // ino
        BigInt(this.inoarr[ino].length), // size
        BigInt(Math.ceil(this.inoarr[ino].length / BLKSIZE)), // blocks
        BigInt(this.getInod(ino, 5)), // atim_msec
        BigInt(this.getInod(ino, 4)), // mtim_msec
        BigInt(this.getInod(ino, 3)), // ctim_msec
        BigInt(this.getInod(ino, 3)) // birthtim_msec
      );
    } else {
      return new fs.Stats(
        50, // dev
        this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), // mode
        this.getInod(ino, 2), // nlink
        this.getInod(ino, 7), // uid
        this.getInod(ino, 8), // gid
        0, // rdev
        BLKSIZE, // blksize
        ino, // ino
        this.inoarr[ino].length, // size
        Math.ceil(this.inoarr[ino].length / BLKSIZE), // blocks
        this.getInod(ino, 5), // atim_msec
        this.getInod(ino, 4), // mtim_msec
        this.getInod(ino, 3), // ctim_msec
        this.getInod(ino, 3) // birthtim_msec
      );
    }
  }

  chmod(path, mode) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  lchmod(path, mode) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chmodFD(ino, mode) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 6, mode);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chown(path, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  lchown(path, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chownFD(ino, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  chattr(path, attrb) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (attrb < 0 && attrb > 255) throw new OSFSError('EINVAL', 'invalid file attributes');
    let ino = this.geteInode(path);
    this.setInod(ino, 1, attrb);
  }
  lchattr(path, attrb) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (attrb < 0 && attrb > 255) throw new OSFSError('EINVAL', 'invalid file attributes');
    let ino = this.geteInode(path, false);
    this.setInod(ino, 1, attrb);
  }
  utimes(path, atime, mtime) {
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 5, Number(atime));
    this.setInod(ino, 4, Number(mtime));
  }
  utimesFD(ino, atime, mtime) {
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
  writeFile(path, buf, options, uid, gid) {
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.getcInode(path, 8, true, options.mode, uid, gid);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    let ino = this.getcInode(path, 8, true, options.mode, uid, gid);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
    if (!this.writable) throw new OSFSError('EROFS');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
  }
  truncate(path, len) {
    if (len === undefined) len = 0;
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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

  link(pathf, patht, nincref) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(pathf, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (this.exists(patht)) throw new OSFSError('EEXIST');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    if (!nincref) this.incref(ino);
  }
  unlink(path, ndecref) {
    if (!this.writable) throw new OSFSError('EROFS');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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

  copyFile(pathf, patht, flags, uid, gid) {
    flags = Number(flags);
    if (flags != flags) throw new OSFSError('EINVAL', 'Bad flag value');
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (flags & 4) throw new Error('No COW support');
    if (!this.writable) throw new OSFSError('EROFS');
    let inof = this.geteInode(pathf);
    if (this.exists(patht)) {
      if (flags & 1) throw new OSFSError('EEXIST');
      else this.unlink(patht);
    }
    let inot = this.getcInode(patht, 8, true, this.getInod(inof, 6), uid, gid);
    this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    this.setInod(inof, 5, this.getInod(inot, 3));
  }

  readlink(path, options) {
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 0) != 10) throw new OSFSError('EINVAL', 'path not a symbolic link');
    if (this.writable) this.setInod(ino, 5, getcTime());
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  symlink(target, path, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.exists(path)) throw new OSFSError('EEXIST');
    let ino = this.getcInode(path, 10, true, 0o666, uid, gid);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
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
      return pf.map(x => {
        let rtyp = this.getInod(x[1], 0), typ;
        switch (rtyp) {
          case 4: typ = 1; break;
          case 8: typ = 2; break;
          case 10: typ = 3; break;
        }
        return new fs.Dirent(x[0], typ);
      });
    } else {
      return pf.map(x => x[0]);
    }
  }

  mkdir(path, options, mode, uid, gid) {
    if (options === undefined) options = {};
    if (options.mode === undefined) options.mode = 0o666;
    this.createFile(path, 4, options.mode, uid, gid);
  }

  rename(pathf, patht) {
    this.link(pathf, patht, true);
    this.unlink(pathf, true);
  }

  rmdir(path, inl) {
    if (inl === undefined) inl = [];
    let ino = this.geteInode(path, false);
    let typ = this.getInod(ino, 0);
    if (typ == 8) throw new OSFSError('ENOTDIR', 'cannot rmdir a file');
    if (typ == 10) {
      this.unlink(path);
      return;
    }
    let arr = this.parseFolder(this.inoarr[ino]);
    for (let i in arr) {
      let inof = arr[i][1];
      let inot = this.getInod(inof, 0);
      let refcnt = this.getInod(inof, 1);
      if (refcnt > 1 && refcnt > this.internalLinks(inof)) {
        this.unlink(path + '/' + arr[i][0]);
      } else {
        if (inot == 4 && inl.indexOf(inof) < 0) {
          inl.push(inof);
          this.rmdir(path + '/' + arr[i][0], inl);
        } else {
          this.unlink(path + '/' + arr[i][0]);
        }
      }
    }
    this.unlink(path);
  }

  read(ino, sp, buffer, offset, length, position) {
    if (offset === undefined) offset = 0;
    if (length === undefined) length = buffer.length;
    if (offset + length > buffer.length) throw new OSFSError('EINVAL', 'buffer too short');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    if (position == null) {
      if (sp + length > this.inoarr[ino].length) {
        this.inoarr[ino].copy(buffer, offset, sp);
        length = this.inoarr[ino].length - sp;
      } else this.inoarr[ino].copy(buffer, offset, sp, sp + length);
    } else {
      if (position + length > this.inoarr[ino].length) {
        this.inoarr[ino].copy(buffer, offset, position);
        length = this.inoarr[ino].length - position;
      } else this.inoarr[ino].copy(buffer, offset, position, position + length);
    }
    if (this.writable) this.setInod(ino, 5, getcTime());
    return length;
  }
  write(ino, sp, buffer, offset, length, position) {
    if (offset === undefined) offset = 0;
    if (length === undefined) length = buffer.length;
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (offset + length > buffer.length) throw new OSFSError('EINVAL', 'buffer too short');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    if (position == null) {
      if (sp + length > this.inoarr[ino].length) {
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buffer.slice(offset, offset + length)]);
      } else buffer.copy(this.inoarr[ino], sp, offset, offset + length);
    } else {
      if (position + length > this.inoarr[ino].length) {
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, position), buffer.slice(offset, offset + length)]);
      } else buffer.copy(this.inoarr[ino], position, offset, offset + length);
    }
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    return length;
  }
  writeStr(ino, sp, string, position, encoding) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    let buf = Buffer.from(string, encoding);
    if (position == null) {
      if (sp + buf.length > this.inoarr[ino].length) {
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buffer]);
      } else buffer.copy(this.inoarr[ino], sp);
    } else {
      if (position + buf.length > this.inoarr[ino].length) {
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, position), buffer]);
      } else buffer.copy(this.inoarr[ino], position);
    }
    let ctime = getcTime();
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    return buf.length;
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
          if (inods.indexOf(fc[i][1]) > -1) continue;
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

  lookupAll(symlink) {
    let arr = [];
    for (var i = 0; i < this.inoarr.length; i++) {
      if (this.fi.indexOf(i) > -1) continue;
      arr.push(this.reverseLookup(i, symlink));
    }
    return arr;
  }

  internalLinks(ino, aino, inos) {
    if (aino === undefined) aino = ino;
    if (inos === undefined) inos = [];
    let cnt = 0;
    let fc = this.parseFolder(this.inoarr[aino]);
    for (var i in fc) {
      if (inos.indexOf(fc[i][1]) > -1) continue;
      inos.push(fc[i][1]);
      if (this.getInod(fc[i][1], 0) != 4) continue;
      if (fc[i][1] == ino) cnt++;
      else cnt += this.internalLinks(ino, fc[i][1], inos);
    }
    return cnt;
  }

  wipefi() {
    if (!this.writable) throw new OSFSError('EROFS');
    for (var i in this.fi) {
      delete this.inoarr[this.fi[i]];
      delete this.inodarr[this.fi[i]];
    }
    this.fi.splice(0, Infinity);
  }

  exportSystemRawString() {
    let arr = [this.writable, [], [], []];
    for (var i = 0; i < this.inodarr.length; i++) arr[1].push(this.inodarr[i] !== undefined ? this.inodarr[i].toString('binary') : undefined);
    for (var i = 0; i < this.inoarr.length; i++) arr[2].push(this.inoarr[i] !== undefined ? this.inoarr[i].toString('binary') : undefined);
    for (var i = 0; i < this.fi.length; i++) arr[3].push(this.fi[i]);
    return arr;
  }
  exportSystemString() {
    return JSON.stringify(this.exportSystemRawString());
  }
  importSystemRawString(arr) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    this.writable = arr[0];
    if (this.inodarr) this.inodarr.splice(0, Infinity);
    else this.inodarr = [];
    if (this.inoarr) this.inoarr.splice(0, Infinity);
    else this.inoarr = [];
    if (this.fi) this.fi.splice(0, Infinity);
    else this.fi = [];
    for (var i = 0; i < arr[1].length; i++) this.inodarr.push(arr[1][i] != null ? Buffer.from(arr[1][i], 'binary') : undefined);
    for (var i = 0; i < arr[2].length; i++) this.inoarr.push(arr[2][i] != null ? Buffer.from(arr[2][i], 'binary') : undefined);
    for (var i = 0; i < arr[3].length; i++) this.fi.push(arr[3][i]);
  }
  importSystemString(str) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    this.importSystemRawString(JSON.parse(str));
  }
  exportSystemSize() {
    let v = 13;
    for (let i = 0; i < this.inodarr.length; i++) v += this.inodarr[i] != null ? 32 : 1;
    for (let i = 0; i < this.inoarr.length; i++) v += this.inoarr[i] != null ? 4 + this.inoarr[i].length : 4;
    v += this.fi.length * 4;
    return v;
  }
  exportSystem() {
    let head = Buffer.alloc(13);
    let inodbufs = [];
    for (let i = 0; i < this.inodarr.length; i++) {
      let buf;
      if (this.inodarr[i] != null) buf = this.inodarr[i];
      else {
        buf = Buffer.alloc(1);
        buf.writeUInt8(255, 0);
      }
      inodbufs.push(buf);
    }
    let inodbuf = Buffer.concat(inodbufs);
    inodbufs.slice(0, Infinity);
    let inobufs = [];
    for (let i = 0; i < this.inoarr.length; i++) {
      let head = Buffer.alloc(4);
      if (this.inoarr[i] != null) {
        head.writeUInt32BE(this.inoarr[i].length, 0);
        inobufs.push(head);
        if (this.inoarr[i].length > 0) inobufs.push(this.inoarr[i]);
      } else {
        head.writeUInt32BE(0xffffffff, 0);
        inobufs.push(head);
      }
    }
    let inobuf = Buffer.concat(inobufs);
    inobufs.slice(0, Infinity);
    let fibuf = Buffer.alloc(this.fi.length * 4);
    for (let i = 0; i < this.fi.length; i++) {
      fibuf.writeUInt32BE(this.fi[i], i * 4);
    }
    head.writeUInt8(this.writable ? 128 : 0, 0);
    head.writeUInt32BE(inodbuf.length, 1);
    head.writeUInt32BE(inobuf.length, 5);
    head.writeUInt32BE(fibuf.length, 9);
    return Buffer.concat([
      head,
      inodbuf,
      inobuf,
      fibuf
    ]);
  }
  importSystem(buf) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    let head = buf.slice(0, 13);
    let flags = head.readUInt8(0);
    if (flags & 128) this.writable = true;
    else this.writable = false;
    if (this.inodarr) this.inodarr.splice(0, Infinity);
    else this.inodarr = [];
    if (this.inoarr) this.inoarr.splice(0, Infinity);
    else this.inoarr = [];
    if (this.fi) this.fi.splice(0, Infinity);
    else this.fi = [];
    let inodlen = head.readUInt32BE(1);
    for (let i = 0, ind = 0; i < inodlen; i++, ind++) {
      if (buf.readUInt8(13 + i) != 255) {
        this.inodarr[ind] = buf.slice(13 + i, 13 + i + 32);
        i += 31;
      }
    }
    let inolen = head.readUInt32BE(5);
    for (let i = 0, ind = 0; i < inolen; i += 4, ind++) {
      let len = buf.readUInt32BE(13 + inodlen + i);
      if (len != 0xffffffff) {
        this.inoarr[ind] = buf.slice(17 + inodlen + i, 17 + inodlen + i + len);
        i += len;
      }
    }
    let filen = head.readUInt32BE(9);
    for (let i = 0; i < filen; i += 4) {
      this.fi.push(buf.readUInt32BE(13 + inodlen + inolen + i));
    }
  }
}

module.exports = { FileSystem };