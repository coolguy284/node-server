function Mod1(x) {
  if (x >= 0) return x % 1;
  else return (1 - (-x % 1)) % 1;
}
function pow(b, x) {
  return Math.pow(b, x);
}
function log(v, b) {
  if (b == 2) return Math.log2(v);
  else if (b == 10) return Math.log10(v);
  else if (b === undefined) return Math.log(v);
  return Math.log(v) / Math.log(b);
}
function tet(b, x) {
  let val;
  if (x < -1) {
    val = tet(b, Mod1(x)-1);
    while (x <= -1) {
      if (isNaN(val)) break;
      val = log(val, b);
      x++;
    }
  } else if (x <= 0) {
    if (x == -1) {
      val = 0;
    } else {
      val = 1 + ((2 * log(b)) / (1 + log(b))) * x - ((1 - log(b)) / (1 + log(b))) * pow(x, 2);
    }
  } else if (x > 0) {
    val = tet(b, Mod1(x)-1);
    while (x >= 0) {
      if (val == Infinity) break;
      val = pow(b, val);
      x--;
    }
  }
  return val;
}
function sroot(v, x) {
	let xv = 2;
	let min = 1;
	let max = 1e12;
	let ct = 1000;
	while (Math.abs(max - min) > 1e-12) {
	  let val = tet(xv, x);
	  if (val > v) {
	    max = xv;
	    xv = (min + xv) / 2;
	  } else if (val < v) {
	    min = xv;
	    xv = (xv + max) / 2;
	  } else {
	    break;
	  }
	  if (!--ct) break;
	}
	return xv;
}
function slog(v, b) {
	if (v < 0) {
    try {
      return slog(pow(b, v), b) - 1;
    } catch (e) {
      return -Infinity;
    }
	} else if (v <= 1) {
		return -1 + ((2 * log(b)) / (1 + log(b))) * v + ((1 - log(b)) / (1 + log(b))) * pow(v, 2);
	} else if (v > 1) {
    try {
      return slog(log(v, b), b) + 1;
    } catch (e) {
      return Infinity;
    }
	}
}
function mod1math(v) {
  return math.mod(v, 1);
}
function powmath(b, x) {
  return math.pow(b, x);
}
function logmath(v, b) {
  if (math.equal(b, 2)) return math.log2(v);
  else if (math.equal(b, 10)) return math.log10(v);
  else if (b === undefined) return math.log(v);
  return math.log(v, b);
}
function tetmath(b, x) {
  let val;
  if (math.smaller(x, math.bignumber('-1'))) {
    val = tetmath(b, math.subtract(mod1math(x), math.bignumber('1')));
    while (math.smallerEq(x, math.bignumber('-1'))) {
      if (math.isNaN(val)) break;
      val = logmath(val, b);
      x = math.add(x, math.bignumber('1'));
    }
  } else if (math.smallerEq(x, math.bignumber('0'))) {
    if (math.equal(x, math.bignumber('-1'))) {
      val = math.bignumber('0');
    } else {
      val = math.add(math.bignumber('1'), 
        math.subtract(
          math.multiply(
            math.divide(
              math.multiply(math.bignumber('2'), logmath(b)),
              math.add(math.bignumber('1'), logmath(b))
            ),
            x
          ),
          math.multiply(
            math.divide(
              math.subtract(math.bignumber('1'), logmath(b)),
              math.add(math.bignumber('1'), logmath(b))
            ),
            powmath(x, math.bignumber('2'))
          )
        )
      );
    }
  } else if (math.larger(x, math.bignumber('0'))) {
    val = tetmath(b, math.subtract(mod1math(x), math.bignumber('1')));
    while (math.largerEq(x, math.bignumber('0'))) {
      if (math.equal(val, math.bignumber('Infinity'))) break;
      val = powmath(b, val);
      x = math.subtract(x, 1);
    }
  }
  return val;
}
function srootmath(v, x) {
	let xv = math.bignumber('2');
	let min = math.bignumber('1');
	let max = math.bignumber('1e12');
	let ct = 1000;
	while (math.larger(math.abs(math.subtract(max, min)), math.bignumber('1e-64'))) {
	  let val = tetmath(xv, x);
	  if (math.larger(val, v)) {
	    max = xv;
	    xv = math.divide(math.add(min, xv), math.bignumber('2'));
	  } else if (math.smaller(val, v)) {
	    min = xv;
	    xv = math.divide(math.add(xv, max), math.bignumber('2'));
	  } else {
	    break;
	  }
	  if (!--ct) break;
	}
	return xv;
}
function slogmath(v, b) {
	if (math.smaller(v, math.bignumber('0'))) {
    try {
      return math.subtract(slogmath(powmath(b, v), b), math.bignumber('1'));
    } catch (e) {
      return math.bignumber('-Infinity');
    }
	} else if (math.smallerEq(v, math.bignumber('1'))) {
		return math.add(
      math.add(
        math.bignumber('-1'),
        math.multiply(
          math.divide(
            math.multiply(math.bignumber('2'), logmath(b)),
            math.add(math.bignumber('1'), logmath(b))
          ),
          v
        )
      ),
      math.multiply(
        math.divide(
          math.subtract(math.bignumber('1'), logmath(b)),
          math.add(math.bignumber('1'), logmath(b))
        ),
        math.pow(v, math.bignumber('2'))
      )
    );
	} else if (math.larger(v, math.bignumber('1'))) {
    try {
      return math.add(slogmath(logmath(v, b), b), math.bignumber('1'));
    } catch (e) {
      return math.bignumber('Infinity');
    }
	}
}
function wtn(b, x) {
  return pow(b, pow(b, (x - 1)));
}
function wpn(b, x) {
  let val = b;
  for (let i = 0; i < x - 1; i++) val = tet(val, b);
  return val;
}
function g(a, b, c) {
  if (a > 3) return g(a-1,g(a-1,b,c),c);
  if (a == 0) return c + b;
  else if (a == 1) return c * b;
  else if (a == 2) return pow(c, b);
  else if (a == 3) return tet(c, b);
}
function gamma(n) {
  let g = 7,
      p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (n < 0.5) {
    return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
  } else {
    n--;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) x += p[i] / (n + i);
    let t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
  }
}
function randBigInt32() {
  return BigInt(Math.floor(Math.random() * 4294967296));
}
function gaussianBoxMuller() {
  let u = Math.random();
  let v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
var varns = {
  undefined: GetUndefined(),
  None: GetUndefined(),
  null: GetNull(),
  true: GetBool(true),
  True: GetBool(true),
  false: GetBool(false),
  False: GetBool(false),
  NaN: GetNumber(NaN),
  nan: GetNumber(NaN),
  Infinity: GetNumber(Infinity),
  infinity: GetNumber(Infinity),
  inf: GetNumber(Infinity),
  Infinityd: GetUndefined(),
  infinityd: GetUndefined(),
  infd: GetUndefined(),
  NaNd: GetUndefined(),
  nand: GetUndefined(), 
  i: GetComplex('0+1i'),
  w: GetSurreal('w'),
  pi: GetNumber(Math.PI),
  deg: GetNumber(Math.PI / 180),
  rad: GetNumber(180 / Math.PI),
  e: GetNumber(Math.E),
  phi: GetNumber((1 + 5 ** 0.5) / 2),
  sqrt2: GetNumber(Math.SQRT2),
  sqrt1_2: GetNumber(Math.SQRT1_2),
  ln2: GetNumber(Math.LN2),
  ln10: GetNumber(Math.LN10),
  pid: GetUndefined(),
  degd: GetUndefined(),
  radd: GetUndefined(),
  ed: GetUndefined(),
  phid: GetUndefined(),
  sqrt2d: GetUndefined(),
  sqrt1_2d: GetUndefined(),
  ln2d: GetUndefined(),
  ln10d: GetUndefined(),
  Boolean: new ExpFunc(function (args) {
    return GetBool(args[0].val);
  }),
  Number: new ExpFunc(function (args) {
    return GetNumber(args[0].val);
  }),
  BigInt: new ExpFunc(function (args) {
    return GetBigInt(args[0].val);
  }),
  BigNum: new ExpFunc(function (args) {
    if (args[0].type == 'bigint') return GetBigNum(args[0].val.toString());
    else return GetBigNum(args[0].val);
  }),
  String: new ExpFunc(function (args) {
    return GetString(args[0].val);
  }),
  Array: new ExpFunc(function (args) {
    if (args.length == 0) {
      return new ExpArray([]);
    } else if (args.length == 1) {
      return new ExpArray(args[0].val);
    } else {
      return new ExpArray(args);
    }
  }),
  Object: new ExpFunc(function (args) {
    if (args.length == 0) return new ExpObject({});
  }),
  Function: new ExpFunc(function (args) {
    if (args.length == 1) {
      if (args[0].type == 'string') return new ExpFunc(ToStmtArr(args[0].val), 'comp', [], args[0].val);
    } else if (args.length == 2) {
      return new ExpFunc(ToStmtArr(args[1].val), 'comp', args[0].val.map(x => x.val), args[1].val);
    }
  }),
  Complex: new ExpFunc(function (args) {
    if (args[0].type == 'string') return GetComplex(args[0].val);
    else if (args.length == 1) return GetComplex(args[0], GetNumber(0));
    else return GetComplex(args[0], args[1]);
  }),
  Matrix: new ExpFunc(function (args) {
    if (args.length == 1) return GetMatrix(args[0]);
    else return GetMatrix(args[0].val, args[1].val);
  }),
  Surreal: new ExpFunc(function (args) {
    if (args[0].type == 'array') {
      return GetSurreal(args[0].val.map(x => x.val));
    } else if (args[0].type == 'string') {
      return GetSurreal(args[0].val);
    } else if (args[0].type == 'number') {
      return GetSurreal([[args[0].val, GetNumber(0)]]);
    }
  }),
  globals: new ExpFunc(function (args, globals, locals) {
    return globals;
  }),
  locals: new ExpFunc(function (args, globals, locals) {
    return locals;
  }),
  compileExpr: new ExpFunc(function (args) {
    if (args[0].type == 'string') return new ExpJSObj(ToExpArr(args[0].val));
  }),
  evalExpr: new ExpFunc(function (args, globals, locals) {
    let ca;
    if (args[0].type == 'string') {
      ca = ToExpArr(args[0].val);
    } else if (args[0].type == 'jsobj') {
      ca = args[0].val;
    }
    if (args.length == 1) return ParseExpArr(ca, globals, locals)[0][0];
    else if (args.length == 2) return ParseExpArr(ca, args[1].val, args[1].val)[0][0];
    else return ParseExpArr(ca, args[1].val, args[2].val)[0][0];
  }),
  compile: new ExpFunc(function (args) {
    if (args[0].type == 'string') return new ExpJSObj(ToStmtArr(args[0].val));
  }),
  eval: new ExpFunc(function (args, globals, locals) {
    let ca;
    if (args[0].type == 'string') {
      ca = ToStmtArr(args[0].val);
    } else if (args[0].type == 'jsobj') {
      ca = args[0].val;
    }
    if (args.length == 1) return ParseStmtArr(ca, globals, locals)[0][0];
    else if (args.length == 2) return ParseStmtArr(ca, args[1].val, args[1].val)[0][0];
    else return ParseStmtArr(ca, args[1].val, args[2].val)[0][0];
  }),
  repr: new ExpFunc(function (args) {
    return GetString(ObjToText(args[0]));
  }),
  print: new ExpFunc(function (args) {
    if (args[0].type == 'string') calcarr.push(args[0].val);
    else calcarr.push(ObjToText(args[0]));
    CalcArrRefresh();
    return GetUndefined();
  }),
  sign: new ExpFunc(function (args) {
    if (args[0].val > 0) return 1;
    else if (args[0].val < 0) return -1;
    else if (args[0].val == 0) return 0;
    else return NaN;
  }),
  abs: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      if (args[0].val < 0 || Object.is(args[0].val, -0)) return GetNumber(-args[0].val);
      else return GetNumber(args[0].val);
    } else if (args[0].type == 'bigint') {
      if (args[0].val < 0) return GetBigInt(-args[0].val);
      else return GetBigInt(args[0].val);
    } else if (args[0].type == 'bignum') {
      return GetBigNum(math.abs(args[0]));
    } else if (args[0].type == 'complex') {
      return ExpExponentiate(ExpAdd(ExpExponentiate(args[0].a, GetNumber(2)), ExpExponentiate(args[0].b, GetNumber(2))), GetNumber(0.5));
    }
  }),
  max: new ExpFunc(function (args) {
    let mv = GetNumber(-Infinity);
    for (let i in args) if (ExpGreaterThan(args[i], mv)) mv = args[i];
    return mv;
  }),
  min: new ExpFunc(function (args) {
    let mv = Infinity;
    for (let i in args) if (ExpLessThan(args[i], mv)) mv = args[i];
    return mv;
  }),
  floor: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.floor(args[0].val));
    else if (args[0].type == 'bigint') return GetBigInt(args[0].val);
    else if (args[0].type == 'bignum') return GetBigNum(math.floor(args[0].val));
  }),
  ceil: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.ceil(args[0].val));
    else if (args[0].type == 'bigint') return GetBigInt(args[0].val);
    else if (args[0].type == 'bignum') return GetBigNum(math.ceil(args[0].val));
  }),
  round: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.round(args[0].val));
    else if (args[0].type == 'bigint') return GetBigInt(args[0].val);
    else if (args[0].type == 'bignum') return GetBigNum(math.round(args[0].val));
  }),
  trunc: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.trunc(args[0].val));
    else if (args[0].type == 'bigint') return GetBigInt(args[0].val);
  }),
  gcd: new ExpFunc(function (args) {
    if (args.length == 1) return args[0];
    else if (args.length == 2) {
      for (var i = 0; i < 1e6; i++) {
        if (ExpEqual(args[0], GetNumber(0))) break;
        let b = ExpRemainder(args[0], args[1]);
        args[0] = args[1];
        args[b] = b;
      }
      return args[0];
    } else {
      while (args.length > 1) args.splice(0, 2, varns.gcd.val(args[0], args[1]));
      return args[0];
    }
  }),
  lcm: new ExpFunc(function (args) {
    if (args.length == 1) return args[0];
    else if (args.length == 2) {
      return ExpDivide(ExpMultiply(args[0], args[1]), varns.gcd.val(args));
    } else {
      while (args.length > 1) args.splice(0, 2, varns.lcm.val(args[0], args[1]));
      return args[0];
    }
  }),
  constrain: new ExpFunc(function (args) {
    return varns.min.val([varns.max.val([args[0], args[1]]), args[2]]);
  }),
  lerp: new ExpFunc(function (args) {
    let dif = ExpSubtract(args[1].val, args[0].val);
    return ExpAdd(ExpMultiply(dif, args[2]), args[0]);
  }),
  map: new ExpFunc(function (args) {
    let dif1 = ExpSubtract(args[2], args[1]);
    let dif2 = ExpSubtract(args[4], args[3]);
    return ExpAdd(ExpMultiply(ExpDivide(ExpSubtract(args[0], args[1]), dif1), dif2), args[3]);
  }),
  norm: new ExpFunc(function (args) {
    let dif1 = ExpSubtract(args[2], args[1]);
    return ExpDivide(ExpSubtract(args[0], args[1]), dif1);
  }),
  dist: new ExpFunc(function (args) {
    let hl = args.length / 2;
    let ap1 = args.slice(0, hl);
    let ap2 = args.slice(h1, Infinity);
    return GetNumber(Math.hypot.apply(ap1.map((x, i) => ap2[i].val - x.val)));
  }),
  random: new ExpFunc(function (args) {
    if (args.length == 0) {
      return GetNumber(Math.random());
    } else if (args.length == 1) {
      return GetNumber(Math.random() * args[0].val);
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return GetNumber(Math.random() * dif + args[0].val);
    }
  }),
  randint: new ExpFunc(function (args) {
    if (args.length == 0) {
      return GetNumber(Math.round(Math.random()));
    } else if (args.length == 1) {
      return GetNumber(Math.floor(Math.random() * args[0].val));
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return GetNumber(Math.floor(Math.random() * dif + args[0].val));
    }
  }),
  randintn: new ExpFunc(function (args) {
    if (args.length == 0) {
      return GetBigInt(Math.round(Math.random()));
    } else if (args.length == 1) {
      if (args[0].val < 0) return varns.randintn.val([new ExpBigNum(-args[0].val)]);
      if (args[0].val < BigInt(4294967296)) {
        return ExpDivide(GetBigInt(randBigInt32()), ExpDivide(args[0], GetBigInt(4294967296)));
      }
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return ExpAdd(BigInt(dif), varns.randintn.val([GetBigInt(dif)]));
    }
  }),
  randgauss: new ExpFunc(function (args) {
    if (args.length == 0) return GetNumber(gaussianBoxMuller());
    else if (args.length == 1) return GetNumber(gaussianBoxMuller() + args[0].val);
    else if (args.length == 2) return GetNumber(gaussianBoxMuller() * args[1].val + args[0].val);
  }),
  sq: new ExpFunc(function (args) {
    return ExpMultiply(args[0], args[0]);
  }),
  cb: new ExpFunc(function (args) {
    if (args[0].type == 'number') return ExpExponentiate(args[0], GetNumber(3));
    else if (args[0].type == 'bigint') return ExpExponentiate(args[0], GetBigInt(3));
    else if (args[0].type == 'bignum') return ExpExponentiate(args[0], GetBigNum(3));
  }),
  sqrt: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.sqrt(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.sqrt(args[0].val));
  }),
  cbrt: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.cbrt(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.cbrt(args[0].val));
  }),
  hypot: new ExpFunc(function (args) {
    if (args.every(x => x.type == 'number')) return GetNumber(Math.hypot.apply(Math, args.map(x => x.val)));
    else if (args.every(x => x.type == 'bignum')) return GetBigNum(math.hypot.apply(math, args.map(x => x.val)));
  }),
  exp: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.exp(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.exp(args[0].val));
  }),
  pow: new ExpFunc(function (args) {
    return ExpExponentiate(args[0], args[1]);
  }),
  root: new ExpFunc(function (args) {
    if (args[0].type == 'number') return ExpExponentiate(args[0], ExpDivide(GetNumber(1), args[1]));
    else if (args[0].type == 'bignum') return ExpExponentiate(args[0], ExpDivide(GetBigNum(1), args[1]));
  }),
  log: new ExpFunc(function (args) {
    let val;
    if (args[0].type == 'number') {
      if (args[1]) {
        if (args[1].val == 2) val = Math.log2(args[0].val);
        else if (args[1].val == 10) val = Math.log10(args[0].val);
        else val = Math.log(args[0].val) / Math.log(args[1].val);
      } else val = Math.log(args[0].val);
      return GetNumber(val);
    } else if (args[0].type == 'bigint') {
      if (args[1]) {
        if (args[1].val == 10) val = varns.log10.val(args[0]).val;
        else val = varns.log10.val(args[0]).val * varns.ln10.val;
      } else val = varns.log10.val(args[0]).val * varns.ln10.val;
      return GetNumber(val);
    } else if (args[0].type == 'bignum') {
      if (args[1]) {
        if (math.equal(args[1].val, 2)) val = math.log2(args[0].val);
        else if (math.equal(args[1].val, 10)) val = math.log10(args[0].val);
        else val = math.log(args[0].val, args[1].val);
      } else val = math.log(args[0].val);
      return GetBigNum(val);
    }
  }),
  log10: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      return GetNumber(Math.log10(args[0].val));
    } else if (args[0].type == 'bigint') {
      let es = args[0].val.toString();
      let tv = Math.log10(Number(es.substr(0, 12)));
      return GetNumber((tv - Math.floor(tv)) - 1 + es.length);
    } else if (args[0].type == 'bignum') {
      return GetBigNum(math.log10(args[0].val));
    }
  }),
  log2: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      return GetNumber(Math.log2(args[0].val));
    } else if (args[0].type == 'bigint') {
      return GetNumber(varns.log10.val(args[0]).val * varns.ln10.val / varns.ln2.val);
    } else if (args[0].type == 'bignum') {
      return GetBigNum(math.log2(args[0].val));
    }
  }),
  tet: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(tet(args[0].val, args[1].val));
    else if (args[0].type == 'bignum') return GetBigNum(tetmath(args[0].val, args[1].val));
  }),
  sroot: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(sroot(args[0].val, args[1].val));
    else if (args[0].type == 'bignum') return GetBigNum(srootmath(args[0].val, args[1].val));
  }),
  slog: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(slog(args[0].val, args[1].val));
    else if (args[0].type == 'bignum') return GetBigNum(slogmath(args[0].val, args[1].val));
  }),
  fact: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      let fv = args[0].val;
      if (Number.isInteger(fv)) {
        if (fv >= 0) {
          let bv = 1;
          for (; fv > 0 && bv < Infinity; fv--) bv *= fv;
          return GetNumber(bv);
        } else if (fv < 0) {
          return GetNumber(NaN);
        }
      } else {
        return GetNumber(gamma(fv + 1));
      }
    } else if (args[0].type == 'bigint') {
      if (fv >= 0) {
        for (let bv = BigInt(1); fv > 0 && bv < Infinity; fv--) bv *= fv;
        return GetBigInt(bv);
      } else if (fv < 0) {
        return GetNumber(NaN);
      }
    } else if (args[0].type == 'bignum') {
      return GetBigNum(math.gamma(math.add(args[0].val, 1)));
    }
  }),
  gamma: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(gamma(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.gamma(args[0].val));
  }),
  degrees: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(args[0].val / Math.PI * 180);
    else if (args[0].type == 'bignum') return GetBigNum(math.multiply(math.divide(args[0].val, math.pi), 180));
  }),
  radians: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(args[0].val / 180 * Math.PI);
    else if (args[0].type == 'bignum') return GetBigNum(math.multiply(math.divide(args[0].val, 180), math.pi));
  }),
  sin: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.sin(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.sin(args[0].val));
  }),
  cos: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.cos(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.cos(args[0].val));
  }),
  tan: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.tan(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.tan(args[0].val));
  }),
  csc: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.sin(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.csc(args[0].val));
  }),
  sec: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.cos(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.sec(args[0].val));
  }),
  cot: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.tan(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.cot(args[0].val));
  }),
  asin: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.asin(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.asin(args[0].val));
  }),
  acos: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.acos(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acos(args[0].val));
  }),
  atan: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.atan(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.atan(args[0].val));
  }),
  atan2: new ExpFunc(function (args) {
    if (args[0].type == 'number' && args[0].type == 'number') return GetNumber(Math.atan2(args[0].val, args[1].val));
    else if (args[0].type == 'bignum' && args[1].type == 'number' || args[0].type == 'number' && args[1].type == 'bignum' || args[0].type == 'bignum' && args[1].type == 'bignum') return GetBigNum(math.atan2(args[0].val, args[1].val));
  }),
  acsc: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.asin(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acsc(args[0].val));
  }),
  asec: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.acos(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.asec(args[0].val));
  }),
  acot: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.atan(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acot(args[0].val));
  }),
  sinh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.sinh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.sinh(args[0].val));
  }),
  cosh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.cosh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.cosh(args[0].val));
  }),
  tanh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.tanh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.tanh(args[0].val));
  }),
  csch: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.sinh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.csch(args[0].val));
  }),
  sech: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.cosh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.sech(args[0].val));
  }),
  coth: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(1 / Math.tanh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.coth(args[0].val));
  }),
  asinh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.asinh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.asinh(args[0].val));
  }),
  acosh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.acosh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acosh(args[0].val));
  }),
  atanh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.atanh(args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.atanh(args[0].val));
  }),
  acsch: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.asinh(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acsch(args[0].val));
  }),
  asech: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.acosh(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.asech(args[0].val));
  }),
  acoth: new ExpFunc(function (args) {
    if (args[0].type == 'number') return GetNumber(Math.atanh(1 / args[0].val));
    else if (args[0].type == 'bignum') return GetBigNum(math.acoth(args[0].val));
  }),
  tohexstr: new ExpFunc(function (args) {
    return GetString(args[0].val.toString(16));
  }),
  tooctstr: new ExpFunc(function (args) {
    return GetString(args[0].val.toString(8));
  }),
  tobinstr: new ExpFunc(function (args) {
    return GetString(args[0].val.toString(2));
  }),
  todecstr: new ExpFunc(function (args) {
    return GetString(args[0].val.toString(10));
  }),
  tobasestr: new ExpFunc(function (args) {
    return GetString(args[0].val.toString(args[1].val));
  }),
  fromhexstr: new ExpFunc(function (args) {
    return GetNumber(parseInt(args[0].val, 16));
  }),
  fromhexstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 16)) * (BigInt(16) ** em);
    }
    return GetBigInt(bi);
  }),
  fromoctstr: new ExpFunc(function (args) {
    return GetNumber(parseInt(args[0].val, 8));
  }),
  fromoctstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 8)) * (BigInt(8) ** em);
    }
    return GetBigInt(bi);
  }),
  frombinstr: new ExpFunc(function (args) {
    return GetNumber(parseInt(args[0].val, 2));
  }),
  frombinstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 2)) * (BigInt(2) ** em);
    }
    return GetBigInt(bi);
  }),
  fromdecstr: new ExpFunc(function (args) {
    return GetNumber(parseInt(args[0].val, 10));
  }),
  fromdecstrn: new ExpFunc(function (args) {
    return GetBigInt(args[0].val);
  }),
  frombasestr: new ExpFunc(function (args) {
    return GetNumber(parseInt(args[0].val, args[1].val));
  }),
  frombasestrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], args[1].val)) * (BigInt(args[1].val) ** em);
    }
    return GetBigInt(bi);
  }),
  clear: new ExpFunc(function (args) {
    calcarr.splice(0, Infinity);
    CalcArrRefresh();
    return 'console cleared';
  }),
  reset: new ExpFunc(function (args) {
    globalns = CreateNSCopy(varns);
    localns = CreateNS({});
    calcarr.splice(0, Infinity);
    CalcArrRefresh();
    return 'variables reset and console cleared';
  }),
  vn: new ExpObject({e: GetString('val')}),
};

