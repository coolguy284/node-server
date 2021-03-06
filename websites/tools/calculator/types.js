function ExpUndefined() {
  this.type = 'undefined';
  this.val = undefined;
}
function ExpNull() {
  this.type = 'null';
  this.val = null;
}
function ExpBool(val) {
  this.type = 'bool';
  this.val = Boolean(val);
}
function ExpNumber(val) {
  this.type = 'number';
  this.val = Number(val);
}
function ExpBigInt(val) {
  this.type = 'bigint';
  this.val = BigInt(val);
}
function ExpBigNum(val) {
  this.type = 'bignum';
  this.val = math.bignumber(val);
}
function ExpString(val) {
  this.type = 'string';
  this.val = String(val);
}
function ExpVariable(val) {
  this.type = 'variable';
  this.val = val;
}
function ExpComplex(a, b) {
  this.type = 'complex';
  if (typeof a == 'string') {
    let ra = [], bs = '', em = false;
    for (iv in a) {
      let i = a[iv];
      if (i == '-' && em == false) {
        if (ra.length != 0 || bs != '') ra.push(bs);
        bs = '-';
      } else if (i == '+' && em == false) {
        ra.push(bs);
        bs = '';
      } else if (i != 'i') {
        if (em == true) em = false;
        if (i == 'e') em = true;
        bs += i;
      }
    }
    ra.push(bs);
    a = GetNumber(ra[0]);
    b = GetNumber(ra[1]);
  }
  this.a = a;
  this.b = b;
}
function ExpMatrix(val, val2) {
  this.type = 'matrix';
  if (typeof val == 'number' && typeof val2 == 'number') {
    this.w = val2;
    this.h = val;
    this.val = [];
    this.val.w = this.w;
    this.val.h = this.h;
    for (let y = 0; y < this.h; y++) {
      let ta = [];
      for (let x = 0; x < this.w; x++) ta.push(0);
      this.val.push(ta);
    }
  } else if ('val' in val) {
    this.w = val.val[0].val.length;
    this.h = val.val.length;
    this.val = [];
    this.val.w = this.w;
    this.val.h = this.h;
    for (let y = 0; y < this.h; y++) {
      let ta = [];
      for (let x = 0; x < this.w; x++) ta.push(val.val[y].val[x]);
      this.val.push(ta);
    }
  } else {
    this.w = val[0].length;
    this.h = val.length;
    this.val = val;
    this.val.w = this.w;
    this.val.h = this.h;
  }
}
function ExpSurreal(val) {
  this.type = 'surreal';
  if (typeof val == 'object') {
    this.valarr = val;
  } else if (typeof val == 'string') {
    this.valarr = ExpSurrToValArr(val);
  } else {
    this.valarr = [val, 0];
  }
}
function ExpArray(val) {
  this.type = 'array';
  this.val = val;
}
function ExpObject(val) {
  this.type = 'object';
  this.val = val;
}
function ExpTArray(val) {
  this.type = 'tarray';
  this.val = val;
}
function ExpTObject(val) {
  this.type = 'tobject';
  this.val = val;
}
function ExpOperator(val) {
  this.type = 'op';
  this.val = val;
}
function ExpFuncCall(val) {
  this.type = 'funccall';
  this.val = val;
}
function ExpFunc(val, ftype, args, source) {
  if (ftype === undefined) ftype = 'js';
  this.type = 'func';
  this.val = val;
  this.ftype = ftype;
  this.args = args;
  this.source = source;
}
function ExpJSObj(val) {
  this.type = 'jsobj';
  this.val = val;
}
ExpString.prototype = {
  get length() {
    return GetNumber(this.val.length);
  }
};
ExpArray.prototype = {
  get length() {
    return GetNumber(this.val.length);
  }
};
ExpFunc.prototype = {
  toString: function () {
    if (this.ftype == 'js') return GetString(this.val.toString());
    else return GetString(this.source);
  },
  get length() {
    return this.args !== undefined ? GetNumber(this.args.length) : GetNumber(0);
  }
};