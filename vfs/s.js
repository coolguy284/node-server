let stream = require('stream');
let { OSFSError } = require('./errors.js');

class VFSReadStream extends stream.Readable {
  constructor(fsc, path, options) {
    super(options);
    this.fsc = fsc;
    this.path = path;
    this.autoClose = options.autoClose;
    if (this.autoClose) this.closed = false;
    if (options.fd === undefined || options.fd === null) {
      this.fd = this.fsc.openSync(path, 'r');
    } else {
      this.fd = options.fd;
    }
    if (options.start) {
      this.len = this.fsc.fstatSync(this.fd).size;
      this.start = Math.min(Math.max(0, options.start), this.len);
      this.end = Math.min(Math.min(this.start, options.end), this.len);
    } else {
      this.len = this.fsc.fstatSync(this.fd).size;
      this.end = Math.min(options.end, this.len);
    }
    this.bytesRead = 0;
  }
  _read(size) {
    if (this.closed) {
      this.push(null);
      return;
    }
    if (this.start) {
      let rv = true;
      while (rv) {
        if (this.start + this.bytesRead + size > this.end) size = this.end - this.start;
        if (size <= 0) {
          this.push(null);
          if (this.autoClose) {
            this.fsc.closeSync(this.fd);
            this.closed = true;
          }
          rv = false;
        } else {
          let buf = Buffer.allocUnsafe(size);
          this.fsc.readSync(this.fd, buf, 0, size, this.start + this.bytesRead);
          this.bytesRead += size;
          size = this._readableState.highWaterMark;
          rv = this.push(buf);
        }
      }
    } else {
      let rv = true;
      while (rv) {
        let buf = Buffer.allocUnsafe(size);
        let len = this.fsc.readSync(this.fd, buf, 0, size);
        if (len < size) {
          this.push(buf.slice(0, len));
          this.bytesRead += len;
          this.push(null);
          if (this.autoClose) {
            this.fsc.closeSync(this.fd);
            this.closed = true;
            return;
          }
        } else {
          this.bytesRead += size;
          size = this._readableState.highWaterMark;
          rv = this.push(buf);
        }
      }
    }
  }
  _destroy(err, cb) {
    if (!this.closed) {
      this.fsc.closeSync(this.fd);
      this.closed = true;
    }
    cb();
  }
}

class VFSWriteStream extends stream.Writable {
  constructor(fsc, path, options) {
    super(options);
    this.fsc = fsc;
    this.path = path;
    this.autoClose = options.autoClose;
    if (this.autoClose) this.closed = false;
    if (options.fd === undefined || options.fd === null) {
      this.fd = this.fsc.openSync(path, 'w');
    } else {
      this.fd = options.fd;
    }
    if (options.start) {
      this.len = this.fsc.fstatSync(this.fd).size;
      this.start = Math.min(Math.max(0, options.start), this.len);
    } else {
      this.len = this.fsc.fstatSync(this.fd).size;
    }
    this.bytesWritten = 0;
  }
  _write(chunk, enc, cb) {
    if (this.closed) { cb(); return; }
    if (this.start) {
      this.fsc.writeSync(this.fd, chunk, 0, chunk.length, this.start + this.bytesWritten);
      this.bytesWritten += chunk.length;
      cb();
    } else {
      this.fsc.writeSync(this.fd, chunk, 0, chunk.length);
      this.bytesWritten += chunk.length;
      cb();
    }
  }
  _destroy(err, cb) {
    if (!this.closed) {
      this.fsc.closeSync(this.fd);
      this.closed = true;
    }
    cb();
  }
  _final(cb) {
    if (!this.closed) {
      this.fsc.closeSync(this.fd);
      this.closed = true;
    }
    cb();
  }
}

class VFSExportRFSStream extends stream.Readable {
  constructor(rfs, options) {
    if (options === undefined) options = {};
    if (options.version === undefined) options.version = 2;
    super(options);
    this.rfs = rfs;
    this.writable = rfs.writable;
    rfs.writable = false;
    this.version = options.version;
    this.part = 0;
    this.i = 0;
    this.keepGoing = true;
  }
  
