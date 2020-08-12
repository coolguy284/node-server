// jshint -W041
module.exports = {
  ConsoleStream: class ConsoleStream extends stream.Writable {
    constructor(cm, options) {
      super(options);
      this.cm = cm;
      this.pl = '';
    }
    _write(chunk, enc, cb) {
      let cs = chunk.toString().split(/\r\n|\n|\r/g);
      let es = cs.splice(-1);
      for (var i in cs) {
        if (parseInt(i) == 0) {
          this.cm(this.pl + cs[i]);
          this.pl = '';
        } else {
          this.cm(cs[i]);
        }
      }
      if (es != '') this.pl += es;
      cb();
    }
    _writev(chunks, cb) {
      chunks = chunks.map(function (val) {return val.chunk;});
      return this._write(Buffer.concat(chunks, chunks.reduce(function (acc, val) {acc += val.length}, 0)), cb);
    }
    _final(cb) {
      if (this.pl != '') this.cm(this.pl);
      cb();
    }
  },
  LogFileStream: class LogFileStream extends stream.Writable {
    constructor(filename, options) {
      super(options);
      this.filename = filename;
    }
    _write(chunk, enc, cb) {
      fs.appendFile(this.filename, chunk, { enc }, cb);
    }
    _writev(chunks, cb) {
      chunks = chunks.map(x => {
        if (x.encoding == 'buffer') return x.chunk;
        else return Buffer.from(x.chunk, x.encoding);
      });
      fs.appendFile(this.filename, Buffer.concat(chunks), cb);
    }
    _final(cb) {
      cb();
    }
  },
  ValueStream: class ValueStream extends stream.Readable {
    constructor(val, lim, options) {
      super(options);
      if (val === undefined && val === null) val = 0;
      if (lim === undefined && lim === null) lim = Infinity;
      this.val = val;
      this.lim = lim;
      this.tolim = lim;
    }
    _read(size) {
      let rv = true;
      while (rv) {
        if (this.tolim < size) size = this.tolim;
        let ra = [];
        for (let i = 0; i < size; i++) ra.push(this.val);
        rv = this.push(ra.length > 0 ? Buffer.from(ra) : null);
        this.tolim -= size;
        if (this.tolim <= 0) rv = false;
      }
    }
  },
  RandomStream: class RandomStream extends stream.Readable {
    // can be given randfunc thet returns float in range [0, 1) or randbytesfunc that is given number of bytes and returns random buffer
    constructor(lim, options) {
      super(options);
      if (lim == null) lim = Infinity;
      if (options == null) options = {};
      this.lim = lim;
      this.tolim = lim;
      if (options.randfunc) {
        this.randfunc = options.randfunc;
      } else if (options.randbytesfunc) {
        this.randbytesfunc = options.randbytesfunc;
      } else {
        this.randfunc = Math.random;
      }
    }
    _read(size) {
      let rv = true;
      while (rv) {
        if (this.tolim < size) size = this.tolim;
        if (this.tolim == 0) {
          this.push(null);
          return;
        }
        if (this.randfunc) {
          let ra = [];
          for (let i = 0; i < size; i++) ra.push(Math.floor(this.randfunc() * 256));
          rv = this.push(ra.length > 0 ? Buffer.from(ra) : null);
        } else {
          rv = this.push(this.randbytesfunc(size));
        }
        this.tolim -= size;
        if (this.tolim <= 0) rv = false;
      }
    }
  },
  JSONRandStream: class JSONRandStream extends stream.Readable {
    constructor(items, bytes, options) {
      super(options);
      this.items = items == null ? Infinity : items;
      this.bytes = bytes == null ? 2 ** 20 : bytes;
      this.seedpart = options.seedpart == null ? new Date().toISOString() : options.seedpart;
      this.stage = 0;
    }
    _read(size) {
      let rv = true;
      while (rv) {
        if (this.stage == this.items + 2) {
          this.push(null);
          return;
        }
        if (this.stage == 0) {
          rv = this.push('[');
        } else if (this.stage <= this.items) {
          rv = this.push(JSON.stringify(datajs.prng.randomBytes(2 ** 14, this.seedpart + '+' + ('' + this.stage).padStart(9, '0')).toString()));
        } else if (this.stage == this.items + 1) {
          this.push(']');
          rv = this.push(null);
        }
        this.stage++;
      }
    }
  },
  BufReadStream: class BufReadStream extends stream.Readable {
    constructor(ibuf, options) {
      super(options);
      this.ibuf = ibuf || Buffer.alloc(0);
      this.start = options.start || 0;
      this.end = options.end || this.ibuf.length - 1;
      this.pos = 0;
    }
    _read(size) {
      let rv = true, buf;
      while (rv) {
        buf = this.ibuf.slice(this.pos, Math.min(this.pos + size, this.end + 1));
        if (buf.length == 0) {
          this.push(null);
          rv = false;
        } else {
          rv = this.push(buf);
        }
        size = this.highWaterMark || 16384;
      }
    }
  },
  BufWriteStream: class BufWriteStream extends stream.Writable {
    constructor(ibuf, dyn, options) {
      super(options);
      if (dyn == undefined) dyn = false;
      if (dyn) {
        if (!ibuf) ibuf = [];
        this.ibufa = ibuf;
        Object.defineProperty(this, 'ibuf', {
          configurable: true,
          enumerable: true,
          get: function () {return Buffer.concat(this.ibufa);},
          set: function (val) {this.ibufa = [Buffer.from(val)];}
        });
      } else {
        if (!ibuf) ibuf = Buffer.alloc(0);
        this.ibuf = ibuf;
      }
      this.dyn = dyn;
    }
    _write(chunk, enc, cb) {
      if (this.dyn) this.ibufa.push(chunk);
      else this.ibuf = Buffer.concat([this.ibuf, chunk]);
      cb();
    }
    _writev(chunks, cb) {
      chunks = chunks.map(function (val) {return val.chunk;});
      if (this.dyn) {
        for (let i in chunks) this.ibufa.push(chunk[i]);
      } else {
        chunks.shift(this.ibuf);
        this.ibuf = Buffer.concat(chunks);
      }
      cb();
    }
    _final(cb) {
      if (this.dyn) {
        Object.defineProperty(this, 'ibuf', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: Buffer.concat(this.ibufa)
        });
        delete this.ibufa;
      }
      cb();
    }
  },
  DevNullStream: class DevNullStream extends stream.Writable {
    constructor(options) {
      super(options);
    }
    _write(chunk, enc, cb) {
      cb();
    }
  },
  SimCompDecode: class SimpCompEncode extends stream.Transform {
    constructor(options) {
      super(options);
      this.mode = 0;
      this.bytlenb = 0;
      this.reptimb = 0;
      this.bytlen = 0;
      this.reptim = 0;
    }
    _transform(chunk, encoding, callback) {
      if (chunk.length > 0) {
        if (this.mode == 0) {
          let fac = (chunk[0] & 0b11000000) >> 6;
          if (fac == 2) {
            this.mode = 1;
            this.bytlenb = chunk[0] & 0b00000111;
          } else if (fac == 3) {
            this.mode = 2;
            this.bytlenb = (chunk[0] & 0b00111000) >> 3;
            this.reptimb = chunk[0] & 0b00000111;
          }
        }
      }
      if (chunk.length == 1) {
        callback();
      }
      if (chunk.length > 1 && this.mode == 1) {
        let lf = chunk[0] & 0b00000111;
        let bn = 0;
        for (let i = 0; i < lf; i++) {
          bn += chunk[i + 1] << (8 * (lf - i - 1));
        }
        let br = [];
        for (let i = 0; i < bn; i++) {
          br.push(chunk[i + lf + 1]);
        }
        this.push(Buffer.from(br));
        callback();
      }
    }
  }
};