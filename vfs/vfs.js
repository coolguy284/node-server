// jshint -W041
function getcTime() {
  return new Date().getTime();
}
function parentPath(path) {
  if (path == '/') return '/';
  let patharr = path.split('/');
  return patharr.slice(0, patharr.length - 1).join('/');
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
    if (!this.writable) {
      throw new Error('read-only filesystem');
    }
    if (this.fi.length > 0) {
      return this.fi.splice(0, 1)[0];
    } else {
      let ctime = getcTime();
      this.inoarr.push(Buffer.alloc(0));
      this.inodarr.push([typ, 0, ctime, ctime, ctime, 0o777, 'root', 'root']);
      return this.inoarr.length - 1;
    }
  }
  getInode(path) {
    if (path == '/') {
      return 0;
    } else if (/<[0-9]{1,}>/.test(path)) {
      return parseInt(path.substring(1, path.length - 1));
    }
    let ino = 0;
    let patharr = path.split('/');
    if (patharr[0] == '') {
      patharr.splice(0, 1);
      for (let i in patharr) {
        if (this.inodarr[ino][0] != 'd' && this.inodarr[ino][0] != 'sd') {
          throw new Error(patharr.slice(0, i).join('/') + ' not a directory');
        }
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
      }
      return ino;
    }
  }
  geteInode(path) {
    let rv = this.getInode(path);
    if (rv === null) {
      throw new Error('ENOENT no such file or directory: ' + path);
    }
    return rv;
  }
  createFile(path, typ) {
    let patharr = path.split('/');
    let ino = this.popfi(typ);
    this.appendFolder(this.geteInode(parentPath(path)), patharr[patharr.length - 1], ino);
    this.inodarr[ino][1]++;
    return ino;
  }
  getcInode(path, typ) {
    try {
      return this.getInode(path);
    } catch (e) {
      return this.createFile(path, typ);
    }
  }
  appendFolder(ino, nam, inot) {
    if (this.writable) {
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino], Buffer.from(nam + ':' + inot)]);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  exists(path) {
    return this.getInode(path) != null;
  }
  chmod(path, mode) {
    if (!this.writable) {
      throw new Error('read-only filesystem');
    }
    if (mode >= 0 && mode <= 0o777) {
      let ino = this.geteInode(path);
      this.inodarr[ino][5] = mode;
    }
  }
  chown(path, user, group) {
    if (!this.writable) {
      throw new Error('read-only filesystem');
    }
    let ino = this.geteInode(path);
    this.inodarr[ino][6] = user;
    this.inodarr[ino][7] = user;
  }
  readFile(path) {
    let ino = this.geteInode(path);
    return Buffer.from(this.inoarr[ino]);
  }
  writeFile(path, buf) {
    if (this.writable) {
      let ino = this.getcInode(path, 'f');
      this.inoarr[ino] = Buffer.from(buf);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  createReadStream(path) {
    let s = new datajs.s.BufReadStream(this.inoarr[this.geteInode(path)]);
    return s;
  }
  createWriteStream(path) {
    if (!this.writable) {
      throw new Error('read-only filesystem');
    }
    let s = new datajs.s.BufWriteStream(undefined, true);
    s.on('finish', function () {
      this.inoarr[this.getcInode(path, 'f')] = s.ibuf;
    });
    return s;
  }
  appendFile(path, buf) {
    if (this.writable) {
      if (typeof buf == 'string') {
        buf = Buffer.from(buf);
      }
      let ino = this.getcInode(path, 'f');
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  copyFile(pathf, patht) {
    if (this.writable) {
      let inof = this.geteInode(pathf);
      let inot = this.getcInode(patht, 'f');
      this.inoarr[inot] = Buffer.from(this.inoarr[inof]);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  link(pathf, patht) {
    let ino = this.geteInode(pathf);
    let patharr = patht.split('/');
    if (this.exists(patht)) throw new Error('path already exists');
    this.appendFolder(this.geteInode(parentPath(patht)), patharr[patharr.length - 1], ino);
    this.inodarr[ino][1]++;
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
    parentPath: parentPath
  },
  FileSystem: FileSystem,
  FileSystemView: FileSystemView,
  SecureView: SecureView,
  rawfs: rawfs,
  fs: fs,
};
rawfs.writeFile('/tex.txt', Buffer.from('ell'));