  pushHeadLegacyV1() {
    let s = this.rfs.exportSystemSizeAdv();
    let head = Buffer.alloc(13);
    head.writeUInt8(this.rfs.writable ? 128 : 0 + this.rfs.wipeonfi ? 64 : 0, 0);
    head.writeUInt32BE(s[1], 1);
    head.writeUInt32BE(s[2], 5);
    head.writeUInt32BE(s[3], 9);
    this.keepGoing = this.push(head);
    this.part = 1;
    this.i = 0;
  }

  pushHead() {
    let s = this.rfs.exportSystemSizeAdv();
    let head = Buffer.alloc(31);
    head.writeUInt8(2, 0);
    head.writeUInt8(this.rfs.writable ? 128 : 0 + this.rfs.wipeonfi ? 64 : 0, 1);
    head.writeUInt8(Math.ceil(Math.log2(this.rfs.blocksize)), 2);
    head.writeUIntBE(this.rfs.maxsize, 3, 6);
    head.writeUInt32BE(this.rfs.maxinodes, 9);
    head.writeUIntBE(s[1], 13, 6);
    head.writeUIntBE(s[2], 19, 6);
    head.writeUIntBE(s[3], 25, 6);
    this.keepGoing = this.push(head);
    this.part = 1;
    this.i = 0;
  }
  pushInod() {
    let buf;
    if (this.rfs.inodarr[i] != null) {
      buf = Buffer.allocUnsafe(this.rfs.inoarr[i].length);
      this.rfs.inodarr[i].copy(buf);
    } else {
      buf = Buffer.allocUnsafe(1);
      buf.writeUInt8(255, 0);
    }
    this.keepGoing = this.push(buf);
    if (i + 1 >= this.rfs.inodarr.length) {
      this.part = 2;
      this.i = 0;
    } else this.i++;
  }
  pushIno() {
    let head = Buffer.allocUnsafe(4);
    if (this.rfs.inoarr[i] != null) {
      head.writeUInt32BE(this.rfs.inoarr[i].length, 0);
      this.keepGoing = this.push(head);
      if (this.rfs.inoarr[i].length > 0) this.keepGoing = this.push(this.rfs.inoarr[i]);
    } else {
      head.writeUInt32BE(0xffffffff, 0);
      this.keepGoing = this.push(head);
    }
    if (i + 1 >= this.rfs.inoarr.length) {
      this.part = 3;
      this.i = 0;
    } else this.i++;
  }
  pushFi() {
    let buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(this.rfs.fi[this.i], 0);
    this.keepGoing = this.push(buf);
    if (i + 1 >= this.rfs.fi.length) {
      this.part = 4;
      this.i = 0;
    } else this.i++;
  }
  
  _read(size) {
    if (this.version == 1) {
      while (this.keepGoing) {
        if (this.part == 0) this.pushHeadLegacyV1();
        else if (this.part == 1) this.pushInod();
        else if (this.part == 2) this.pushIno();
        else if (this.part == 3) this.pushFi();
        } else if (this.part == 4) {
          this.push(null);
          this.rfs.writable = this.writable;
          this.part = 5;
        } else this.push(null);
      }
    } else if (this.version == 2) {
      while (this.keepGoing) {
        if (this.part == 0) this.pushHead();
        else if (this.part == 1) this.pushInod();
        else if (this.part == 2) this.pushIno();
        else if (this.part == 3) this.pushFi();
        } else if (this.part == 4) {
          this.push(null);
          this.rfs.writable = this.writable;
          this.part = 5;
        } else this.push(null);
      }
    }
  }
  _destroy(err, cb) {
    this.rfs.writable = this.writable;
    cb();
  }
}

class VFSImportRFSStream extends stream.Writable {
  constructor(rfs, options) {
    if (!rfs.writable && rfs.writable != null) throw new OSFSError('EROFS');
    super(options);
    this.rfs = rfs;
    this.writable = rfs.writable;
    rfs.writable = false;
    this.version = options && options.version;
    this.part = 0;
    this.i = 0;
    this.tempbuf = null;
    this.notenough = true;
  }
}

module.exports = { VFSReadStream, VFSWriteStream, VFSExportRFSStream, VFSImportRFSStream };