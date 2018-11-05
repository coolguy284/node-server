// jshint -W041
class FileSystem {
  constructor(writable, inoarr, inodarr, fi) {
    if (writable === undefined) {
      writable = false;
    }
    if (inoarr === undefined) {
      inoarr = [new Buffer(0)];
    }
    if (inodarr === undefined) {
      inodarr = [['d']];
    }
    if (fi === undefined) {
      fi = [];
    }
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
      this.inoarr.push(new Buffer(0));
      this.inodarr.push([typ]);
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
  createFile(path, typ) {
    let patharr = path.split('/');
    let ino = this.popfi(typ);
    this.appendFileSync(patharr.slice(0, patharr.length - 1).join('/'), new Buffer(patharr[patharr.length - 1] + ':' + ino));
    return ino;
  }
  getcInode(path, typ) {
    try {
      return this.getInode(path);
    } catch (e) {
      return this.createFile(path, typ);
    }
  }
  existsSync(path) {
    return this.getInode(path) != null;
  }
  readFileSync(path) {
    let ino = this.getInode(path);
    if (ino == null) {
      throw new Error('ENOENT no such file or directory: ' + patharr.slice(0, i).join('/'));
    }
    return new Buffer(this.inoarr[ino]);
  }
  writeFileSync(path, buf) {
    if (this.writable) {
      if (typeof buf == 'string') {
        buf = new Buffer(buf);
      }
      let ino = this.getcInode(path, 'f');
      this.inoarr[ino] = new Buffer(buf);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  appendFileSync(path, buf) {
    if (this.writable) {
      if (typeof buf == 'string') {
        buf = new Buffer(buf);
      }
      let ino = this.getcInode(path, 'f');
      this.inoarr[ino] = Buffer.concat([this.inoarr[ino], buf]);
    } else {
      throw new Error('read-only filesystem');
    }
  }
  copySync(pathf, patht) {
    if (this.writable) {
      let inof = this.getInode(pathf);
      if (inof == null) {
        throw new Error('ENOENT no such file or directory: ' + patharr.slice(0, i).join('/'));
      }
      let inot = this.getcInode(patht);
      this.inoarr[inot] = new Buffer(this.inoarr[inof]);
    } else {
      throw new Error('read-only filesystem');
    }
  }
}
module.exports = {
  'FileSystem' : FileSystem,
  'fs' : new FileSystem(true)
};
module.exports.fs.writeFileSync('/tex.txt', new Buffer('ell'));