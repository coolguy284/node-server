function ExpLogicalNot(val) {
  return new ExpBool(!val.val);
}
function ExpBitwiseNot(val) {
  if (val.type == 'num') {
    return new ExpNumber(~val.val);
  } else if (val.type == 'bignum') {
    return new ExpBigNum(~val.val);
  } else {
    throw new Error('bad operand type(s) for unary ~: \'' + val.type + '\'');
  }
}
function ExpUnaryPlus(val) {
  if (val.type == 'num' || val.type == 'string') {
    return new ExpNumber(+val.val);
  } else if (val.type == 'bignum') {
    return new ExpBigNum(+val.val);
  } else {
    throw new Error('bad operand type(s) for unary +: \'' + val.type + '\'');
  }
}
function ExpUnaryMinus(val) {
  if (val.type == 'num' || val.type == 'string') {
    return new ExpNumber(-val.val);
  } else if (val.type == 'bignum') {
    return new ExpBigNum(-val.val);
  } else {
    throw new Error('bad operand type(s) for unary -: \'' + val.type + '\'');
  }
}
function ExpExponentiate(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val ** val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val ** val2.val);
  } else {
    throw new Error('unsupported operand type(s) for **: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpMultiply(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val * val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val * val2.val);
  } else if (val1.type == 'string' && val2.type == 'num') {
    return new ExpString(val1.val.repeat(val2.val));
  } else if (val1.type == 'num' && val2.type == 'string') {
    return new ExpString(val2.val.repeat(val1.val));
  } else {
    throw new Error('unsupported operand type(s) for *: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpDivide(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val / val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val / val2.val);
  } else {
    throw new Error('unsupported operand type(s) for /: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpRemainder(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val % val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val % val2.val);
  } else {
    throw new Error('unsupported operand type(s) for %: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpAdd(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val + val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val + val2.val);
  } else if (val1.type == 'string' && val2.type == 'string') {
    return new ExpString(val1.val + val2.val);
  } else {
    throw new Error('unsupported operand type(s) for +: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpSubtract(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val - val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val - val2.val);
  } else {
    throw new Error('unsupported operand type(s) for -: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}