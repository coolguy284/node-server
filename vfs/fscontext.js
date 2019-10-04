let { getKeyByValue, getcTime, parentPath, pathEnd, normalize } = require('./helperf.js');
let { OSFSError } = require('./errors.js');
let { VFSReadStream, VFSWriteStream } = require('./s.js');
let THROWONBADUGID = false;

function getPermsPath(obj, path) {
  obj.getPerms(obj.fs.geteInode(path));
}

class FileSystemContext {
  constructor(fs, opts) {
    if (typeof fs == 'string') {
      this.importSystemString(fs);
      return;
    } else if (fs instanceof Buffer) {
      this.importSystem(fs);
      return;
    }
    if (opts === undefined) opts = {};
    if (opts.cwd === undefined) opts.cwd = '/';
    if (opts.uids === undefined) opts.uids = { 0: 'root', 1000: 'ss2' };
    if (opts.gids === undefined) opts.gids = { 0: 'root', 1000: 'ss2' };
    if (opts.uid === undefined) opts.uid = 0;
    if (opts.groups === undefined) opts.groups = { 'root': [0], 'ss2': [1000] };
    if (opts.mounts === undefined) opts.mounts = [
      [], // mount path
      [], // mount type 0-fscontext 1-rfs 2-real fs
      [], // mount fs object
      [] // mount path in mounted filesystem
    ];
    if (opts.fd === undefined) opts.fd = [];
    this.fs = fs;
    this.cwd = opts.cwd;
    this.uid = opts.uid;
    this.gid = this.uid;
    this.uids = opts.uids;
    this.gids = opts.gids;
    this.groups = opts.groups;
    this.mounts = opts.mounts;
    this.fd = opts.fd;
  }

