var varns = {
  true: new ExpBool(true),
  false: new ExpBool(false),
  NaN: new ExpNumber(NaN),
  Infinity: new ExpNumber(Infinity),
  pi: new ExpNumber(Math.PI),
  e: new ExpNumber(Math.E),
  sqrt2: new ExpNumber(Math.SQRT2),
  sqrt1_2: new ExpNumber(Math.SQRT1_2)
};