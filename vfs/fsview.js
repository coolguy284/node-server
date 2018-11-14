let getcTime, parentPath, pathEnd, normalize;
function init(a) {
  getcTime = a.getcTime;
  parentPath = a.parentPath;
  pathEnd = a.pathEnd;
  normalize = a.normalize;
}
class FileSystemView {
  constructor(fs, cwd, user) {
    if (cwd === undefined) cwd = '';
    if (user === undefined) user = 'root';
    this.fs = fs;
    this.cwd = cwd;
    this.user = user;
  }
  getPerms(ino, user) {
    let pl = this.fs.inodarr[ino][5];
    if (user == this.fs.inodarr[ino][6]) {
      return {read: pl & 0o400 ? 1 : 0, write: pl & 0o200 ? 1 : 0, execute: pl & 0o100 ? 1 : 0};
    }
    let group = false;
    for (let i in this.fs.groups) {
      if (this.fs.groups[i].indexOf(user) > 1 && i == this.fs.inodarr[ino][7]) {
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
  setCWD(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    this.cwd = path;
  }
  existsSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).read) throw new Error('ERRNO 13 no permission');
    return this.fs.exists(path);
  }
  statSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.stat(path);
  }
  lstatSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.lstat(path);
  }
  chmodSync(path, mode) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.chmod(path, mode);
  }
  lchmodSync(path, mode) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.lchmod(path, mode);
  }
  chownSync(path, user, group) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.chown(path, user, group);
  }
  lchownSync(path, user, group) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.lchown(path, user, group);
  }
  utimesSync(path, atime, mtime) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.utimes(path, atime, mtime);
  }
  readFileSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.readFile(path);
  }
  writeFileSync(path, buf) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(path))
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.writeFile(path, buf);
  }
  appendFileSync(path, buf) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(path))
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.appendFile(path, buf);
  }
  truncateSync(path, len) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(path))
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.truncate(path, len);
  }
  createReadStream(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.createReadStream(path);
  }
  createWriteStream(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(path))
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.createWriteStream(path);
  }
  linkSync(pathf, patht) {
    pathf = normalize(pathf, this.cwd);
    patht = normalize(patht, this.cwd);
    if (!this.getPerms(this.fs.geteInode(pathf)).read) throw new Error('ERRNO 13 no permission');
    if (!this.getPerms(this.fs.geteInode(parentPath(patht))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(patht))
    if (!this.getPerms(this.fs.geteInode(patht)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.link(pathf, patht);
  }
  unlinkSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.unlink(path);
  }
  copyFileSync(pathf, patht) {
    pathf = normalize(pathf, this.cwd);
    patht = normalize(patht, this.cwd);
    if (!this.getPerms(this.fs.geteInode(pathf)).read) throw new Error('ERRNO 13 no permission');
    if (!this.getPerms(this.fs.geteInode(parentPath(patht))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(patht))
    if (!this.getPerms(this.fs.geteInode(patht)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.copyFile(pathf, patht);
  }
  readlinkSync(path, options) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path, false)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.readlink(path, options);
  }
  symlinkSync(pathf, patht) {
    patht = normalize(patht, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(patht))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(patht))
    if (!this.getPerms(this.fs.geteInode(patht)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.symlinkSync(pathf, patht);
  }
  readdirSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(path)).read) throw new Error('ERRNO 13 no permission');
    return this.fs.readdir(path);
  }
  mkdirSync(path) {
    path = normalize(path, this.cwd);
    if (!this.getPerms(this.fs.geteInode(parentPath(path))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(path))
    if (!this.getPerms(this.fs.geteInode(path)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.mkdir(path);
  }
  renameSync(pathf, patht) {
    pathf = normalize(pathf, this.cwd);
    patht = normalize(patht, this.cwd);
    if (!this.getPerms(this.fs.geteInode(pathf)).write) throw new Error('ERRNO 13 no permission');
    if (!this.getPerms(this.fs.geteInode(parentPath(patht))).write) throw new Error('ERRNO 13 no permission');
    if (this.fs.exists(patht))
    if (!this.getPerms(this.fs.geteInode(patht)).write) throw new Error('ERRNO 13 no permission');
    return this.fs.rename(pathf, patht);
  }
}
module.exports = {FileSystemView, init};