let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystemContext {
  constructor(fs, cwd, user, mounts) {
    if (cwd === undefined) cwd = '/';
    if (user === undefined) user = 'root';
    if (mounts === undefined) mounts = [[], [], [], []];
    this.fs = fs;
    this.cwd = cwd;
    this.user = user;
    this.mounts = mounts;
  }
  mountNormalize(path) {
    path = normalize(path, this.cwd);
    let patharr = path.split('/');
    for (let i in patharr) {
      let cp = patharr.slice(0, parseInt(i) + 1).join('/');
      let crp = patharr.slice(parseInt(i) + 1, Infinity).join('/');
      let mind = this.mounts[0].indexOf(cp);
      if (mind > -1) {
        switch (this.mounts[1][mind]) {
          case 0: return this.mounts[2][mind].mountNormalize(this.mounts[3][mind] + crp);
          case 1: return [{fs: this.mounts[2][mind], cwd: '/'}, this.mounts[3][mind] + crp];
          case 2: return [fs, this.mounts[3][mind] + crp];
        }
      }
    }
    path = normalize(path, this.cwd);
    return [this, path];
  }
  getPerms(ino) {
    let uid = this.fs.uids.indexOf(this.user);
    let pl = this.fs.getInod(ino, 5);
    if (uid == this.fs.getInod(ino, 6)) {
      return {read: pl & 0o400 ? 1 : 0, write: pl & 0o200 ? 1 : 0, execute: pl & 0o100 ? 1 : 0};
    }
    let group = false;
    let grp = this.fs.getInod(ino, 7);
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
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
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
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lstat(fsc[1]);
  }
  chmodSync(path, mode) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.chmod(fsc[1], mode);
  }
  lchmodSync(path, mode) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lchmod(fsc[1], mode);
  }
  chownSync(path, user, group) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.chown(fsc[1], user, group);
  }
  lchownSync(path, user, group) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.lchown(fsc[1], user, group);
  }
  utimesSync(path, atime, mtime) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.utimes(fsc[1], atime, mtime);
  }
  readFileSync(path) {
    let fsc = this.mountNormalize(path);
    if (!this.getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.readFile(fsc[1]);
  }
  writeFileSync(path, buf) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.writeFile(fsc[1], buf);
  }
  appendFileSync(path, buf) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(this.fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(this.fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.appendFile(fsc[1], buf);
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
    let fscf = this.mountNormalize(pathf);
    let fsct = this.mountNormalize(patht);
    if (!Object.is(fscf.fs, fsct.fs)) throw new Error('cannot link to mounted filesystem');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[1])).read) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    return fscf[0].fs.link(fscf[1], fsct[1]);
  }
  unlinkSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
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
    let fsc = this.mountNormalize(path);
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
  readdirSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).read) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.readdir(fsc[1]);
  }
  mkdirSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(parentPath(fsc[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsc[0].fs.exists(fsc[1]))
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.mkdir(fsc[1]);
  }
  renameSync(pathf, patht) {
    let fscf = this.mountNormalize(pathf);
    let fsct = this.mountNormalize(patht);
    if (!Object.is(fscf.fs, fsct.fs)) throw new Error('cannot rename to mounted filesystem');
    if (!fscf[0].getPerms(fscf[0].fs.geteInode(fscf[0])).write) throw new Error('ERRNO 13 no permission');
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(parentPath(fsct[1]))).write) throw new Error('ERRNO 13 no permission');
    if (fsct[0].fs.exists(fsct[1]))
    if (!fsct[0].getPerms(fsct[0].fs.geteInode(fsct[1])).write) throw new Error('ERRNO 13 no permission');
    return fscf[0].fs.rename(fscf[1], fsct[1]);
  }
  rmdirSync(path) {
    let fsc = this.mountNormalize(path);
    if (!fsc[0].getPerms(fsc[0].fs.geteInode(fsc[1])).write) throw new Error('ERRNO 13 no permission');
    return fsc[0].fs.rmdir(fsc[1]);
  }
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