function FuncCall(nam, val) {
  nam = nam[0].val;
  if (nam == 'mat') {
    return new ExpMatrix(val);
  } else {
    return new ExpFuncCall(nam, val);
  }
}
function FuncCallProp(nam, val) {
  if (nam == 'pow') {
    if (val[0].type == 'num' && val[1].type == 'num') {
      return new ExpNumber(val[0].val ** val[1].val);
    } else if (val[0].type == 'bignum' && val[1].type == 'bignum') {
      return new ExpBigNum(val[0].val ** val[1].val);
    }
  } else {
    throw new Error('nonexistent function');
  }
}