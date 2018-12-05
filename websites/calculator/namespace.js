var varns = {
  true: new ExpBool(true),
  false: new ExpBool(false),
  NaN: new ExpNumber(NaN),
  Infinity: new ExpNumber(Infinity),
  pi: new ExpNumber(Math.PI),
  e: new ExpNumber(Math.E),
  phi: new ExpNumber((1 + 5 ** 0.5) / 2),
  sqrt2: new ExpNumber(Math.SQRT2),
  sqrt1_2: new ExpNumber(Math.SQRT1_2),
  abs: new ExpFunc(function (args) {
    if (args[0].val < 0) {
      args[0].val = -args[0].val;
    }
    if (args[0].type == 'num') {
      return new ExpNumber(args[0].val);
    } else if (args[0].type == 'bignum') {
      return new ExpBigNum(args[0].val);
    }
  }),
  floor: new ExpFunc(function (args) {
    if (args[0].type == 'num') {
      return new ExpNumber(Math.floor(args[0].val));
    } else if (args[0].type == 'bignum') {
      return new ExpBigNum(args[0].val);
    }
  }),
  ceil: new ExpFunc(function (args) {
    if (args[0].type == 'num') {
      return new ExpNumber(Math.ceil(args[0].val));
    } else if (args[0].type == 'bignum') {
      return new ExpBigNum(args[0].val);
    }
  }),
  pow: new ExpFunc(function (args) {
    if (args[0].type == 'num' && args[1].type == 'num') {
      return new ExpNumber(args[0].val ** args[1].val);
    } else if (args[0].type == 'bignum' && args[1].type == 'bignum') {
      return new ExpBigNum(args[0].val ** args[1].val);
    }
  }),
};