// jshint -W041
module.exports = {
  'BitView' : class {
    constructor(val) {
      if (val instanceof ArrayBuffer) {
        this.dv = new DataView(val);
      } else if (val instanceof DataView) {
        this.dv = val;
      }
      this.buffer = this.dv.buffer;
      this.byteLength = this.dv.byteLength;
      this.bitLength = this.byteLength * 8;
    }
    getBit(ind, prt) {
      if (prt !== undefined) {
        return (this.dv.getUint8(ind) & (1 << (7 - prt))) ? 1 : 0;
      } else {
        return this.getBit(Math.floor(ind / 8), ind % 8);
      }
    }
    setBit(ind, prt, val) {
      if (val === undefined) {
        return this.setBit(Math.floor(ind / 8), ind % 8, prt);
      } else {
        if (val > 0) {
          return this.dv.setUint8(ind, this.dv.getUint8(ind) | (1 << (7 - prt)));
        } else {
          return this.dv.setUint8(ind, this.dv.getUint8(ind) & ~(1 << (7 - prt)));
        }
      }
    }
    toggleBit(ind, prt) {
      if (prt !== undefined) {
        return this.dv.setUint8(ind, this.dv.getUint8(ind) ^ (1 << (7 - prt)));
      } else {
        return this.toggleBit(Math.floor(ind / 8), ind % 8);
      }
    }
    getInt8(ind, en) {
      if (en == 0) {
        if (ind % 8 == 0) {
          return this.dv.getInt8(ind / 8);
        } else {
          
        }
      }
    }
  },
  'Char8Array' : function Char8Array(val) {
    if (['[object Uint8Array]', '[object Uint8ClampedArray]'].indexOf(Object.prototype.toString.call(val)) > -1) {
      this.uiarr = val;
    } else {
      this.uiarr = new Uint8Array(val);
    }
    return new Proxy(this, module.exports.c8trap);
  },
  'c8trap' : {
    get : function (obj, nam) {
      if (nam == 'inspect') {
        return function () {return 'Char8Array [ ' + Array.from(obj.uiarr).map(x => util.inspect(String.fromCharCode(x))).join(', ') + ' ]'};
      }
      if (typeof nam == 'string') {
        return String.fromCharCode(obj.uiarr[nam]);
      }
    },
    set : function (obj, nam, val) {
      if (typeof nam == 'string') {
        obj.uiarr[nam] = val.charCodeAt(0);
      }
    }
  },
};