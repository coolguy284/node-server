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
	while (Math.abs(max-min)>1e-12) {
	  let val = tet(xv, x);
	  if (val > v) {
	    max=xv;
	    xv=(min+xv)/2;
	  } else if (val < v) {
	    min=xv;
	    xv=(xv+max)/2;
	  } else {
	    break;
	  }
	  if (!--ct) break;
	}
	return xv;
}
function slog(v, b) {
  let val;
	if (v < 0) {
    try {
      return slog(pow(b, v), b) - 1;
    } catch (e) {
      return -Infinity;
    }
	} else if (v <= 1) {
		val = -1 + ((2 * log(b)) / (1 + log(b))) * v + ((1 - log(b)) / (1 + log(b))) * pow(v, 2);
	} else if (v > 1) {
    try {
      return slog(log(v, b), b) + 1;
    } catch (e) {
      return Infinity;
    }
	}
	return val;
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
var CL_UNDEFINED = new ExpUndefined();
var CL_NULL = new ExpNull();
var varns = {
  undefined: CL_UNDEFINED,
  null: CL_NULL,
  true: new ExpBool(true),
  false: new ExpBool(false),
  NaN: new ExpNumber(NaN),
  Infinity: new ExpNumber(Infinity),
  i: new ExpComplex('0+1i'),
  w: new ExpSurreal('w'),
  pi: new ExpNumber(Math.PI),
  e: new ExpNumber(Math.E),
  phi: new ExpNumber((1 + 5 ** 0.5) / 2),
  sqrt2: new ExpNumber(Math.SQRT2),
  sqrt1_2: new ExpNumber(Math.SQRT1_2),
  ln2: new ExpNumber(Math.LN2),
  ln10: new ExpNumber(Math.LN10),
  Boolean: new ExpFunc(function (args) {
    return new ExpBool(args[0].val);
  }),
  Number: new ExpFunc(function (args) {
    return new ExpNumber(args[0].val);
  }),
  BigInt: new ExpFunc(function (args) {
    return new ExpBigInt(args[0].val);
  }),
  String: new ExpFunc(function (args) {
    return new ExpString(args[0].val);
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
  Complex: new ExpFunc(function (args) {
    if (args[0].type == 'string') return new ExpComplex(args[0].val);
    else if (args.length == 1) return new ExpComplex(args[0], new ExpNumber(0));
    else return new ExpComplex(args[0], args[1]);
  }),
  Matrix: new ExpFunc(function (args) {
    if (args.length == 1) return new ExpMatrix(args[0]);
    else return new ExpMatrix(args[0].val, args[1].val);
  }),
  Surreal: new ExpFunc(function (args) {
    if (args[0].type == 'array') {
      return new ExpSurreal(args[0].val.map(x => x.val));
    } else if (args[0].type == 'string') {
      return new ExpSurreal(args[0].val);
    }
  }),
  globals: new ExpFunc(function (args, globals, locals) {
    return new ExpObject(globals);
  }),
  locals: new ExpFunc(function (args, globals, locals) {
    return new ExpObject(locals);
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
    return new ExpString(ObjToText(args[0]));
  }),
  print: new ExpFunc(function (args) {
    if (args[0].type == 'string') calcarr.push(args[0].val);
    else calcarr.push(ObjToText(args[0]));
    CalcArrRefresh();
    return CL_UNDEFINED;
  }),
  sign: new ExpFunc(function (args) {
    if (args[0].val > 0) return 1;
    else if (args[0].val < 0) return -1;
    else if (args[0].val == 0) return 0;
    else return NaN;
  }),
  abs: new ExpFunc(function (args) {
    if (args[0].val < 0) args[0].val = -args[0].val;
    if (args[0].type == 'number') return new ExpNumber(args[0].val);
    else if (args[0].type == 'bigint') return new ExpBigInt(args[0].val);
  }),
  max: new ExpFunc(function (args) {
    let mv = -Infinity;
    for (let i in args) if (args[i].val > mv) mv = args[i].val;
    if (typeof mv == 'number') return new ExpNumber(mv);
    else if (typeof mv == 'bigint') return new ExpBigInt(mv);
  }),
  min: new ExpFunc(function (args) {
    let mv = Infinity;
    for (let i in args) if (args[i].val < mv) mv = args[i].val;
    if (typeof mv == 'number') return new ExpNumber(mv);
    else if (typeof mv == 'bigint') return new ExpBigInt(mv);
  }),
  floor: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.floor(args[0].val));
    else if (args[0].type == 'bigint') return new ExpBigInt(args[0].val);
  }),
  ceil: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.ceil(args[0].val));
    else if (args[0].type == 'bigint') return new ExpBigInt(args[0].val);
  }),
  round: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.round(args[0].val));
    else if (args[0].type == 'bigint') return new ExpBigInt(args[0].val);
  }),
  trunc: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.trunc(args[0].val));
    else if (args[0].type == 'bigint') return new ExpBigInt(args[0].val);
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
  constrain: new ExpFunc(function (args) {
    return varns.min.val([varns.max.val([args[0], args[1]]), args[2]])
  }),
  dist: new ExpFunc(function (args) {
    let hl = args.length / 2;
    let ap1 = args.slice(0, hl);
    let ap2 = args.slice(h1, Infinity);
    return new ExpNumber(Math.hypot.apply(ap1.map((x, i) => ap2[i].val - x.val)));
  }),
  random: new ExpFunc(function (args) {
    if (args.length == 0) {
      return new ExpNumber(Math.random());
    } else if (args.length == 1) {
      return new ExpNumber(Math.random() * args[0].val);
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return new ExpNumber(Math.random() * dif + args[0].val);
    }
  }),
  randint: new ExpFunc(function (args) {
    if (args.length == 0) {
      return new ExpNumber(Math.round(Math.random()));
    } else if (args.length == 1) {
      return new ExpNumber(Math.floor(Math.random() * args[0].val));
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return new ExpNumber(Math.floor(Math.random() * dif + args[0].val));
    }
  }),
  randintn: new ExpFunc(function (args) {
    if (args.length == 0) {
      return new ExpBigInt(Math.round(Math.random()));
    } else if (args.length == 1) {
      if (args[0].val < 0) return varns.randintn.val([new ExpBigNum(-args[0].val)]);
      if (args[0].val < BigInt(4294967296)) {
        return ExpDivide(new ExpBigInt(randBigInt32()), ExpDivide(args[0], new ExpBigInt(4294967296)));
      }
    } else if (args.length == 2) {
      let dif = args[1].val - args[0].val;
      return ExpAdd(BigInt(dif), varns.randintn.val([new ExpBigInt(dif)]));
    }
  }),
  randgauss: new ExpFunc(function (args) {
    if (args.length == 0) return new ExpNumber(gaussianBoxMuller());
    else if (args.length == 1) return new ExpNumber(gaussianBoxMuller() * args[0].val);
    else if (args.length == 2) return new ExpNumber(gaussianBoxMuller() * args[0].val + args[1].val);
  }),
  sq: new ExpFunc(function (args) {
    return ExpMultiply(args[0], args[0]);
  }),
  sqrt: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.sqrt(args[0].val));
  }),
  cbrt: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.cbrt(args[0].val));
  }),
  hypot: new ExpFunc(function (args) {
    if (args.every(x => x.type == 'number')) return new ExpNumber(Math.hypot.apply(Math, args.map(x => x.val)));
  }),
  exp: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.exp(args[0].val));
  }),
  log: new ExpFunc(function (args) {
    let val;
    if (args[0].type == 'number') {
      if (args[1]) {
        if (args[1].val == 2) return Math.log2(args[0].val);
        else if (args[1].val == 10) return Math.log10(args[0].val);
        else val = Math.log(args[0].val);
      } else val = Math.log(args[0].val);
    } else if (args[0].type == 'bigint') {
      if (args[1]) {
        if (args[1].val == 10) return varns.log10.val(args[0]).val;
        else val = varns.log10.val(args[0]).val * varns.ln10.val;
      } else val = varns.log10.val(args[0]).val * varns.ln10.val;
    }
    if (args.length == 1) return val;
    else return val / Math.log(args[1].val);
  }),
  log10: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      return new ExpNumber(Math.log10(args[0].val));
    } else if (args[0].type == 'bigint') {
      let es = args[0].val.toString();
      let tv = Math.log10(Number(es.substr(0, 12)));
      return new ExpNumber((tv - Math.floor(tv)) - 1 + es.length);
    }
  }),
  log2: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      return new ExpNumber(Math.log2(args[0].val));
    } else if (args[0].type == 'bigint') {
      return new ExpNumber(varns.log10.val(args[0]).val * varns.ln10.val / varns.ln2.val);
    }
  }),
  pow: new ExpFunc(function (args) {
    return ExpExponentiate(args[0], args[1]);
  }),
  root: new ExpFunc(function (args) {
    if (args[0].type == 'number' && args[1].type == 'number') {
      return new ExpNumber(args[0].val ** (1 / args[1].val));
    } else if (args[0].type == 'bigint' && args[1].type == 'bigint') {
      return new ExpBigInt(args[0].val ** (1 / args[1].val));
    }
  }),
  tet: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(tet(args[0].val, args[1].val));
  }),
  sroot: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(sroot(args[0].val, args[1].val));
  }),
  slog: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(slog(args[0].val, args[1].val));
  }),
  fact: new ExpFunc(function (args) {
    if (args[0].type == 'number') {
      let fv = args[0].val;
      if (Number.isInteger(fv)) {
        if (fv >= 0) {
          let bv = 1;
          for (; fv > 0 && bv < Infinity; fv--) bv *= fv;
          return new ExpNumber(bv);
        } else if (fv < 0) {
          return new ExpNumber(NaN);
        }
      } else {
        return new ExpNumber(gamma(fv + 1));
      }
    } else if (args[0].type == 'bigint') {
      if (fv >= 0) {
        for (let bv = BigInt(1); fv > 0 && bv < Infinity; fv--) bv *= fv;
        return new ExpBigInt(bv);
      } else if (fv < 0) {
        return new ExpNumber(NaN);
      }
    }
  }),
  gamma: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(gamma(args[0].val));
  }),
  degrees: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(args[0].val / Math.PI * 180);
  }),
  radians: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(args[0].val / 180 * Math.PI);
  }),
  sin: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.sin(args[0].val));
  }),
  cos: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.cos(args[0].val));
  }),
  tan: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.tan(args[0].val));
  }),
  asin: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.asin(args[0].val));
  }),
  acos: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.acos(args[0].val));
  }),
  atan: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.atan(args[0].val));
  }),
  atan2: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.atan2(args[0].val, args[1].val));
  }),
  sinh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.sinh(args[0].val));
  }),
  cosh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.cosh(args[0].val));
  }),
  tanh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.tanh(args[0].val));
  }),
  asinh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.asinh(args[0].val));
  }),
  acosh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.acosh(args[0].val));
  }),
  atanh: new ExpFunc(function (args) {
    if (args[0].type == 'number') return new ExpNumber(Math.atanh(args[0].val));
  }),
  tohexstr: new ExpFunc(function (args) {
    return new ExpString(args[0].val.toString(16));
  }),
  tooctstr: new ExpFunc(function (args) {
    return new ExpString(args[0].val.toString(8));
  }),
  tobinstr: new ExpFunc(function (args) {
    return new ExpString(args[0].val.toString(2));
  }),
  todecstr: new ExpFunc(function (args) {
    return new ExpString(args[0].val.toString(10));
  }),
  tobasestr: new ExpFunc(function (args) {
    return new ExpString(args[0].val.toString(args[1].val));
  }),
  fromhexstr: new ExpFunc(function (args) {
    return new ExpNumber(parseInt(args[0].val, 16));
  }),
  fromhexstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 16)) * (BigInt(16) ** em);
    }
    return new ExpBigInt(bi);
  }),
  fromoctstr: new ExpFunc(function (args) {
    return new ExpNumber(parseInt(args[0].val, 8));
  }),
  fromoctstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 8)) * (BigInt(8) ** em);
    }
    return new ExpBigInt(bi);
  }),
  frombinstr: new ExpFunc(function (args) {
    return new ExpNumber(parseInt(args[0].val, 2));
  }),
  frombinstrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], 2)) * (BigInt(2) ** em);
    }
    return new ExpBigInt(bi);
  }),
  fromdecstr: new ExpFunc(function (args) {
    return new ExpNumber(parseInt(args[0].val, 10));
  }),
  fromdecstrn: new ExpFunc(function (args) {
    return new ExpBigInt(args[0].val);
  }),
  frombasestr: new ExpFunc(function (args) {
    return new ExpNumber(parseInt(args[0].val, args[1].val));
  }),
  frombasestrn: new ExpFunc(function (args) {
    let bi = BigInt(0), str = args[0].val;
    for (let i = str.length - 1, em = BigInt(0); i >= 0; i--, em++) {
      bi += BigInt(parseInt(str[i], args[1].val)) * (BigInt(args[1].val) ** em);
    }
    return new ExpBigInt(bi);
  }),
  vn: new ExpObject({e: new ExpString('val')}),
};
varns.vn.val.v = varns.vn;