  mountNormalize(path, symlink, mount, cwd) {
    if (path == null) return [this, path];
    if (symlink === undefined) symlink = true;
    if (mount === undefined) mount = true;
    if (cwd === undefined) cwd = this.cwd;
    path = path.replace(/\\/g, '/');
    if (path[0] == '/') path = path[0] + path.slice(1, Infinity).replace(/\/*$/, '');
    else path = path.replace(/\/*$/, '');
    path = normalize(path, cwd);
    let patharr = path.split('/');
    for (let i in patharr) {
      let cp = patharr.slice(0, parseInt(i) + 1).join('/');
      let crp = patharr.slice(parseInt(i) + 1, Infinity).join('/');
      if (mount) {
        let mind = this.mounts[0].indexOf(cp);
        if (mind > -1) {
          switch (this.mounts[1][mind]) {
            case 0:
              return this.mounts[2][mind].mountNormalize ? this.mounts[2][mind].mountNormalize(this.mounts[3][mind] + crp, symlink, mount) : [this.mounts[2][mind], this.mounts[3][mind] + crp];
            case 1: return [{fs: this.mounts[2][mind], cwd: '/', getPerms: () => ({read:1,write:1,execute:1})}, this.mounts[3][mind] + crp];
            case 2: return [{...this.mounts[2][mind], fs: {geteInode: () => null}, cwd: '/', getPerms: () => ({read:1,write:1,execute:1})}, this.mounts[3][mind] + crp];
          }
        }
      }
      if (parseInt(i) != patharr.length - 1 || symlink) {
        let ino = this.fs.getInode(cp, false);
        if (ino != null) {
          if (this.fs.getInod(ino, 0) == 12) {
            return this.mountNormalize(this.fs.inoarr[ino].toString(), symlink, mount, parentPath(cp));
          }
        }
      }
    }
    path = normalize(path, this.cwd);
    return [this, path];
  }

  addfd(item) {
    for (var i in this.fd) {
      if (this.fd[i] === undefined) {
        this.fd[i] = item;
        return parseInt(i);
      }
    }
    this.fd.push(item);
    return this.fd.length - 1;
  }

  getPerms(ino) {
    if (this.uid == 0) return {read: 1, write: 1, execute: 1};
    let pl = this.fs.getInod(ino, 6);
    if (this.uid == this.fs.getInod(ino, 7)) {
      return {read: pl & 0o400 ? 1 : 0, write: pl & 0o200 ? 1 : 0, execute: pl & 0o100 ? 1 : 0};
    }
    let group = false;
    let grp = this.fs.getInod(ino, 8);
    for (let i in this.groups) {
      if (this.groups[i].indexOf(this.uid) > -1 && parseInt(i) == grp) {
        group = true;
        break;
      }
    }
    if (group) {
      return {read: pl & 0o40 ? 1 : 0, write: pl & 0o20 ? 1 : 0, execute: pl & 0o10 ? 1 : 0};
    } else {
      return {read: pl & 0o4 ? 1 : 0, write: pl & 0o2 ? 1 : 0, execute: pl & 0o1 ? 1 : 0};
    }
  }

  chdir(path) {
    path = normalize(path, this.cwd);
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new OSFSError('EACCES');
    this.cwd = path;
  }

  realpathSync(path, options) {
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.encoding == 'utf8') {
      return this.mountNormalize(path, true, false)[1];
    } else if (options.encoding == 'buffer') {
      return Buffer.from(this.mountNormalize(path, true, false)[1]);
    } else {
      return Buffer.from(this.mountNormalize(path, true, false)[1]).toString(options.encoding);
    }
  }

  existsSync(path) {
    let fsc = this.mountNormalize(path);
    try {
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).read) return false;
      return fsc[0].fs.exists(fsc[1]);
    } catch (e) {
      return false;
    }
  }
  accessSync(path, mode) {
    let fsc = this.mountNormalize(path);
    if (mode == null) mode = 0;
    if (!fsc[0].fs) return fsc[0].accessSync(fsc[1], mode);
    if (mode == 0) {
      if (!fsc[0].existsSync(fsc[1])) throw new OSFSError('ENOENT');
      return;
    }
    let perms = fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1])));
    if (mode & 4 && !perms.read) throw new OSFSError('EACCES');
    if (mode & 2 && !perms.write) throw new OSFSError('EACCES');
    if (mode & 1 && !perms.execute) throw new OSFSError('EACCES');
  }
  statSync(path, options) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].statSync(fsc[1], options);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new OSFSError('EACCES');
    return fsc[0].fs.stat(fsc[1], options);
  }
  lstatSync(path, options) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].lstatSync(fsc[1], options);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new OSFSError('EACCES');
    return fsc[0].fs.lstat(fsc[1], options);
  }

  chmodSync(path, mode) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].chmodSync(fsc[1], mode);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7) && this.uid != 0) throw new OSFSError('EACCES');
    return fsc[0].fs.chmod(fsc[1], mode);
  }
  lchmodSync(path, mode) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].lchmodSync(fsc[1], mode);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7) && this.uid != 0) throw new OSFSError('EACCES');
    return fsc[0].fs.lchmod(fsc[1], mode);
  }
  chownSync(path, uid, gid) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].chownSync(fsc[1], uid, gid);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7) && this.uid != 0) throw new OSFSError('EACCES');
    if (THROWONBADUGID && !fsc[0].uids[uid]) throw new Error('nonexistent uid');
    if (THROWONBADUGID && !fsc[0].gids[gid]) throw new Error('nonexistent gid');
    return fsc[0].fs.chown(fsc[1], uid, gid);
  }
  lchownSync(path, uid, gid) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].lchownSync(fsc[1], uid, gid);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7) && this.uid != 0) throw new OSFSError('EACCES');
    if (THROWONBADUGID && !fsc[0].uids[uid]) throw new Error('nonexistent uid');
    if (THROWONBADUGID && !fsc[0].gids[gid]) throw new Error('nonexistent gid');
    return fsc[0].fs.lchown(fsc[1], uid, gid);
  }
  chattrSync(path, attrb) {
    let fsc = this.mountNormalize(path);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7) && this.uid != 0) throw new OSFSError('EACCES', 'only owner can change attrs');
    return fsc[0].fs.chattr(path, attrb);
  }
  lchattrSync(path, attrb) {
    let fsc = this.mountNormalize(path, false);
    if (this.uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1], false), 7) && this.uid != 0) throw new OSFSError('EACCES', 'only owner can change attrs');
    return fsc[0].fs.lchattr(path, attrb);
  }
  utimesSync(path, atime, mtime) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].utimesSync(fsc[1], atime, mtime);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
    return fsc[0].fs.utimes(fsc[1], atime, mtime);
  }

  readFileSync(path, options) {
    if (typeof path == 'number') {
      let fdo = this.fd[path];
      if (fdo === undefined) throw new Error('bad file descriptor');
      if (fdo[0] == 'f') return fdo[1].readFileSync(fdo[2], options);
      if (fdo[0].indexOf('r') < 0) throw new Error('file not opened in read mode');
      if (!this.getPerms(fdo[2]).read) throw new OSFSError('EACCES');
      return fdo[1].fs.readFileFD(fdo[2], fdo[3], options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].fs) return fsc[0].readFileSync(fsc[1], options);
      if (!this.getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new OSFSError('EACCES');
      return fsc[0].fs.readFile(fsc[1], options);
    }
  }
  writeFileSync(path, buf, options) {
    if (typeof path == 'number') {
      let fdo = this.fd[path];
      if (fdo === undefined) throw new Error('bad file descriptor');
      if (fdo[0] == 'f') return fdo[1].writeFileSync(fdo[2], buf, options);
      if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
      if (!fdo[1].getPerms(fdo[2]).write) throw new OSFSError('EACCES');
      return fdo[1].fs.writeFileFD(fdo[2], buf, fdo[3], options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].fs) return fsc[0].writeFileSync(fsc[1], buf, options);
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new OSFSError('EACCES');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
      return fsc[0].fs.writeFile(fsc[1], buf, options, fsc[0].uid, fsc[0].gid);
    }
  }
  appendFileSync(path, buf, options) {
    if (typeof path == 'number') {
      let fdo = this.fd[path];
      if (fdo === undefined) throw new Error('bad file descriptor');
      if (fdo[0] == 'f') return fdo[1].appendFileSync(fdo[2], buf, options);
      if (fdo[0].indexOf('a') < 0) throw new Error('file not opened in append mode');
      if (!fdo[1].getPerms(fdo[2]).write) throw new OSFSError('EACCES');
      return fdo[1].appendFileFD(fdo[2], fdo[3], buf, options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].fs) return fsc[0].appendFileSync(fsc[1], buf, options);
      if (!fsc[0].getPerms(this.fs.geteInode(parentPath(fsc[1]))).write) throw new OSFSError('EACCES');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(this.fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
      return fsc[0].fs.appendFile(fsc[1], buf, options, fsc[0].uid, fsc[0].gid);
    }
  }
  truncateSync(path, len) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].truncateSync(fsc[1], len);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new OSFSError('EACCES');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
    return fsc[0].fs.truncate(fsc[1], len);
  }

  createReadStream(path, options) {
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = null;
    if (options.fd === undefined) options.fd = null;
    if (options.autoClose === undefined) options.autoClose = true;
    if (options.end === undefined) options.end = Infinity;
    if (options.highWaterMark === undefined) options.highWaterMark = 65536;
    let fsc = this.mountNormalize(path);
    if (path != null && !fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new OSFSError('EACCES');
    return new VFSReadStream(this, path, options);
  }
  createWriteStream(path, options) {
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.fd === undefined) options.fd = null;
    if (options.mode === undefined) options.mode = 0o666;
    if (options.autoClose === undefined) options.autoClose = true;
    let fsc = this.mountNormalize(path);
    if (path != null && !fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new OSFSError('EACCES');
    if (path != null && fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
    return new VFSWriteStream(this, path, options);
  }

  linkSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf, false);
    let fsct = this.mountNormalize(patht);
    if (!fscf[0].fs || !fsct[0].fs) {
      if (!fscf[0].fs && fsct[0].fs || fscf[0].fs && !fsct[0].fs) throw new Error('EINVAL', 'cannot link to different filesystems');
      return fscf[0].linkSync(fscf[1], fsct[1]);
    }
    if (!Object.is(fscf[0].fs, fsct[0].fs)) throw new Error('EINVAL', 'cannot link to different filesystems');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1], false)).read) throw new OSFSError('EACCES');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new OSFSError('EACCES');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new OSFSError('EACCES');
    return fscf[0].fs.link(fscf[1], fsct[1]);
  }
  unlinkSync(path) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].unlinkSync(fsc[1]);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new OSFSError('EACCES');
    return fsc[0].fs.unlink(fsc[1]);
  }

  copyFileSync(pathf, patht, flags) {
    if (flags === undefined) flags = 0;
    let fscf = this.mountNormalize(pathf);
    let fsct = this.mountNormalize(patht);
    if (!fscf[0].fs || !fsct[0].fs) {
      if (!fscf[0].fs) return fsct[0].fs.writeFile(fscf[0].readFileSync(fscf[1]), fsct[1]);
      if (!fsct[0].fs) return fsct[0].writeFileSync(fscf[0].fs.readFile(fscf[1]), fsct[1]);
      return fscf[0].copyFileSync(fscf[1], fsct[1]);
    }
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1])).read) throw new OSFSError('EACCES');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new OSFSError('EACCES');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new OSFSError('EACCES');
    if (flags & 1 && fsct[0].fs.exists(fsct[1])) throw new OSFSError('EEXIST');
    if (Object.is(fscf[0].fs, fsct[0].fs)) {
      return fscf[0].fs.copyFile(fscf[1], fsct[1], flags, fscf[0].uid, fscf[0].gid);
    }
    return fsct[0].fs.writeFile(fsct[1], fscf[0].fs.readFile(fscf[1]));
  }

  readlinkSync(path, options) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].readlinkSync(fsc[1]);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new OSFSError('EACCES');
    return fsc[0].fs.readlink(fsc[1], options);
  }

  symlinkSync(pathf, patht, type) {
    let fsct = this.mountNormalize(patht);
    if (!fsct[0].fs) return fsct[0].symlinkSync(pathf, fsct[1], type);
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new OSFSError('EACCES');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new OSFSError('EACCES');
    return fsct[0].fs.symlink(pathf, fsct[1], fsct[0].uid, fsct[0].gid);
  }

  readdirSync(path, options) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].readdirSync(fsc[1], options);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new OSFSError('EACCES');
    return fsc[0].fs.readdir(fsc[1], options);
  }

  mkdirSync(path, options) {
    if (options === undefined) options = {};
    if (options.mode === undefined) options.mode = 0o777;
    let fsc = this.mountNormalize(path);
    if (!fsc[0].fs) return fsc[0].mkdirSync(fsc[1], options);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new OSFSError('EACCES');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new OSFSError('EACCES');
    return fsc[0].fs.mkdir(fsc[1], options, fsc[0].uid, fsc[0].gid);
  }

  renameSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf, false);
    let fsct = this.mountNormalize(patht);
    if (!fscf[0].fs || !fsct[0].fs) {
      if (!fscf[0].fs && fsct[0].fs || fscf[0].fs && !fsct[0].fs) throw new Error('EINVAL', 'cannot rename to different filesystems');
      return fscf[0].renameSync(fscf[1], fsct[1]);
    }
    if (!Object.is(fscf[0].fs, fsct[0].fs)) throw new OSFSError('EINVAL', 'cannot rename to different filesystem');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1], false)).write) throw new OSFSError('EACCES');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new OSFSError('EACCES');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new OSFSError('EACCES');
    return fscf[0].fs.rename(fscf[1], fsct[1]);
  }

  rmdirSync(path) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].fs) return fsc[0].rmdirSync(fsc[1]);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new OSFSError('EACCES');
    return fsc[0].fs.rmdir(fsc[1]);
  }

  realpath(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.realpathSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  access(path, mode, cb) {
    if (cb === undefined) {cb = mode; mode = undefined;}
    setImmediate(() => {
      try {
        this.accessSync(path, mode)
        return cb(undefined);
      } catch (e) {
        return cb(e);
      }
    });
  }
  stat(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.statSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  lstat(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.lstatSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  chmod(path, mode, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.chmodSync(path, mode));
      } catch (e) {
        return cb(e);
      }
    });
  }
  lchmod(path, mode, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.lchmodSync(path, mode));
      } catch (e) {
        return cb(e);
      }
    });
  }
  chown(path, uid, gid, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.chownSync(path, uid, gid));
      } catch (e) {
        return cb(e);
      }
    });
  }
  lchown(path, uid, gid, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.lchownSync(path, uid, gid));
      } catch (e) {
        return cb(e);
      }
    });
  }
  utimes(path, atime, mtime, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.utimesSync(path, atime, mtime));
      } catch (e) {
        return cb(e);
      }
    });
  }

  readFile(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.readFileSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  writeFile(path, buf, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.writeFileSync(path, buf, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  appendFile(path, buf, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.appendFileSync(path, buf, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  truncate(path, len, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.truncateSync(path, len));
      } catch (e) {
        return cb(e);
      }
    });
  }

  link(pathf, patht, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.linkSync(pathf, patht));
      } catch (e) {
        return cb(e);
      }
    });
  }
  unlink(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.unlinkSync(path));
      } catch (e) {
        return cb(e);
      }
    });
  }

  copyFile(pathf, patht, flags, cb) {
    if (cb === undefined) {cb = flags; flags = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.copyFileSync(pathf, patht, flags));
      } catch (e) {
        return cb(e);
      }
    });
  }

  readlink(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.readlinkSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  symlink(pathf, patht, type, cb) {
    if (cb === undefined) {cb = type; type = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.symlinkSync(pathf, patht, type));
      } catch (e) {
        return cb(e);
      }
    });
  }

  readdir(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.readdirSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  mkdir(path, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.mkdirSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  rename(pathf, patht, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.renameSync(pathf, patht));
      } catch (e) {
        return cb(e);
      }
    });
  }

  rmdir(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.rmdirSync(path));
      } catch (e) {
        return cb(e);
      }
    });
  }

  openSync(path, flags, mode) {
    if (flags === undefined) flags = 'r';
    let mn = this.mountNormalize(path);
    if (!mn[0].fs) {
      let n = mn[0].openSync(mn[1], flags, mode);
      return this.addfd(['f', mn[0], n, 0]);
    }
    switch (flags) {
      case 'a':
      case 'as':
        if (!this.existsSync(path)) this.writeFileSync(path, '');
        return this.addfd(['a', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'ax':
        if (this.existsSync(path)) throw new OSFSError('EEXIST');
        this.writeFile(path, '');
        return this.addfd(['a', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'a+':
      case 'as+':
        if (!this.existsSync(path)) this.writeFileSync(path, '');
        return this.addfd(['ra', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'ax+':
        if (this.existsSync(path)) throw new OSFSError('EEXIST');
        this.writeFileSync(path, '');
        return this.addfd(['ra', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'r':
        if (!this.existsSync(path)) throw new OSFSError('ENOENT');
        return this.addfd(['r', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'r+':
      case 'rs+':
        if (!this.existsSync(path)) throw new OSFSError('ENOENT');
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'w':
        this.writeFileSync(path, '');
        return this.addfd(['w', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'wx':
        if (this.existsSync(path)) throw new OSFSError('EEXIST');
        return this.addfd(['w', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'w+':
        this.writeFileSync(path, '');
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'wx+':
        if (this.existsSync(path)) throw new OSFSError('EEXIST');
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
    }
  }
  closeSync(fd) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') fdo[1].closeSync(fdo[2]);
    delete this.fd[fd];
    while (this.fd[this.fd.length - 1] === undefined && this.fd.length > 0) this.fd.splice(this.fd.length - 1, 1);
  }

  open(path, flags, mode, cb) {
    if (cb === undefined) {
      if (mode === undefined) {cb = flags; flags = undefined; mode = undefined;}
      else {cb = mode; mode = undefined;}
    }
    setImmediate(() => {
      try {
        return cb(undefined, this.openSync(path, flags, mode));
      } catch (e) {
        return cb(e);
      }
    });
  }
  close(fd, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.closeSync(fd));
      } catch (e) {
        return cb(e);
      }
    });
  }

  readSync(fd, buffer, offset, length, position) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].readSync(fdo[2], buffer, offset, length, position);
    if (fdo[0].indexOf('r') < 0) throw new Error('file not opened in read mode');
    if (!fdo[1].getPerms(fdo[2]).read) throw new OSFSError('EACCES');
    let res = fdo[1].fs.read(fdo[2], fdo[3], buffer, offset, length, position);
    if (position == null) fdo[3] += res;
    return res;
  }
  writeSync(fd, buffer, offset, length, position) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].writeSync(fdo[2], buffer, offset, length, position);
    if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
    if (!fdo[1].getPerms(fdo[2]).write) throw new OSFSError('EACCES');
    let res;
    if (typeof buffer == 'string') {
      res = fdo[1].fs.writeStr(fdo[2], fdo[3], buffer, offset, length);
      if (offset == null) fdo[3] += res;
    } else {
      res = fdo[1].fs.write(fdo[2], fdo[3], buffer, offset, length, position);
      if (position == null) fdo[3] += res;
    }
    return res;
  }

  fstatSync(fd, options) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].fstatSync(fdo[2], options);
    if (!fdo[1].getPerms(fdo[2]).read) throw new OSFSError('EACCES');
    return fdo[1].fs.statFD(fdo[2], options);
  }

  fchmodSync(fd, mode) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].fchmodSync(fdo[2], mode);
    if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return fdo[1].fs.chmodFD(fdo[2], mode);
  }
  fchownSync(fd, uid, gid) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].fchownSync(fdo[2], uid, gid);
    if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return fdo[1].fs.chownFD(fdo[2], uid, gid);
  }
  futimesSync(fd, atime, mtime) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].futimesSync(fdo[2], atime, mtime);
    if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return fdo[1].fs.utimesFD(fdo[2], atime, mtime);
  }

  ftruncateSync(fd, len) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (fdo[0] == 'f') return fdo[1].ftruncateSync(fdo[2], len);
    if (fdo[0].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return fdo[1].fs.truncateFD(fdo[2], len);
  }

  read(fd, buffer, offset, length, position, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.readSync(fd, buffer, offset, length, position), buffer);
      } catch (e) {
        return cb(e);
      }
    });
  }
  write(fd, buffer, offset, length, position, cb) {
    if (cb === undefined) {cb = position; position = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.writeSync(fd, buffer, offset, length, position), buffer);
      } catch (e) {
        return cb(e);
      }
    });
  }

  fstat(fd, options, cb) {
    if (cb === undefined) {cb = options; options = undefined;}
    setImmediate(() => {
      try {
        return cb(undefined, this.fstatSync(fd, options));
      } catch (e) {
        return cb(e);
      }
    });
  }

  fchmod(fd, mode) {
    setImmediate(() => {
      try {
        return cb(undefined, this.fchmodSync(fd, mode));
      } catch (e) {
        return cb(e);
      }
    });
  }
  fchown(fd, uid, gid) {
    setImmediate(() => {
      try {
        return cb(undefined, this.fchownSync(fd, uid, gid));
      } catch (e) {
        return cb(e);
      }
    });
  }
  futimes(fd, atime, mtime) {
    setImmediate(() => {
      try {
        return cb(undefined, this.futimesSync(fd, atime, mtime));
      } catch (e) {
        return cb(e);
      }
    });
  }

  ftruncate(fd, len) {
    setImmediate(() => {
      try {
        return cb(undefined, this.ftruncateSync(fd, len));
      } catch (e) {
        return cb(e);
      }
    });
  }

  fdatasyncSync(fd) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (!fdo[1].fs) return fdo[1].fdatasyncSync(fdo[2]);
  }
  fsyncSync(fd) {
    let fdo = this.fd[fd];
    if (fdo === undefined) throw new Error('bad file descriptor');
    if (!fdo[1].fs) return fdo[1].fsyncSync(fdo[2]);
  }

  fdatasync(fd, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.fdatasyncSync(fd));
      } catch (e) {
        return cb(e);
      }
    });
  }
  fsync(fd, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.fsyncSync(fd));
      } catch (e) {
        return cb(e);
      }
    });
  }

  fsStat(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new OSFSError('EACCES');
    return fsc[0].fs.fsStat(fsc[1]);
  }

  mount(pathf, typ, fs, patht) {
    if (patht === undefined) patht = '/';
    pathf = normalize(pathf, this.cwd);
    patht = normalize(patht);
    if (patht != '/') patht += '/';
    this.mounts[0].push(pathf);
    this.mounts[1].push(typ);
    this.mounts[2].push(fs);
    this.mounts[3].push(patht);
  }
  unmount(path) {
    let mind = this.mounts[0].indexOf(path);
    if (mind < 0) throw new Error('nonexistent mount path');
    this.mounts[0].splice(mind, 1);
    this.mounts[1].splice(mind, 1);
    this.mounts[2].splice(mind, 1);
    this.mounts[3].splice(mind, 1);
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

module.exports = { FileSystemContext };