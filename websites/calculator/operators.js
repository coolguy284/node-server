function ExpExponentiate(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val ** val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val ** val2.val);
  } else {
    throw new Error('type mismatch');
  }
}
function ExpMultiply(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val * val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val * val2.val);
  } else {
    throw new Error('type mismatch');
  }
}
function ExpDivide(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val / val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val / val2.val);
  } else {
    throw new Error('type mismatch');
  }
}
function ExpRemainder(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val % val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val % val2.val);
  } else {
    throw new Error('type mismatch');
  }
}
function ExpAdd(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val + val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val + val2.val);
  } else {
    throw new Error('type mismatch');
  }
}
function ExpSubtract(val1, val2) {
  if (val1.type == 'num' && val2.type == 'num') {
    return new ExpNumber(val1.val - val2.val);
  } else if (val1.type == 'bignum' && val2.type == 'bignum') {
    return new ExpBigNum(val1.val - val2.val);
  } else {
    throw new Error('type mismatch');
  }
}