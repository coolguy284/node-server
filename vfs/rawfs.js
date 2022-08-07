// jshint -W041
let fs = require('fs');
let { getcTime, pathSplit, pathJoin, parentPath, pathEnd, normalize, fnbufencode, fnbufdecode, major: majorf, minor : minorf, makedev } = require('./helperf.js');
let { ReadOnlyFSError, OSFSError } = require('./errors.js');
let { VFSImportRFSStream, VFSExportRFSStream } = require('./s.js');
let INODSIZE = 32;

let { inspect } = require('util');

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
    if (opts.blocksize === undefined) opts.blocksize = 4096;
    if (opts.maxsize === undefined) opts.maxsize = 2 ** 32;
    if (opts.maxinodes === undefined) opts.maxinodes = 2 ** 24;
    if (opts.wipeonfi === undefined) opts.wipeonfi = false;
    if (opts.updatime === undefined) opts.updatime = false;
    if (opts.archive === undefined) opts.archive = false;
    if (opts.allowinoacc === undefined) opts.allowinoacc = false;
    if (opts.inoarr === undefined) opts.inoarr = [Buffer.alloc(0)];
    if (opts.inodarr === undefined) {
      let ctime = getcTime();
      //opts.inodarr = [['d', 0, 1, ctime, ctime, ctime, 0o777, 'root', 'root']];
      /*
      file types:
       1 - fifo
       2 - character device
       4 - directory
       6 - block device
      10 - file
      12 - symlink
      14 - socket
      fs flags:
      i immutable
      a appendonly
      s secure delete
      S system
      A noatime
      */
      opts.inodarr = [Buffer.from([
        0x04, // file type
        0x00, // fs flags: iasSA---
        0x00, 0x01, // reference count
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // access time
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // modify time
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // change time
        //0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // birth time
        0x01, 0xff, // permissions
        0x00, 0x00, 0x00, 0x00, // uid
        0x00, 0x00, 0x00, 0x00, // gid
      ])];
      opts.inodarr[0].writeUIntBE(ctime, 4, 6);
      opts.inodarr[0].writeUIntBE(ctime, 10, 6);
      opts.inodarr[0].writeUIntBE(ctime, 16, 6);
    }
    if (opts.fi === undefined) opts.fi = [];
    this.writable = opts.writable;
    this.blocksize = opts.blocksize;
    this.maxsize = opts.maxsize;
    this.maxinodes = opts.maxinodes;
    this.wipeonfi = opts.wipeonfi;
    this.archive = opts.archive;
    this.allowinoacc = opts.allowinoacc;
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
    let refcnt = this.getInod(ino, 2);
    this.setInod(ino, 2, Math.max(refcnt - 1, 0));
    if (refcnt <= 1) {
      if (this.wipeonfi || this.getInod(ino, 1) & 32) {
        delete this.inodarr[ino];
        delete this.inoarr[ino];
      } else this.fi.push(ino);
    }
  }

  parseFolder(buf, encoding) {
    if (encoding === undefined) encoding = 'utf8';
    let foldarr = [];
    for (let i = 0, s = 0; i < buf.length; i++) {
      if (buf[i] == 0x0a) {
        foldarr.push(Buffer.from(buf.slice(s, i)));
        s = i + 1;
      } else if (i == buf.length - 1) {
        foldarr.push(Buffer.from(buf.slice(s, buf.length)));
      }
    }
    return foldarr.map(x => {
      for (let i = x.length; i >= 0; i--) {
        if (x[i] == 0x3a) {
          let buf = fnbufdecode(Buffer.from(x.slice(0, i)));
          let ino = Number(Buffer.from(x.slice(i + 1, x.length)).toString());
          if (encoding == null || encoding == 'buffer') return [buf, ino];
          else return [buf.toString(encoding), ino];
        }
      }
    });
  }
  formFolder(foldarr, encoding) {
    if (encoding === undefined) encoding = 'utf8';
    return Buffer.concat(foldarr.map((x, i) => {
      let bcarr;
      if (encoding == null) bcarr = [fnbufencode(x[0]), Buffer.from([0x3a]), Buffer.from(String(x[1]))];
      else bcarr = [fnbufencode(Buffer.from(x[0], encoding)), Buffer.from([0x3a]), Buffer.from(String(x[1]))];
      if (i < foldarr.length - 1) bcarr.push(Buffer.from([0x0a]));
      return Buffer.concat(bcarr);
    }));
  }

  popfi(typ, mode, uid, gid, fc) {
    if (mode === undefined) mode = 0o777;
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (fc !== undefined) {
      if (!Buffer.isBuffer(fc)) throw new Error('File contents not buffer');
      if (this.getFreeBytes() < fc.length + INODSIZE) throw new OSFSError('ENOSPC');
    } else {
      if (this.getFreeBytes() < INODSIZE) throw new OSFSError('ENOSPC');
    }
    if (!this.writable) throw new OSFSError('EROFS');
    let ino;
    if (this.fi.length > 0) {
      ino = this.fi.splice(0, 1)[0];
    } else {
      for (let i = 0; i < this.inoarr.length; i++) {
        if (!(i in this.inoarr)) {
          ino = i;
          break;
        }
      }
      if (ino == null) {
        if (this.inoarr.length >= this.maxinodes) throw new OSFSError('ENOSPC', 'max inode count reached');
        this.inoarr.push(null);
        this.inodarr.push(null);
        ino = this.inoarr.length - 1;
      }
    }
    let ctime = getcTime();
    this.inoarr[ino] = fc || Buffer.alloc(0);
    this.inodarr[ino] = Buffer.alloc(32);
    this.setInod(ino, 0, typ);
    this.setInod(ino, 3, ctime);
    this.setInod(ino, 4, ctime);
    this.setInod(ino, 5, ctime);
    this.setInod(ino, 6, mode);
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    this.archive = true;
    return ino;
  }

  getInode(pathr, symlink) {
    if (symlink === undefined) symlink = true;
    let isbuf, path;
    if (Buffer.isBuffer(path)) {
      isbuf = true;
      path = pathr.toString('latin1');
    } else path = pathr.toString();
    if (path == '/') {
      return 0;
    } else if (this.allowinoacc && /^<\d+>$/.test(path)) {
      return parseInt(path.substring(1, path.length - 1));
    }
    let ino = 0;
    let patharr = pathSplit(pathr), v;
    if (this.allowinoacc && /^<\d+>$/.test(v = patharr[0])) {
      ino = parseInt(v.substring(1, patharr[0].length - 1));
    }
    patharr.splice(0, 1);
    for (let i in patharr) {
      let cp = normalize(pathJoin(patharr.slice(0, parseInt(i) + 1)));
      let fc, nino = null;
      if (isbuf) {
        fc = this.parseFolder(this.inoarr[ino], null);
        for (let j in fc) {
          if (fc[j][0].equals(patharr[i])) {
            nino = fc[j][1];
            break;
          }
        }
      } else {
        fc = this.parseFolder(this.inoarr[ino]);
        for (let j in fc) {
          if (fc[j][0] == patharr[i]) {
            nino = fc[j][1];
            break;
          }
        }
      }
      if (nino != null) {
        ino = nino;
      } else {
        return null;
      }
      if (this.getInod(ino, 0) == 10 && (symlink || parseInt(i) != patharr.length - 1)) {
        ino = this.getInode(normalize(this.inoarr[ino], parentPath(cp)));
      } else if (this.getInod(ino, 0) != 4 && parseInt(i) != patharr.length - 1) {
        throw new OSFSError('ENOTDIR', cp.toString());
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
  createFile(path, typ, mode, uid, gid, fc) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.exists(path)) throw new OSFSError('EEXIST');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.popfi(typ, mode, uid, gid, fc);
    try { this.appendFolder(inop, pathEnd(path), ino); } catch (e) {
      if (e instanceof OSFSError && e.code == 'ENOSPC') this.decref(ino);
      throw e;
    }
    this.incref(ino);
    this.archive = true;
    return ino;
  }
  getcInode(path, typ, symlink, mode, uid, gid, fc) {
    let ino = this.getInode(path, symlink);
    if (ino === null) {
      return this.createFile(path, typ, mode, uid, gid, fc);
    } else {
      return ino;
    }
  }
  appendFolder(ino, nam, inot) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ab = Buffer.concat([Buffer.from(this.inoarr[ino].length != 0 ? '\n' : ''), fnbufencode(Buffer.from(nam)), Buffer.from(':'), Buffer.from(String(inot))]);
    if (this.getFreeBytes() < ab.length) throw new OSFSError('ENOSPC');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], ab]);
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  remFromFolder(inop, nam) {
    if (!this.writable) throw new OSFSError('EROFS');
    let pf = this.parseFolder(this.inoarr[inop], null);
    let delino = null;
    for (let i in pf) {
      if (pf[i][0].toString() == nam) {
        delino = i;
        break;
      }
    }
    pf.splice(delino, 1);
    this.inoarr[inop] = this.formFolder(pf, null);
    this.updateFileTimes(inop, 3);
    this.archive = true;
  }

  updateFileTimes(ino, flag) {
    if (!this.writable) throw new OSFSError('EROFS');
    let ctime = getcTime();
    if (flag & 4) this.setInod(ino, 3, ctime);
    if (flag & 2) this.setInod(ino, 4, ctime);
    if (flag & 1) this.setInod(ino, 5, ctime);
    this.archive = true;
  }

  getUsedBytes() {
    return this.inoarr.reduce((a, x) => a + x.length, 0) + this.inodarr.length * INODSIZE;
  }
  getFreeBytes() {
    return this.maxsize - this.getUsedBytes();
  }

  exists(path) {
    if (this.log) console.log(`${this.ts() + this.name}: exists(${inspect(path)})`);
    return this.getInode(path) != null;
  }

  statino(ino, options) {
    let statobj;
    if (!(options && options.bigint)) {
      statobj = new fs.Stats(
        50, // dev
        this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6), // mode
        this.getInod(ino, 2), // nlink
        this.getInod(ino, 7), // uid
        this.getInod(ino, 8), // gid
        0, // rdev
        this.blocksize, // blksize
        ino, // ino
        this.inoarr[ino].length, // size
        Math.ceil(this.inoarr[ino].length / this.blocksize), // blocks
        this.getInod(ino, 3), // atim_msec
        this.getInod(ino, 4), // mtim_msec
        this.getInod(ino, 5), // ctim_msec
        null // birthtim_msec
      );
    } else {
      statobj = new fs.Stats(
        BigInt(50), // dev
        BigInt(this.getInod(ino, 0) * 0o10000 + this.getInod(ino, 6)), // mode
        BigInt(this.getInod(ino, 2)), // nlink
        BigInt(this.getInod(ino, 7)), // uid
        BigInt(this.getInod(ino, 8)), // gid
        BigInt(0), // rdev
        BigInt(this.blocksize), // blksize
        BigInt(ino), // ino
        BigInt(this.inoarr[ino].length), // size
        BigInt(Math.ceil(this.inoarr[ino].length / this.blocksize)), // blocks
        BigInt(this.getInod(ino, 3)), // atim_msec
        BigInt(this.getInod(ino, 4)), // mtim_msec
        BigInt(this.getInod(ino, 5)), // ctim_msec
        null // birthtim_msec
      );
    }
    if (this.getInod(ino, 0) == 2) {
      let major = this.inoarr[ino].readUInt32BE(0), minor = this.inoarr[ino].readUInt32BE(4);
      let dv = makedev(major, minor);
      statobj.dev = (options && options.bigint) ? BigInt(dv) : dv;
      statobj.rdev = (options && options.bigint) ? BigInt(1) : 1;
      statobj.blocks = (options && options.bigint) ? BigInt(0) : 0;
      return { type: 2, major, minor, statobj };
    } else return statobj;
  }
  stat(path, options) {
    if (this.log) console.log(`${this.ts() + this.name}: stat(${inspect(path)}${options ? ', ' + inspect(options) : ''})`);
    return this.statino(this.geteInode(path), options);
  }
  lstat(path, options) {
    if (this.log) console.log(`${this.ts() + this.name}: lstat(${inspect(path)}${options ? ', ' + inspect(options) : ''})`);
    return this.statino(this.geteInode(path, false), options);
  }
  fstat(ino, options) {
    if (this.log) console.log(`${this.ts() + this.name}: fstat(${ino}${options ? ', ' + inspect(options) : ''})`);
    return this.statino(ino, options);
  }
  lsattrino(ino) {
    let attrv = this.getInod(ino, 1), attrs = [];
    if (attrv & 128) attrs.push('i');
    if (attrv & 64) attrs.push('a');
    if (attrv & 32) attrs.push('s');
    if (attrv & 16) attrs.push('S');
    if (attrv & 8) attrs.push('A');
    return attrs;
  }
  lsattr(path) {
    if (this.log) console.log(`${this.ts() + this.name}: lsattr(${inspect(path)})`);
    return this.lsattrino(this.geteInode(path));
  }
  llsattr(path) {
    if (this.log) console.log(`${this.ts() + this.name}: llsattr(${inspect(path)})`);
    return this.lsattrino(this.geteInode(path, false));
  }
  flsattr(ino) {
    if (this.log) console.log(`${this.ts() + this.name}: flsattr(${inspect(path)})`);
    return this.lsattrino(ino);
  }

  access(path, mode) {
    if (this.log) console.log(`${this.ts() + this.name}: access(${inspect(path)}, ${mode})`);
    let ino = this.geteInode(path);
    if (this.writable) {
      this.updateFileTimes(ino, 4);
      this.archive = true;
    }
  }

  chmodino(ino, mode) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 6, mode);
    this.updateFileTimes(ino, 1);
    this.archive = true;
  }
  chmod(path, mode) {
    if (this.log) console.log(`${this.ts() + this.name}: chmod(${inspect(path)}, ${mode})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    return this.chmodino(this.geteInode(path), mode);
  }
  lchmod(path, mode) {
    if (this.log) console.log(`${this.ts() + this.name}: lchmod(${inspect(path)}, ${mode})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    return this.chmodino(this.geteInode(path, false), mode);
  }
  fchmod(ino, mode) {
    if (this.log) console.log(`${this.ts() + this.name}: fchmod(${ino}, ${mode})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode < 0) throw new OSFSError('EINVAL', 'invalid permission mode');
    mode = mode & 0o777;
    return this.chmodino(ino, mode);
  }
  chownino(ino, uid, gid) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 7, uid);
    this.setInod(ino, 8, gid);
    this.updateFileTimes(ino, 1);
    this.archive = true;
  }
  chown(path, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: chown(${inspect(path)}, ${uid}, ${gid})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chownino(this.geteInode(path), uid, gid);
  }
  lchown(path, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: lchown(${inspect(path)}, ${uid}, ${gid}})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chownino(this.geteInode(path, false), uid, gid);
  }
  fchown(ino, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: fchown(${ino}, ${uid}, ${gid})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chownino(ino, uid, gid);
  }
  chattrino(ino, attrs) {
    if (!this.writable) throw new OSFSError('EROFS');
    let attrb = this.getInod(ino, 1);
    for (var i in attrs) {
      let num;
      switch (attrs[i][1]) {
        case 'i': num = 128; break;
        case 'a': num = 64; break;
        case 's': num = 32; break;
        case 'S': num = 16; break;
        case 'A': num = 8; break;
        default: throw new OSFSError('EINVAL', 'invalid attribute name');
      }
      if (attrs[i][0] == '+') {
        attrb |= num;
      } else if (attrs[i][0] == '-') {
        attrb &= 255 - num;
      } else throw new Error('Invalid attribute modifier');
    }
    this.setInod(ino, 1, attrb);
    this.updateFileTimes(ino, 1);
    this.archive = true;
  }
  chattr(path, attrs) {
    if (this.log) console.log(`${this.ts() + this.name}: chattr(${inspect(path)}, ${attrs})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chattrino(this.geteInode(path), attrs);
  }
  lchattr(path, attrs) {
    if (this.log) console.log(`${this.ts() + this.name}: lchattr(${inspect(path)}, ${attrs})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chattrino(this.geteInode(path, false), attrs);
  }
  fchattr(ino, attrs) {
    if (this.log) console.log(`${this.ts() + this.name}: fchattr(${ino}, ${attrs})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.chattrino(ino, attrs);
  }
  utimesino(ino, atime, mtime) {
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.setInod(ino, 5, Number(atime));
    this.setInod(ino, 4, Number(mtime));
    this.updateFileTimes(ino, 1);
    this.archive = true;
  }
  utimes(path, atime, mtime) {
    if (this.log) console.log(`${this.ts() + this.name}: utimes(${inspect(path)}, ${atime}, ${mtime})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.utimesino(this.geteInode(path), atime, mtime);
  }
  futimes(ino, atime, mtime) {
    if (this.log) console.log(`${this.ts() + this.name}: futimes(${ino}, ${atime}, ${mtime})`);
    if (!this.writable) throw new OSFSError('EROFS');
    return this.utimesino(ino, atime, mtime);
  }

  readFile(path, encoding) {
    if (this.log) console.log(`${this.ts() + this.name}: readFile(${inspect(path)}, ${inspect(encoding)})`);
    let ino = this.geteInode(path);
    if (this.writable) { this.updateFileTimes(ino, 4); this.archive = true; }
    if (encoding == null) return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(encoding);
  }
  freadFile(ino, sp, options) {
    if (this.log) console.log(`${this.ts() + this.name}: freadFile(${ino}, ${sp}, ${inspect(encoding)})`);
    if (this.writable) { this.updateFileTimes(ino, 4); this.archive = true; }
    if (encoding == null) return Buffer.from(this.inoarr[ino].slice(sp, Infinity));
    else return this.inoarr[ino].slice(sp, Infinity).toString(encoding);
  }
  writeFile(path, buf, options, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: writeFile(${inspect(path)}, ${inspect(buf)}${options ? ', ' + inspect(options) : ''})`);
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.exists(path)) {
      if (this.getFreeBytes() < buf.length) throw new OSFSError('ENOSPC');
    } else {
      if (this.getFreeBytes() < buf.length + INODSIZE) throw new OSFSError('ENOSPC');
    }
    let ino = this.getcInode(path, 8, true, options.mode, uid, gid);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.inoarr[ino] = Buffer.from(buf, options.encoding);
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  fwriteFile(ino, sp, buf, options) {
    if (this.log) console.log(`${this.ts() + this.name}: fwriteFile(${ino}, ${sp}, ${inspect(buf)}${options ? ', ' + inspect(options) : ''})`);
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
      if (this.getFreeBytes() < buf.length) throw new OSFSError('ENOSPC');
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buf]);
    }
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  appendFile(path, buf, options) {
    if (this.log) console.log(`${this.ts() + this.name}: appendFile(${inspect(path)}, ${inspect(buf)}${options ? ', ' + inspect(options) : ''})`);
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (uid === undefined) uid = 0;
    if (gid === undefined) gid = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    if (this.exists(path)) {
      if (this.getFreeBytes() < buf.length) throw new OSFSError('ENOSPC');
    } else {
      if (this.getFreeBytes() < buf.length + INODSIZE) throw new OSFSError('ENOSPC');
    }
    let ino = this.getcInode(path, 8, true, options.mode, uid, gid);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  fappendFile(ino, sp, buf, options) {
    if (this.log) console.log(`${this.ts() + this.name}: fappendFile(${ino}, ${sp}, ${inspect(buf)}${options ? ', ' + inspect(options) : ''})`);
    if (typeof options == 'string') options = {encoding:options};
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.mode === undefined) options.mode = 0o666;
    if (!this.writable) throw new OSFSError('EROFS');
    if (typeof buf == 'string') buf = Buffer.from(buf, options.encoding);
    if (this.getFreeBytes() < buf.length) throw new OSFSError('ENOSPC');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  truncate(path, len) {
    if (this.log) console.log(`${this.ts() + this.name}: truncate(${inspect(path)}, ${len})`);
    if (len === undefined) len = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (this.inoarr[ino].length > len) {
      let nbuf = Buffer.allocUnsafe(len);
      this.inoarr[ino].copy(nbuf, 0, 0, len);
      this.inoarr[ino] = nbuf;
    } else if (this.inoarr[ino].length < len) {
      if (this.getFreeBytes() < len - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
      let nbuf = Buffer.alloc(len);
      this.inoarr[ino].copy(nbuf);
      this.inoarr[ino] = nbuf;
    }
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }
  ftruncate(ino, len) {
    if (this.log) console.log(`${this.ts() + this.name}: ftruncate(${ino}, ${len})`);
    if (len === undefined) len = 0;
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (this.inoarr[ino].length > len) {
      let nbuf = Buffer.allocUnsafe(len);
      this.inoarr[ino].copy(nbuf, 0, 0, len);
      this.inoarr[ino] = nbuf;
    } else if (this.inoarr[ino].length < len) {
      if (this.getFreeBytes() < len - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
      let nbuf = Buffer.alloc(len);
      this.inoarr[ino].copy(nbuf);
      this.inoarr[ino] = nbuf;
    }
    this.updateFileTimes(ino, 3);
    this.archive = true;
  }

  mknod(path, mode, major, minor) {
    if (this.log) console.log(`${this.ts() + this.name}: mknod(${inspect(path)}, ${inspect(type)}, ${major}, ${minor})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (mode != 2 && mode != 6) throw new OSFSError('EINVAL');
    let ino = this.getInode(path);
    if (ino != null) throw new OSFSError('EEXIST');
    ino = this.createFile(path, mode);
    this.inoarr[ino] = Buffer.allocUnsafe(8);
    this.inoarr[ino].writeUInt32BE(major, 0);
    this.inoarr[ino].writeUInt32BE(minor, 4);
  }

  link(pathf, patht, nincref) {
    if (this.log) console.log(`${this.ts() + this.name}: link(${inspect(pathf)}, ${inspect(patht)}, ${nincref})`);
    if (!this.writable) throw new OSFSError('EROFS');
    let inop = this.geteInode(parentPath(patht));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.geteInode(pathf, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (this.exists(patht)) throw new OSFSError('EEXIST');
    this.appendFolder(inop, pathEnd(patht), ino);
    if (!nincref) this.incref(ino);
    this.archive = true;
  }
  unlink(path, ndecref) {
    if (this.log) console.log(`${this.ts() + this.name}: unlink(${inspect(path)}, ${nincref})`);
    if (!this.writable) throw new OSFSError('EROFS');
    let inop = this.geteInode(parentPath(path));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    this.remFromFolder(inop, pathEnd(path));
    if (!ndecref) this.decref(ino);
    this.archive = true;
  }

  copyFile(pathf, patht, flags, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: copyFile(${inspect(pathf)}, ${inspect(patht)}, ${flags}, ${uid}, ${gid})`);
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
    if (this.getFreeBytes() < this.inoarr[inof].length + INODSIZE) throw new OSFSError('ENOSPC');
    let inot = this.getcInode(patht, 8, true, this.getInod(inof, 6), uid, gid, Buffer.from(this.inoarr[inof]));
    this.updateFileTimes(inof, 4);
    this.archive = true;
  }

  readlink(path, options) {
    if (this.log) console.log(`${this.ts() + this.name}: readlink(${inspect(path)}${options ? ', ' + inspect(options) : ''})`);
    let ino = this.geteInode(path, false);
    if (this.getInod(ino, 0) != 10) throw new OSFSError('EINVAL', 'path not a symbolic link');
    if (this.writable) { this.updateFileTimes(ino, 4); this.archive = true; }
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  symlink(target, path, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: symlink(${inspect(target)}, ${inspect(path)})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.exists(path)) throw new OSFSError('EEXIST');
    let tb = Buffer.from(target);
    if (this.getFreeBytes() < tb.length + INODSIZE) throw new OSFSError('ENOSPC');
    this.getcInode(path, 10, true, 0o666, uid, gid, tb);
    this.archive = true;
  }

  readdir(path, options) {
    if (this.log) console.log(`${this.ts() + this.name}: readdir(${inspect(path)}${options ? ', ' + inspect(options) : ''})`);
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.withFileTypes === undefined) options.withFileTypes = false;
    let ino = this.geteInode(path);
    let pf = this.parseFolder(this.inoarr[ino], options.encoding);
    if (this.writable) { this.updateFileTimes(ino, 4); this.archive = true; }
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

  mkdir(path, options, uid, gid) {
    if (this.log) console.log(`${this.ts() + this.name}: mkdir(${inspect(path)}${options ? ', ' + inspect(options) : ''})`);
    if (options === undefined) options = {};
    if (options.mode === undefined) options.mode = 0o777;
    if (!this.writable) throw new OSFSError('EROFS');
    this.createFile(path, 4, options.mode, uid, gid);
    this.archive = true;
  }

  rename(pathf, patht) {
    if (this.log) console.log(`${this.ts() + this.name}: rename(${inspect(pathf)}, ${inspect(patht)})`);
    if (!this.writable) throw new OSFSError('EROFS');
    let inop = this.geteInode(parentPath(pathf));
    if (this.getInod(inop, 1) & 128) throw new OSFSError('EPERM', 'parent folder immutable');
    let ino = this.geteInode(pathf, false);
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (this.exists(patht)) {
      if (this.getInod(this.geteInode(patht), 0) != 8) throw new OSFSError('EPERM', 'cannot silently unlink non-file in rename');
      this.unlink(patht);
    }
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.remFromFolder(inop, pathEnd(pathf));
    this.archive = true;
  }

  rmdir(path) {
    if (this.log) console.log(`${this.ts() + this.name}: rmdir(${inspect(path)})`);
    if (inl === undefined) inl = [];
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path, false);
    if (inl.indexOf(ino) < 0) inl.push(ino);
    let typ = this.getInod(ino, 0);
    if (typ == 8) throw new OSFSError('ENOTDIR', 'cannot rmdir a file');
    if (typ == 10) {
      this.unlink(path);
      return;
    }
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'folder immutable');
    if (this.parseFolder(this.inoarr[ino]).length != 0) throw new OSFSError('ENOTEMPTY');
    this.unlink(path);
    this.archive = true;
  }

  rmdirRecursive(path, inl) {
    if (this.log) console.log(`${this.ts() + this.name}: rmdirRecursive(${inspect(path)})`);
    if (inl === undefined) inl = [];
    if (!this.writable) throw new OSFSError('EROFS');
    let ino = this.geteInode(path, false);
    if (inl.indexOf(ino) < 0) inl.push(ino);
    let typ = this.getInod(ino, 0);
    if (typ == 8) throw new OSFSError('ENOTDIR', 'cannot rmdir a file');
    if (typ == 10) {
      this.unlink(path);
      return;
    }
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'folder immutable');
    let arr = this.parseFolder(this.inoarr[ino]);
    for (let i in arr) {
      let inof = arr[i][1];
      let inot = this.getInod(inof, 0);
      let refcnt = this.getInod(inof, 1);
      if (inot == 4 && inl.indexOf(inof) < 0) {
        inl.push(inof);
        if (refcnt > 1 && refcnt > this.internalLinks(inof)) {
          this.unlink(path + '/' + arr[i][0]);
        } else {
          this.rmdirRecursive(path + '/' + arr[i][0], inl);
        }
      } else this.unlink(path + '/' + arr[i][0]);
    }
    this.unlink(path);
    this.archive = true;
  }

  read(ino, sp, buffer, offset, length, position) {
    if (this.log) console.log(`${this.ts() + this.name}: read(${ino}, ${sp}, ${length}, ${position})`);
    if (offset === undefined) offset = 0;
    if (length === undefined) length = buffer.length;
    if (offset + length > buffer.length) throw new OSFSError('EINVAL', 'buffer too short');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    if (this.getInod(ino, 0) == 2) {
      let major = this.inoarr[ino].readUInt32BE(0), minor = this.inoarr[ino].readUInt32BE(4);
      return { type: 2, buffer, offset, length, position: position || sp, major, minor };
    }
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
    if (this.writable) { this.updateFileTimes(ino, 4); this.archive = true; }
    return length;
  }
  write(ino, sp, buffer, offset, length, position) {
    if (this.log) console.log(`${this.ts() + this.name}: write(${ino}, ${sp}, ${inspect(buffer)}, ${offset}, ${length}, ${position})`);
    if (offset === undefined) offset = 0;
    if (length === undefined) length = buffer.length;
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (offset + length > buffer.length) throw new OSFSError('EINVAL', 'buffer too short');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    if (this.getInod(ino, 0) == 2) {
      let major = this.inoarr[ino].readUInt32BE(0), minor = this.inoarr[ino].readUInt32BE(4);
      return { type: 2, buffer, offset, length, position: position || sp, major, minor };
    }
    if (position == null) {
      if (sp + length > this.inoarr[ino].length) {
        if (this.getFreeBytes() < sp + length - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buffer.slice(offset, offset + length)]);
      } else buffer.copy(this.inoarr[ino], sp, offset, offset + length);
    } else {
      if (position + length > this.inoarr[ino].length) {
        if (this.getFreeBytes() < position + length - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, position), buffer.slice(offset, offset + length)]);
      } else buffer.copy(this.inoarr[ino], position, offset, offset + length);
    }
    this.updateFileTimes(ino, 3);
    this.archive = true;
    return length;
  }
  writeStr(ino, sp, string, position, encoding) {
    if (this.log) console.log(`${this.ts() + this.name}: writeStr(${ino}, ${sp}, ${inspect(string)}, ${position}, ${encoding})`);
    if (!this.writable) throw new OSFSError('EROFS');
    if (this.getInod(ino, 1) & 128) throw new OSFSError('EPERM', 'file immutable');
    if (typeof position == 'number' && position < 0) throw new OSFSError('EINVAL', 'invalid position');
    let buf = Buffer.from(string, encoding);
    if (this.getInod(ino, 0) == 2) {
      let major = this.inoarr[ino].readUInt32BE(0), minor = this.inoarr[ino].readUInt32BE(4);
      return { type: 2, buf, offset, length, position: position || sp, major, minor };
    }
    if (position == null) {
      if (sp + buf.length > this.inoarr[ino].length) {
        if (this.getFreeBytes() < sp + buf.length - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, sp), buffer]);
      } else buffer.copy(this.inoarr[ino], sp);
    } else {
      if (position + buf.length > this.inoarr[ino].length) {
        if (this.getFreeBytes() < position + buf.length - this.inoarr[ino].length) throw new OSFSError('ENOSPC');
        this.inoarr[ino] = Buffer.concat([this.inoarr[ino].slice(0, position), buffer]);
      } else buffer.copy(this.inoarr[ino], position);
    }
    this.updateFileTimes(ino, 3);
    this.archive = true;
    return buf.length;
  }

  fsStat() {
    if (this.log) console.log(`${this.ts() + this.name}: fsStat()`);
    let blocks = this.maxsize / this.blocksize;
    //let blocksused = this.inoarr.reduce((a, x) => a + Math.ceil(x.length / this.blocksize), 0);
    let blocksused = Math.ceil(this.getUsedBytes() / this.blocksize);
    return {
      bsize: this.blocksize,
      frsize: this.blocksize,
      blocks: this.maxsize / this.blocksize,
      bfree: Math.max(blocks - blocksused, 0),
      bavail: Math.max(blocks - blocksused, 0),
      files: this.maxinodes,
      ffree: this.maxinodes - this.inoarr.length,
      favail: this.maxinodes - this.inoarr.length,
      fsid: 1, //62147,
      flag: Number(!this.writable),
      namemax: 100000,
    };
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
    for (let i = 0; i < this.inoarr.length; i++) {
      if (this.fi.indexOf(i) > -1) continue;
      arr.push(this.reverseLookup(i, symlink));
    }
    return arr;
  }

  internalLinks(ino, aino, inos) {
    if (aino === undefined) aino = ino;
    if (inos === undefined) inos = [];
    if (this.getInod(ino, 0) != 4) return 0;
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
    this.archive = true;
  }

  exportSystemRawString() {
    let arr = [this.writable, [], [], []];
    for (let i = 0; i < this.inodarr.length; i++) arr[1].push(this.inodarr[i] !== undefined ? this.inodarr[i].toString('binary') : undefined);
    for (let i = 0; i < this.inoarr.length; i++) arr[2].push(this.inoarr[i] !== undefined ? this.inoarr[i].toString('binary') : undefined);
    for (let i = 0; i < this.fi.length; i++) arr[3].push(this.fi[i]);
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
    for (let i = 0; i < arr[1].length; i++) this.inodarr.push(arr[1][i] != null ? Buffer.from(arr[1][i], 'binary') : undefined);
    for (let i = 0; i < arr[2].length; i++) this.inoarr.push(arr[2][i] != null ? Buffer.from(arr[2][i], 'binary') : undefined);
    for (let i = 0; i < arr[3].length; i++) this.fi.push(arr[3][i]);
  }
  importSystemString(str) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    this.importSystemRawString(JSON.parse(str));
  }

  /* Legacy V1 VFS Export Format
    Header 13 bytes:
     - 00 - 01 0b ab000000
      - a - writable flag
      - b - wipeonfi flag
     - 01 - 05 0x cccccccc
      - c - Big-Endian 32-bit int representing size of inod section
     - 05 - 09 0x dddddddd
      - d - Big-Endian 32-bit int representing size of ino section
     - 09 - 0d 0x eeeeeeee
      - e - Big-Endian 32-bit int representing size of fi section
    Inod section:
     - made up of modules, each module 1/32 bytes:
     - 00 - 01 0x aa
      - a - 8-bit int, if 255 then module is 1 byte in size and the contents of an element of inodarr is undefined, else 32 bytes representing the contents of an element of inodarr
    Ino section:
     - made up of modules, each module 4+ bytes:
     - 00 - 04 0x aaaaaaaa
      - a - Big-Endian 32-bit int, if 2**32-1 then the contents of an element of inodarr is undefined, else representing size of an element of inoarr
    Fi section:
     - made up of modules, each module 4 bytes:
     - 00 - 04 0x aaaaaaaa
      - a - Big-Endian 32-bit int representing element of fi
  */
  exportSystemLegacyV1Size() {
    let v = 13;
    for (let i = 0; i < this.inodarr.length; i++) v += this.inodarr[i] != null ? 32 : 1;
    for (let i = 0; i < this.inoarr.length; i++) v += this.inoarr[i] != null ? 4 + this.inoarr[i].length : 4;
    v += this.fi.length * 4;
    return v;
  }
  exportSystemLegacyV1() {
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
    head.writeUInt8(this.writable ? 128 : 0 + this.wipeonfi ? 64 : 0, 0);
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
  importSystemLegacyV1(buf) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    let head = buf.slice(0, 13);
    let flags = head.readUInt8(0);
    if (flags & 128) this.writable = true;
    else this.writable = false;
    if (flags & 64) this.wipeonfi = true;
    else this.wipeonfi = false;
    this.archive = false;
    if (this.inodarr) this.inodarr.splice(0, Infinity);
    else this.inodarr = [];
    if (this.inoarr) this.inoarr.splice(0, Infinity);
    else this.inoarr = [];
    if (this.fi) this.fi.splice(0, Infinity);
    else this.fi = [];
    this.blocksize = 4096;
    this.maxsize = 2**32;
    this.maxinodes = 2**24;
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
  exportSystemLegacyV1Stream() {
    return new VFSExportRFSStream(this, {version: 1});
  }
  importSystemLegacyV1Stream() {
    return new VFSImportRFSStream(this, {version: 1});
  }

  /* VFS Export Format
    Header 31 bytes:
     - 00 - 01 0x aa
      - a - 8-bit int representing version number, equal to 2
     - 01 - 02 0b bc000000
      - b - writable flag
      - c - wipeonfi flag
     - 02 - 03 0x dd
      - d - 8-bit int representing base2 logarythm of block size
     - 03 - 09 0x eeeeeeeeeeee
      - e - Big-Endian 48-bit int representing maximum size of filesystem
     - 09 - 0d 0x ffffffff
      - f - Big-Endian 32-bit int representing maximum number of inodes
     - 0d - 13 0x gggggggggggg
      - g - Big-Endian 48-bit int representing size of inod section
     - 13 - 19 0x hhhhhhhhhhhh
      - h - Big-Endian 48-bit int representing size of ino section
     - 19 - 1f 0x iiiiiiiiiiii
      - i - Big-Endian 48-bit int representing size of fi section
    Inod section:
     - made up of modules, each module 1/32 bytes:
     - 00 - 01 0x aa
      - a - 8-bit int, if 255 then module is 1 byte in size and the contents of an element of inodarr is undefined, else 32 bytes representing the contents of an element of inodarr
    Ino section:
     - made up of modules, each module 4+ bytes:
     - 00 - 04 0x aaaaaaaa
      - a - Big-Endian 32-bit int, if 2**32-1 then the contents of an element of inodarr is undefined, else representing size of an element of inoarr
    Fi section:
     - made up of modules, each module 4 bytes:
     - 00 - 04 0x aaaaaaaa
      - a - Big-Endian 32-bit int representing element of fi
  */
  exportSystemSize() {
    let v = 31;
    for (let i = 0; i < this.inodarr.length; i++) v += this.inodarr[i] != null ? 32 : 1;
    for (let i = 0; i < this.inoarr.length; i++) v += this.inoarr[i] != null ? 4 + this.inoarr[i].length : 4;
    v += this.fi.length * 4;
    return v;
  }
  exportSystemSizeAdv() {
    let head = 31, inodarr = 0, inoarr = 0, fi;
    for (let i = 0; i < this.inodarr.length; i++) inodarr += this.inodarr[i] != null ? 32 : 1;
    for (let i = 0; i < this.inoarr.length; i++) inoarr += this.inoarr[i] != null ? 4 + this.inoarr[i].length : 4;
    fi = this.fi.length * 4;
    return [head, inodarr, inoarr, fi];
  }
  exportSystem() {
    let head = Buffer.allocUnsafe(31);
    let inodbufs = [];
    for (let i = 0; i < this.inodarr.length; i++) {
      let buf;
      if (this.inodarr[i] != null) buf = this.inodarr[i];
      else {
        buf = Buffer.allocUnsafe(1);
        buf.writeUInt8(255, 0);
      }
      inodbufs.push(buf);
    }
    let inodbuf = Buffer.concat(inodbufs);
    inodbufs.slice(0, Infinity);
    let inobufs = [];
    for (let i = 0; i < this.inoarr.length; i++) {
      let inohead = Buffer.allocUnsafe(4);
      if (this.inoarr[i] != null) {
        inohead.writeUInt32BE(this.inoarr[i].length, 0);
        inobufs.push(inohead);
        if (this.inoarr[i].length > 0) inobufs.push(this.inoarr[i]);
      } else {
        inohead.writeUInt32BE(0xffffffff, 0);
        inobufs.push(inohead);
      }
    }
    let inobuf = Buffer.concat(inobufs);
    inobufs.slice(0, Infinity);
    let fibuf = Buffer.allocUnsafe(this.fi.length * 4);
    for (let i = 0; i < this.fi.length; i++) {
      fibuf.writeUInt32BE(this.fi[i], i * 4);
    }
    head.writeUInt8(2, 0);
    head.writeUInt8(this.writable * 128 + this.wipeonfi * 64 + this.archive * 32 + this.allowinoacc * 16, 1);
    head.writeUInt8(Math.ceil(Math.log2(this.blocksize)), 2);
    head.writeUIntBE(this.maxsize, 3, 6);
    head.writeUInt32BE(this.maxinodes, 9);
    head.writeUIntBE(inodbuf.length, 13, 6);
    head.writeUIntBE(inobuf.length, 19, 6);
    head.writeUIntBE(fibuf.length, 25, 6);
    return Buffer.concat([
      head,
      inodbuf,
      inobuf,
      fibuf
    ]);
  }
  importSystem(buf) {
    if (!this.writable && this.writable != null) throw new OSFSError('EROFS');
    let head = buf.slice(0, 31);
    let version = head.readUInt8(0);
    if (version & 0b11000000) return this.importSystemLegacyV1(buf);
    let flags = head.readUInt8(1);
    if (flags & 128) this.writable = true;
    else this.writable = false;
    if (flags & 64) this.wipeonfi = true;
    else this.wipeonfi = false;
    if (flags & 32) this.archive = true;
    else this.archive = false;
    if (flags & 16) this.allowinoacc = true;
    else this.allowinoacc = false;
    if (this.inodarr) this.inodarr.splice(0, Infinity);
    else this.inodarr = [];
    if (this.inoarr) this.inoarr.splice(0, Infinity);
    else this.inoarr = [];
    if (this.fi) this.fi.splice(0, Infinity);
    else this.fi = [];
    this.blocksize = 2 ** head.readUInt8(2);
    this.maxsize = head.readUIntBE(3, 6);
    this.maxinodes = head.readUInt32BE(9);
    let ind = 0;
    let inodlen = head.readUIntBE(13, 6);
    for (let i = 0; i < inodlen; i++, ind++) {
      if (buf.readUInt8(31 + i) != 255) {
        this.inodarr[ind] = buf.slice(31 + i, 31 + i + 32);
        i += 31;
      }
    }
    if (this.inodarr.length < ind) this.inodarr.length = ind;
    ind = 0;
    let inolen = head.readUIntBE(19, 6);
    for (let i = 0; i < inolen; i += 4, ind++) {
      let len = buf.readUInt32BE(31 + inodlen + i);
      if (len != 0xffffffff) {
        this.inoarr[ind] = buf.slice(35 + inodlen + i, 35 + inodlen + i + len);
        i += len;
      }
    }
    if (this.inoarr.length < ind) this.inoarr.length = ind;
    let filen = head.readUIntBE(25, 6);
    for (let i = 0; i < filen; i += 4) {
      this.fi.push(buf.readUInt32BE(31 + inodlen + inolen + i));
    }
  }
  exportSystemStream() {
    return new VFSExportRFSStream(this);
  }
  importSystemStream() {
    return new VFSImportRFSStream(this);
  }

  ts() {
    if (this.logts) return `[${new Date().toISOString()}] `;
    else return '';
  }

  enableLogging(name) {
    this.log = true;
    this.name = name;
  }
  disableLogging() {
    delete this.log;
    delete this.name;
  }
}

module.exports = { FileSystem };