class VFSReadStream extends stream.Readable {
  constructor(fsc, path, options) {
    super(options);
    this.fsc = fsc;
    this.path = path;
    this.autoClose = options.autoClose;
    if (this.autoClose) this.closed = false;
    if (options.fd === undefined) {
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
        if (this.start + size > this.end) size = this.end - this.start;
        if (size == 0) {
          this.push(null);
          if (this.autoClose) {
            this.fsc.closeSync(this.fd);
            this.closed = true;
          }
          rv = false;
        } else {
          let buf = Buffer.allocUnsafe(size);
          this.fsc.readSync(this.fd, buf, 0, size, this.start);
          this.start += size;
          this.bytesRead += size;
          rv = this.push(buf);
        }
      }
    } else {
      let rv = true;
      while (rv) {
        let buf = Buffer.allocUnsafe(size);
        let len = this.fsc.readSync(this.fd, buf, 0, size, this.start);
        if (len < size) {
          this.push(buf.slice(0, len));
          this.bytesRead += len;
          this.push(null);
          if (this.autoClose) {
            this.fsc.closeSync(this.fd);
            this.closed = true;
          }
        } else {
          rv = this.push(buf);
          this.bytesRead += size;
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
    if (options.fd === undefined) {
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
    if (this.closed) return;
    if (this.start) {
      this.fsc.writeSync(this.fd, chunk, 0, chunk.length, this.start);
      this.start += chunk.length;
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
module.exports = { VFSReadStream, VFSWriteStream };