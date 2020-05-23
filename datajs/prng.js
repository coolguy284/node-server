// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
module.exports = {
  // seed generator, input a string and call returned function repeatedly for 32-bit seeds
  xmur3: function (str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  },
  // simple, fast prng with 4 32-bit ints as seeds, outputs 32-bit int
  sfc32_lightweight_uint32: function (a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0);
    };
  },
  // simple, fast prng with 4 32-bit ints as seeds, outputs 32-bit int rescaled to [0, 1) range
  sfc32_lightweight: function (a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  },
  // there's already too much sfc32 but its so lightweight anyway so whetever, this one returns an object with many functions similar to the class
  sfc32_multifunc: function (a, b, c, d) {
    let obj = {
      uint32: function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0);
      },
      random: function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
      },
      randomBytes: function (bytes, seed) {
        let res = Buffer.allocUnsafe(bytes), i;
        for (i = 0; i + 4 < bytes; i += 4) {
          res.writeUInt32BE(obj.uint32(), i);
        }
        if (i < bytes) {
          let val = obj.uint32();
          for (; i < bytes; i++, val <<= 8) res[i] = val >> 24;
        }
        return res;
      }
    };
    return obj;
  },
  // class version of above function in order to peek at state variables
  sfc32: class sfc32 {
    constructor(a, b, c, d) {
      this.a = a; this.b = b; this.c = c; this.d = d;
    }
    getUInt32() {
      this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0; 
      var t = (this.a + this.b) | 0;
      this.a = this.b ^ this.b >>> 9;
      this.b = this.c + (this.c << 3) | 0;
      this.c = (this.c << 21 | this.c >>> 11);
      this.d = this.d + 1 | 0;
      t = t + this.d | 0;
      this.c = this.c + t | 0;
      return t >>> 0;
    }
    // returns float normalized to [0, 1)
    getRandom() {
      return this.getInt32() / 4294967296;
    }
  },
  randomBytes: function (bytes, seed) {
    if (typeof seed == 'string') {
      let seedfunc = exports.xmur3(seed);
      seed = [seedfunc(), seedfunc(), seedfunc(), seedfunc()];
    } else if (!Array.isArray(seed)) {
      let seedfunc = exports.xmur3(new Date().toISOString());
      seed = [seedfunc(), seedfunc(), seedfunc(), seedfunc()];
    }
    let rng = exports.sfc32_lightweight_uint32(...seed);
    let res = Buffer.allocUnsafe(bytes), i;
    for (i = 0; i + 4 < bytes; i += 4) {
      res.writeUInt32BE(rng(), i);
    }
    if (i < bytes) {
      let val = rng();
      for (; i < bytes; i++, val <<= 8) res[i] = val >> 24;
    }
    return res;
  }
};
exports = module.exports;