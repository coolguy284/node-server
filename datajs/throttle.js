module.exports = class Throttle extends stream.Transform {
  constructor(opts) {
    super(opts);
    if (opts === undefined) opts = {};
    if (opts.bps === undefined) opts.bps = Infinity;
    if (opts.chunksize === undefined) opts.chunksize = opts.bps / 10;
    this.bps = opts.bps;
    this.chunksize = opts.chunksize;
    this.chunks = [];
    this.cbs = [];
    this.processing = false;
    this.paused = false;
  }
  _transform(chunk, enc, cb) {
    let bp = 0;
    while (bp < chunk.length) {
      let c;
      if (this.chunks.length > 0) {
        let ls = this.chunks[this.chunks.length - 1];
        if (ls.length < this.chunksize) {
          let md = this.chunksize - ls.length;
          this.chunks[this.chunks.length - 1] = Buffer.concat([ls, chunk.slice(bp, bp + md)]);
          bp += md;
        } else {
          c = chunk.slice(bp, bp + this.chunksize);
          bp += this.chunksize;
        }
      } else {
        c = chunk.slice(bp, bp + this.chunksize);
        bp += this.chunksize;
      }
      this.chunks.push(c);
    }
    this.cbs.push(() => cb());
    if (!this.processing) this.process(0);
  }
  process(i) {
    this.processing = true;
    this.push(this.chunks.shift());
    if (this.paused) {
      this.processing = false;
      return;
    }
    if (this.chunks.length == 0) {
      this.processing = false;
      while (this.cbs.length > 0) setImmediate(this.cbs.shift(), i);
    } else {
      let ms = this.chunksize / this.bps * 1000;
      setTimeout(this.process.bind(this, i+1), isNaN(ms) ? 0 : ms);
    }
  }
  pauseStream() {
    this.paused = true;
  }
  resumeStream() {
    this.paused = false;
    if (this.chunks.length != 0 && !this.processing) this.process(0);
  }
};
/*module.exports = class Throttle extends stream.Duplex {
  constructor(opts) {
    super(opts);
    if (opts === undefined) opts = {};
    if (opts.bps === undefined) opts.bps = Infinity;
    if (opts.chunksize === undefined) opts.chunksize = opts.bps / 10;
    this.bps = opts.bps;
    this.chunksize = opts.chunksize;
    this.chunks = [];
    this.cbs = [];
    this.processing = false;
    this.readpush = false;
    this.finale = false;
    this.tolim = 0;
  }
  _read(size) {
    this.tolim += size;
    if (!this.processing) this.process(0);
  }
  _write(chunk, enc, cb) {
    console.log('write ' + chunk.length);
    let bp = 0;
    while (bp < chunk.length) this.chunks.push(chunk.slice(bp, bp += this.chunksize));
    console.log('cl ' + this.chunks.length);
    this.cbs.push(() => cb());
  }
  _final(cb) {
    this.readpush = true;
    this.finale = true;
    this.cbs.push(() => cb());
  }
  process(i) {
    this.processing = true;
    console.log('pcl ' + this.chunks.length);
    let cs = this.chunks.shift();
    if (cs !== undefined) {
      this.tolim -= cs.length;
      if (this.tolim < 0) this.tolim = 0;
    }
    let rv = this.push(cs);
    console.log('acl ' + this.chunks.length);
    if (!rv) {
      this.processing = false;
      return;
    }
    if (this.chunks.length == 0 && this.tolim == 0) {
      this.processing = false;
      while (this.cbs.length > 0) setImmediate(this.cbs.shift());
      if (this.finale) this.push(null);
    } else {
      let ms = this.chunksize / this.bps * 1000;
      setTimeout(this.process.bind(this, i + 1), isNaN(ms) ? 0 : ms);
    }
  }
};*/