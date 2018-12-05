// jshint -W041
module.exports = {
  'ConsoleStream' : class ConsoleStream extends stream.Writable {
    constructor(cm, options) {
      super(options);
      this.cm = cm;
      this.pl = '';
    }
    _write(chunk, enc, done) {
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
      done();
    }
    _writev(chunks, done) {
      chunks = chunks.map(function (val) {return val.chunk;});
      return this._write(Buffer.concat(chunks, chunks.reduce(function (acc, val) {acc += val.length}, 0)), done);
    }
    _final(done) {
      if (this.pl != '') this.cm(this.pl);
    }
  },
  'ValueStream' : class ValueStream extends stream.Readable {
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
  'RandomStream' : class RandomStream extends stream.Readable {
    constructor(lim, options) {
      super(options);
      if (lim === undefined && lim === null) lim = Infinity;
      this.lim = lim;
      this.tolim = lim;
    }
    _read(size) {
      let rv = true;
      while (rv) {
        if (this.tolim < size) size = this.tolim;
        let ra = [];
        for (let i = 0; i < size; i++) ra.push(Math.floor(Math.random() * 256));
        rv = this.push(ra.length > 0 ? Buffer.from(ra) : null);
        this.tolim -= size;
        if (this.tolim <= 0) rv = false;
      }
    }
  },
  'BufReadStream' : class BufReadStream extends stream.Readable {
    constructor(ibuf, options) {
      super(options);
      if (!ibuf) ibuf = Buffer.alloc(0);
      this.ibuf = ibuf;
    }
    _read(size) {
      let rv = true;
      while (rv) {
        if (this.ibuf.length < size) size = this.ibuf.length;
        let rb = Buffer.allocUnsafe(size);
        let nibuf = Buffer.allocUnsafe(this.ibuf.length - size);
        this.ibuf.copy(rb, 0, 0, size);
        this.ibuf.copy(nibuf, 0, size, this.ibuf.length);
        this.ibuf = nibuf;
        rv = this.push(rb.length > 0 ? rb : null);
        if (this.ibuf.length <= 0) rv = false;
      }
    }
  },
  'BufWriteStream' : class BufWriteStream extends stream.Writable {
    constructor(ibuf, dyn, options) {
      super(options);
      if (dyn === undefined) dyn = false;
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
    _write(chunk, enc, done) {
      if (this.dyn) this.ibufa.push(chunk);
      else this.ibuf = Buffer.concat([this.ibuf, chunk]);
      done();
    }
    _writev(chunks, done) {
      chunks = chunks.map(function (val) {return val.chunk;});
      if (this.dyn) {
        for (let i in chunks) this.ibufa.push(chunk[i]);
      } else {
        chunks.shift(this.ibuf);
        this.ibuf = Buffer.concat(chunks);
      }
      done();
    }
    _final(done) {
      if (this.dyn) {
        Object.defineProperty(this, 'ibuf', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: Buffer.concat(this.ibufa)
        });
        delete this.ibufa;
      }
    }
  },
  'DevNullStream' : class DevNullStream extends stream.Writable {
    constructor(options) {
      super(options);
    }
    _write(chunk, enc, cb) {
      cb();
    }
  },
  'SimCompDecode' : class SimpCompEncode extends stream.Transform {
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