varns.Number.val.MAX_SAFE_INT = varns.Number.val.MAX_SAFE_INTEGER = GetNumber(Number.MAX_SAFE_INTEGER);
varns.Number.val.MIN_SAFE_INT = varns.Number.val.MIN_SAFE_INTEGER = GetNumber(Number.MIN_SAFE_INTEGER);
varns.Number.val.MAX_VALUE = GetNumber(Number.MAX_VALUE);
varns.Number.val.MIN_VALUE = GetNumber(Number.MIN_VALUE);
varns.Matrix.val.ident = new ExpFunc(function (args) {
  if (args[0].type == 'number') {
    let mat = GetMatrix(args[0].val, args[0].val);
    for (let i = 0; i < args[0].val; i++) mat.set(i, i, GetNumber(1));
    return mat;
  }
});
function onload_namespace() {
  if (window.math !== undefined) {
    varns.Infinityd = GetBigNum(Infinity);
    varns.infinityd = GetBigNum(Infinity);
    varns.infd = GetBigNum(Infinity);
    varns.NaNd = GetBigNum(NaN);
    varns.nand = GetBigNum(NaN);
    varns.pid = GetBigNum('3.141592653589793238462643383279502884197169399375105820974944592');
    varns.degd = GetBigNum(math.divide(varns.pid.val, math.bignumber('180')));
    varns.radd = GetBigNum(math.divide(math.bignumber('180'), varns.pid.val));
    varns.ed = GetBigNum(math.exp(math.bignumber('1')));
    varns.phid = GetBigNum(math.divide(math.add(math.bignumber('1'), math.sqrt(math.bignumber('5'))), math.bignumber('2')));
    varns.sqrt2d = GetBigNum(math.sqrt(math.bignumber('2')));
    varns.sqrt1_2d = GetBigNum(math.sqrt(math.bignumber('0.5')));
    varns.ln2d = GetBigNum(math.log(math.bignumber('2')));
    varns.ln10d = GetBigNum(math.log(math.bignumber('10')));
    globalns = CreateNSCopy(varns);
    varns.BigNum.val.MAX_VALUE = GetBigNum('9.999999999999999999999999999999999999999999999999999999999999999e9000000000000000');
    varns.BigNum.val.MIN_VALUE = GetBigNum('1e-9000000000000000');
  }
}
varns.vn.val.v = varns.vn;

function CreateNS(obj) {
  return new ExpObject(obj);
}
function CreateNSCopy(obj) {
  return new ExpObject(Object.assign({}, obj));
}