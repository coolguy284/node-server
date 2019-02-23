let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystemContext {
  constructor(fs, opts) {
    if (opts === undefined) opts = {};
    if (opts.cwd === undefined) opts.cwd = '/';
    if (opts.user === undefined) opts.user = 'root';
    if (opts.mounts === undefined) opts.mounts = [[], [], [], []];
    if (opts.fd === undefined) opts.fd = [];
    this.fs = fs;
    this.cwd = opts.cwd;
    this.user = opts.user;
    this.mounts = opts.mounts;
    this.fd = opts.fd;
  }
  mountNormalize(path, symlink, cwd) {
    if (symlink === undefined) symlink = true;
    if (cwd === undefined) cwd = this.cwd;
    path = path.replace(/\\/g, '/');
    if (path[0] == '/') path = path[0] + path.slice(1, Infinity).replace(/\/*$/, '');
    else path = path.replace(/\/*$/, '');
    path = normalize(path, cwd);
    let patharr = path.split('/');
    for (let i in patharr) {
      let cp = patharr.slice(0, parseInt(i) + 1).join('/');
      let crp = patharr.slice(parseInt(i) + 1, Infinity).join('/');
      let mind = this.mounts[0].indexOf(cp);
      if (mind > -1) {
        switch (this.mounts[1][mind]) {
          case 0: return this.mounts[2][mind].mountNormalize(this.mounts[3][mind] + crp);
          case 1: return [{fs: this.mounts[2][mind], cwd: '/', getPerms: function () {return {read:1,write:1,execute:1}}}, this.mounts[3][mind] + crp];
          case 2: return [fs, this.mounts[3][mind] + crp];
        }
      }
      if (parseInt(i) != patharr.length - 1 || symlink) {
        let ino = this.fs.getInode(cp, false);
        if (ino != null) {
          if (this.fs.getInod(ino, 0) == 12) {
            return this.mountNormalize(this.fs.inoarr[ino].toString(), symlink, parentPath(cp));
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
    let uid = this.fs.uids.indexOf(this.user);
    let pl = this.fs.getInod(ino, 6);
    if (uid == this.fs.getInod(ino, 7)) {
      return {read: pl & 0o400 ? 1 : 0, write: pl & 0o200 ? 1 : 0, execute: pl & 0o100 ? 1 : 0};
    }
    let group = false;
    let grp = this.fs.getInod(ino, 8);
    for (let i in this.fs.groups) {
      if (this.fs.groups[i].indexOf(uid) > -1 && parseInt(i) == grp) {
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
  existsSync(path) {
    let fsc = this.mountNormalize(path);
    try {
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).read) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.exists(fsc[1]);
    } catch (e) {
      return false;
    }
  }
  statSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.stat(fsc[1]);
  }
  lstatSync(path) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lstat(fsc[1]);
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
    return fsc[0].fs.chown(fsc[1], uid, gid);
  }
  lchownSync(path, uid, gid) {
    let fsc = this.mountNormalize(path, false);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1], false)).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lchown(fsc[1], uid, gid);
  }
  chattrSync(path, attrb) {
    let fsc = this.mountNormalize(path);
    let uid = fsc[0].fs.uids.indexOf(fsc[0].user);
    if (uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1]), 7)) throw new Error('only owner can change attrs');
    return fsc[0].fs.chattr(path, attrb);
  }
  lchattrSync(path, attrb) {
    let fsc = this.mountNormalize(path, false);
    let uid = fsc[0].fs.uids.indexOf(fsc[0].user);
    if (uid != fsc[0].fs.getInod(fsc[0].fs.geteInode(fsc[1], false), 7)) throw new Error('only owner can change attrs');
    return fsc[0].fs.lchattr(path, attrb);
  }
  utimesSync(path, atime, mtime) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.utimes(fsc[1], atime, mtime);
  }
  readFileSync(path) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path].indexOf('r') < 0) throw new Error('file not opened in read mode');
      return this.fd[path][1].readFileSync(this.fd[path][2]);
    } else {
      let fsc = this.mountNormalize(path);
      if (!this.getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.readFile(fsc[1]);
    }
  }
  writeFileSync(path, buf) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path].indexOf('w') < 0) throw new Error('file not opened in write mode');
      return this.fd[path][1].writeFileSync(this.fd[path][2], buf);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.writeFile(fsc[1], buf);
    }
  }
  appendFileSync(path, buf) {
    if (typeof path == 'number') {
      if (this.fd[path] === undefined) throw new Error('bad file descriptor');
      if (this.fd[path].indexOf('a') < 0) throw new Error('file not opened in append mode');
      return this.fd[path][1].appendFileSync(this.fd[path][2], buf);
    } else {
      let fsc = this.mountNormalize(path);
      if (!fsc[0].getPerms(this.fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
      if (fsc[0].fs.exists(fsc[1]))
      if (!fsc[0].getPerms(this.fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
      return fsc[0].fs.appendFile(fsc[1], buf);
    }
  }
  truncateSync(path, len) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.truncate(fsc[1], len);
  }
  createReadStream(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.createReadStream(fsc[1]);
  }
  createWriteStream(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.createWriteStream(fsc[1]);
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
  copyFileSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf);
    let fsct = this.mountNormalize(patht);
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1])).read) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
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
  symlinkSync(pathf, patht) {
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
  mkdirSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.mkdir(fsc[1]);
  }
  renameSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf, false);
    let fsct = this.mountNormalize(patht);
    if (!Object.is(fscf.fs, fsct.fs)) throw new Error('cannot rename to mounted filesystem');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[0], false)).write) throw new Error('ERRNO 13 no permission');
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
  stat(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.statSync(path));
      } catch (e) {
        return cb(e);
      }
    });
  }
  lstat(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.lstatSync(path));
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
  readFile(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.readFileSync(path));
      } catch (e) {
        return cb(e);
      }
    });
  }
  writeFile(path, buf, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.writeFileSync(path, buf));
      } catch (e) {
        return cb(e);
      }
    });
  }
  appendFile(path, buf, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.appendFileSync(path, buf));
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
  copyFile(pathf, patht, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.copyFileSync(pathf, patht));
      } catch (e) {
        return cb(e);
      }
    });
  }
  readlink(path, options, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.readlinkSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  symlink(pathf, patht, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.symlinkSync(pathf, patht));
      } catch (e) {
        return cb(e);
      }
    });
  }
  readdir(path, options, cb) {
    if (cb === undefined) cb = options;
    setImmediate(() => {
      try {
        return cb(undefined, this.readdirSync(path, options));
      } catch (e) {
        return cb(e);
      }
    });
  }
  mkdir(path, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.mkdirSync(path));
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
    switch (flags) {
      case 'a':
      case 'as':
        if (!this.existsSync(path)) this.writeFile(path, '');
        return this.addfd(['a', ...this.mountNormalize(path)]);
        break;
      case 'ax':
        if (this.existsSync(path)) throw new Error('file already exists');
        this.writeFile(path, '');
        return this.addfd(['a', ...this.mountNormalize(path)]);
        break;
      case 'a+':
      case 'as+':
        if (!this.existsSync(path)) this.writeFile(path, '');
        return this.addfd(['ra', ...this.mountNormalize(path)]);
        break;
      case 'ax+':
        if (this.existsSync(path)) throw new Error('file already exists');
        this.writeFile(path, '');
        return this.addfd(['ra', ...this.mountNormalize(path)]);
        break;
      case 'r':
        if (!this.existsSync(path)) throw new Error('file nonexistent');
        return this.addfd(['r', ...this.mountNormalize(path)]);
        break;
      case 'r+':
      case 'rs+':
        if (!this.existsSync(path)) throw new Error('file nonexistent');
        return this.addfd(['rw', ...this.mountNormalize(path)]);
        break;
      case 'w':
        this.writeFile(path, '');
        return this.addfd(['w', ...this.mountNormalize(path)]);
        break;
      case 'wx':
        if (this.existsSync(path)) throw new Error('file already exists');
        return this.addfd(['w', ...this.mountNormalize(path)]);
        break;
      case 'w+':
        this.writeFile(path, '');
        return this.addfd(['rw', ...this.mountNormalize(path)]);
        break;
      case 'wx+':
        if (this.existsSync(path)) throw new Error('file already exists');
        return this.addfd(['rw', ...this.mountNormalize(path)]);
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
      if (mode === undefined) cb = flags;
      else cb = mode;
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
  fstatSync(fd) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('r') < 0) throw new Error('file not opened in read mode');
    return this.fd[fd][1].statSync(this.fd[fd][2]);
  }
  fchmodSync(fd, mode) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].lchmodSync(this.fd[fd][2], mode);
  }
  fchownSync(fd, uid, gid) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].lchownSync(this.fd[fd][2], uid, gid);
  }
  futimesSync(fd, atime, mtime) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].utimesSync(this.fd[fd][2], atime, mtime);
  }
  ftruncateSync(fd, len) {
    if (this.fd[fd] === undefined) throw new Error('bad file descriptor');
    if (this.fd[fd].indexOf('w') < 0) throw new Error('file not opened in write mode');
    return this.fd[fd][1].truncateSync(this.fd[fd][2], len);
  }
  fstat(fd, cb) {
    setImmediate(() => {
      try {
        return cb(undefined, this.fstatSync(fd));
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
}
module.exports = {FileSystemContext, init};