// jshint -W041
function getcTime() {
  return new Date().getTime();
}
function parentPath(path) {
  if (path == '/') return '/';
  let patharr = path.split('/');
  return patharr.slice(0, patharr.length - 1).join('/');
}
function pathEnd(path) {
  let patharr = path.split('/');
  return patharr[patharr.length - 1];
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
    }
    if (fi === undefined) fi = [];
    if (groups === undefined) groups = {};
    this.writable = writable;
    this.inoarr = inoarr;
    this.inodarr = inodarr;
    this.fi = fi;
  }
  parseFolder(buf) {
    return buf.toString().split('\n').map(x => x.split(':'));
  }
  popfi(typ) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (this.fi.length > 0) {
      let ino = this.fi.splice(0, 1)[0];
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
  geteInode(path) {
    let rv = this.getInode(path);
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
  getcInode(path, typ) {
    let ino = this.getInode(path);
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
  chmod(path, mode) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path);
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
  lchmod(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    this.inodarr[ino][5] = mode;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  lchown(path, user, group) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (mode < 0 && mode > 0o777) throw new Error('invalid permission mode');
    let ino = this.geteInode(path, false);
    this.inodarr[ino][5] = mode;
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
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
  appendFile(path, buf) {
    if (!this.writable) throw new Error('read-only filesystem');
    if (typeof buf == 'string') buf = Buffer.from(buf);
    let ino = this.getcInode(path, 'f');
    this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    let ctime = getcTime();
    this.inodarr[ino][3] = ctime;
    this.inodarr[ino][4] = ctime;
  }
  copyFile(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inof = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    let inot = this.getcInode(patht, 'f');
    this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    this.inodarr[inof][4] = this.inodarr[inot][2];
  }
  link(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.inodarr[ino][1]++;
  }
  unlink(path) {
    if (!this.writable) throw new Error('read-only filesystem');
    let inop = this.geteInode(parentPath(path));
    let ino = this.geteInode(path);
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
  mkdir(path) {
    this.createFile(path, 'd');
  }
  readdir(path) {
    let ino = this.geteInode(path);
    if (this.writable) this.inodarr[ino][4] = getcTime();
    return this.parseFolder(this.inoarr[ino]);
  }
  readlink(path, options) {
    let ino = this.geteInode(path, false);
    if (this.inodarr[ino][0] != 's') throw new Error('path not a symbolic link');
    if (this.writable) this.inodarr[ino][4] = getcTime();
    if (!options) return this.inoarr[ino].toString();
    else if (options.encoding == 'buffer') return Buffer.from(this.inoarr[ino]);
    else return this.inoarr[ino].toString(options.encoding);
  }
  rename(pathf, patht) {
    if (!this.writable) throw new Error('read-only filesystem');
    let ino = this.geteInode(pathf);
    if (this.exists(patht)) this.unlink(patht);
    this.appendFolder(this.geteInode(parentPath(patht)), pathEnd(patht), ino);
    this.unlink(pathf);
  }
  // rmdir :(
  symlink(target, path) {
    if (this.exists(path)) this.unlink(path);
    let ino = this.getcInode(path, 's');
    this.inoarr[ino] = Buffer.from(target);
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
    if (ino === null) {
      return {read: 0, write: 0, execute: 0};
    }
    let pl = this.fs.inodarr[ino][5];
    return {};
  }
  normalize(path) {
    if (path[0] != '/') path = this.cwd + path;
    let patharr = path.split('/');
    let bp = [];
    for (let i in patharr) {
      
    }
  }
  existsSync(path) {
    path = this.normalize(path);
    this.getPerms(this.fs.getInode(parentPath(path)));
  }
}
function SecureView(view) {
  return {
    get cwd() {
      return view.cwd;
    },
    existsSync: view.existsSync
  };
}
let rawfs = new FileSystem(true);
let fs = new FileSystemView(rawfs);
module.exports = {
  helperf: {
    getcTime: getcTime,
    parentPath: parentPath,
    pathEnd: pathEnd
  },
  FileSystem: FileSystem,
  FileSystemView: FileSystemView,
  SecureView: SecureView,
  rawfs: rawfs,
  fs: fs,
};
rawfs.writeFile('/tex.txt', Buffer.from('ell'));