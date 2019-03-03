let getcTime, parentPath, pathEnd, normalize, VFSReadStream, VFSWriteStream;
function init(a, b) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
  VFSReadStream = b.VFSReadStream;
  VFSWriteStream = b.VFSWriteStream;
}
class FileSystemContext {
  constructor(fs, opts) {
    if (opts === undefined) opts = {};
    if (opts.cwd === undefined) opts.cwd = '/';
    if (opts.user === undefined) opts.user = 'root';
    if (opts.uids === undefined) opts.uids = ['root'];
    if (opts.gids === undefined) opts.gids = ['root'];
    if (opts.groups === undefined) opts.groups = {};
    if (opts.mounts === undefined) opts.mounts = [[], [], [], []];
    if (opts.fd === undefined) opts.fd = [];
    this.fs = fs;
    this.cwd = opts.cwd;
    this.user = opts.user;
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
            case 0: return this.mounts[2][mind].mountNormalize(this.mounts[3][mind] + crp);
            case 1: return [{fs: this.mounts[2][mind], cwd: '/', getPerms: function () {return {read:1,write:1,execute:1}}}, this.mounts[3][mind] + crp];
            case 2: return [fs, this.mounts[3][mind] + crp];
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
    let uid = this.uids.indexOf(this.user);
    let pl = this.fs.getInod(ino, 6);
    if (uid == this.fs.getInod(ino, 7)) {
      return {read: pl & 0o400 ? 1 : 0, write: pl & 0o200 ? 1 : 0, execute: pl & 0o100 ? 1 : 0};
    }
    let group = false;
    let grp = this.fs.getInod(ino, 8);
    for (let i in this.groups) {
      if (this.groups[i].indexOf(uid) > -1 && parseInt(i) == grp) {
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
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new Error('ERRNO 13 no permission');
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
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).read) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.exists(fsc[1]);
    } catch (e) {
      return false;
    }
  }
  statSync(path, options) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.stat(fsc[1], options);
  }
  lstatSync(path, options) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lstat(fsc[1], options);
  }
  chmodSync(path, mode) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.chmod(fsc[1], mode);
  }
  lchmodSync(path, mode) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lchmod(fsc[1], mode);
  }
  chownSync(path, uid, gid) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    if (!this.uids[uid]) throw new Error('nonexistent uid');
    if (!this.gids[gid]) throw new Error('nonexistent gid');
    return fsc[0].fs.chown(fsc[1], uid, gid);
  }
  lchownSync(path, uid, gid) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new Error('ERRNO 13 no permission');
    if (!this.uids[uid]) throw new Error('nonexistent uid');
    if (!this.gids[gid]) throw new Error('nonexistent gid');
    return fsc[0].fs.lchown(fsc[1], uid, gid);
  }
  chattrSync(path, attrb) {
    let fsc = this.mountNormalize(path);
    let uid = fsc[0].uids.indexOf(fsc[0].user);
    if (uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7)) throw new Error('only owner can change attrs');
    return fsc[0].fs.chattr(path, attrb);
  }
  lchattrSync(path, attrb) {
    let fsc = this.mountNormalize(path, false);
    let uid = fsc[0].uids.indexOf(fsc[0].user);
    if (uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1], false), 7)) throw new Error('only owner can change attrs');
    return fsc[0].fs.lchattr(path, attrb);
  }
  utimesSync(path, atime, mtime) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.utimes(fsc[1], atime, mtime);
  }
  readFileSync(path, options) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path][0].indexOf('r') < 0) throw new Error('file not opened in read mode');
      if (!this.getPerms(this.fd[path][2]).read) throw new Error('ERRNO 13 no permission');
      return this.fd[path][1].fs.readFileFD(this.fd[path][2], this.fd[path][3], options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!this.getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.readFile(fsc[1], options);
    }
  }
  writeFileSync(path, buf, options) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path].indexOf('w') < 0) throw new Error('file not opened in write mode');
      if (!this.fd[path][1].getPerms(this.fd[path][2]).write) throw new Error('ERRNO 13 no permission');
      return this.fd[path][1].fs.writeFileFD(this.fd[path][2], buf, this.fd[path][3], options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.writeFile(fsc[1], buf, options);
    }
  }
  appendFileSync(path, buf, options) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path].indexOf('a') < 0) throw new Error('file not opened in append mode');
      if (!this.fd[path][1].getPerms(this.fd[path][2]).write) throw new Error('ERRNO 13 no permission');
      return this.fd[path][1].appendFileFD(this.fd[path][2], this.fd[path][3], buf, options);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].getPerms(this.fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(this.fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.appendFile(fsc[1], buf, options);
    }
  }
  truncateSync(path, len) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
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
    if (path != null && !fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return new VFSReadStream(this, path, options);
  }
  createWriteStream(path, options) {
    if (options === undefined) options = {};
    if (options.encoding === undefined) options.encoding = 'utf8';
    if (options.fd === undefined) options.fd = null;
    if (options.mode === undefined) options.mode = 0o666;
    if (options.autoClose === undefined) options.autoClose = true;
    let fsc = this.mountNormalize(path);
    if (path != null && !fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (path != null && fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return new VFSWriteStream(this, path, options);
  }
  linkSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf, false);
    let fsct = this.mountNormalize(patht);
    if (!Object.is(fscf.fs, fsct.fs)) throw new Error('cannot link two different filesystems');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1], false)).read) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    return fscf[0].fs.link(fscf[1], fsct[1]);
  }
  unlinkSync(path) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.unlink(fsc[1]);
  }
  copyFileSync(pathf, patht, flags) {
    if (flags === undefined) flags = 0;
    let fscf = this.mountNormalize(pathf);
    let fsct = this.mountNormalize(patht);
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1])).read) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    if (flags & 1 && fsct[0].fs.exists(fsct[1])) throw new Error('file already exists');
    if (Object.is(fscf.fs, fsct.fs)) {
      return fscf[0].fs.copyFile(fscf[1], fsct[1]);
    }
    return fsct[0].fs.writeFile(fsct[1], fscf[0].fs.readFile(fscf[1]));
  }
  readlinkSync(path, options) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.readlink(fsc[1], options);
  }
  symlinkSync(pathf, patht, type) {
    let fsct = this.mountNormalize(patht);
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    return fsct[0].fs.symlink(pathf, fsct[1]);
  }
  readdirSync(path, options) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.readdir(fsc[1], options);
  }
  mkdirSync(path, options) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.mkdir(fsc[1], options);
  }
  renameSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf, false);
    let fsct = this.mountNormalize(patht);
    if (!Object.is(fscf.fs, fsct.fs)) throw new Error('cannot rename to mounted filesystem');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1], false)).write) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    return fscf[0].fs.rename(fscf[1], fsct[1]);
  }
  rmdirSync(path) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new Error('ERRNO 13 no permission');
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
    let mn;
    switch (flags) {
      case 'a':
      case 'as':
        if (!this.existsSync(path)) this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['a', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'ax':
        if (this.existsSync(path)) throw new Error('file already exists');
        this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['a', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'a+':
      case 'as+':
        if (!this.existsSync(path)) this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['ra', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'ax+':
        if (this.existsSync(path)) throw new Error('file already exists');
        this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['ra', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'r':
        if (!this.existsSync(path)) throw new Error('file nonexistent');
        mn = this.mountNormalize(path);
        return this.addfd(['r', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'r+':
      case 'rs+':
        if (!this.existsSync(path)) throw new Error('file nonexistent');
        mn = this.mountNormalize(path);
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'w':
        this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['w', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'wx':
        if (this.existsSync(path)) throw new Error('file already exists');
        mn = this.mountNormalize(path);
        return this.addfd(['w', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'w+':
        this.writeFile(path, '');
        mn = this.mountNormalize(path);
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
      case 'wx+':
        if (this.existsSync(path)) throw new Error('file already exists');
        mn = this.mountNormalize(path);
        return this.addfd(['rw', mn[0], mn[0].fs.geteInode(mn[1]), 0]);
        break;
    }
  }
  closeSync(fd) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
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
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('r') < 0) throw new Error('file not opened in read mode');
    if (!this.getPerms(this.fd[fd][2]).read) throw new Error('ERRNO 13 no permission');
    let res = this.fd[fd][1].fs.read(this.fd[fd][2], this.fd[fd][3], buffer, offset, length, position);
    if (position == null) this.fd[fd][3] += res[0];
    return res;
  }
  writeSync(fd, buffer, offset, length, position) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    if (!this.getPerms(this.fd[fd][2]).write) throw new Error('ERRNO 13 no permission');
    let res;
    if (typeof buffer == 'string') {
      res = this.fd[fd][1].fs.writeStr(this.fd[fd][2], this.fd[fd][3], buffer, offset, length);
      if (offset == null) this.fd[fd][3] += res[0];
    } else {
      res = this.fd[fd][1].fs.write(this.fd[fd][2], this.fd[fd][3], buffer, offset, length, position);
      if (position == null) this.fd[fd][3] += res[0];
    }
    return res;
  }
  fstatSync(fd, options) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('r') < 0) throw new Error('file not opened in read mode');
    if (!this.getPerms(this.fd[fd][2]).read) throw new Error('ERRNO 13 no permission');
    return this.fd[fd][1].fs.statFD(this.fd[fd][2], options);
  }
  fchmodSync(fd, mode) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].fs.chmodFD(this.fd[fd][2], mode);
  }
  fchownSync(fd, uid, gid) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].fs.chownFD(this.fd[fd][2], uid, gid);
  }
  futimesSync(fd, atime, mtime) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].fs.utimesFD(this.fd[fd][2], atime, mtime);
  }
  ftruncateSync(fd, len) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].fs.truncateFD(this.fd[fd][2], len);
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
  fdatasyncSync() {}
  fsyncSync() {}
  fdatasync() {}
  fsync() {}
  mount(pathf, typ, fs, patht) {
    if (patht === undefined) patht = '/';
    pathf = normalize(pathf, this.cwd);
    if (typ == 1) patht = normalize(patht);
    patht.replace(/\/+$/, '');
    patht += '/';
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
  exportSystemRaw() {
    let arr = [...this.fs.exportSystemRaw(), this.cwd, this.user, [], [], {}, []];
    for (var i = 0; i < this.uids.length; i++) arr[6].push(this.uids[i]);
    for (var i = 0; i < this.uids.length; i++) arr[7].push(this.gids[i]);
    Object.assign(arr[8], this.groups);
    for (var i = 0; i < this.fd.length; i++) arr[9].push(this.fd[i]);
    return arr;
  }
  exportSystem() {
    return JSON.stringify(this.exportSystemRaw());
  }
  importSystemRaw(arr) {
    this.fs.importSystemRaw(arr.slice(0, 4));
    this.cwd = arr[4];
    this.user = arr[5];
    this.uids.splice(0, Infinity);
    this.gids.splice(0, Infinity);
    for (var i in this.groups) delete this.groups[i];
    this.fd.splice(0, Infinity);
    for (var i = 0; i < arr[6].length; i++) this.uids.push(arr[6][i]);
    for (var i = 0; i < arr[7].length; i++) this.gids.push(arr[7][i]);
    Object.assign(this.groups, arr[8]);
    for (var i = 0; i < arr[9].length; i++) this.fd.push(arr[9][i]);
  }
  importSystem(str) {
    this.importSystemRaw(JSON.parse(str));
  }
}
module.exports = { FileSystemContext, init };