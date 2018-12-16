function ExpPropAcc(val1, val2) {
  var rv = val1.val[val2.val];;
  return rv === undefined ? CL_UNDEFINED : rv;
}
function ExpTypeof(val) {
  return new ExpString(val.type);
}
function ExpLogicalNot(val) {
  return new ExpBool(!val.val);
}
function ExpBitwiseNot(val) {
  if (val.type == 'number') return new ExpNumber(~val.val);
  else if (val.type == 'bigint') return new ExpBigInt(~val.val);
  else throw new Error('bad operand type(s) for unary ~: \'' + val.type + '\'');
}
function ExpUnaryPlus(val) {
  if (val.type == 'number' || val.type == 'string') return new ExpNumber(+val.val);
  else if (val.type == 'bigint') return new ExpBigInt(+val.val);
  else {
    if (val.__pos__) {
      let rv = val.__pos__();
      if (rv !== undefined) return rv;
    }
    throw new Error('bad operand type(s) for unary +: \'' + val.type + '\'');
  }
}
function ExpUnaryMinus(val) {
  if (val.type == 'number' || val.type == 'string') return new ExpNumber(-val.val);
  else if (val.type == 'bigint') return new ExpBigInt(-val.val);
  else {
    if (val.__neg__) {
      let rv = val.__neg__();
      if (rv !== undefined) return rv;
    }
    throw new Error('bad operand type(s) for unary -: \'' + val.type + '\'');
  }
}
function ExpExponentiate(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val ** val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    if (val1.val.toString().length * Number(val2.val) > BIGLIMIT.digit) throw new Error('large exponentation attempted, to disable warning turn off in settings.');
    return new ExpBigInt(val1.val ** val2.val);
  } else {
    throw new Error('unsupported operand type(s) for **: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpMultiply(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val * val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    if (val1.val.toString().length + val2.val.toString().length > BIGLIMIT.digit) throw new Error('large multiplication attempted, to disable warning turn off in settings.');
    return new ExpBigInt(val1.val * val2.val);
  } else if (val1.type == 'string' && val2.type == 'number') {
    if (val1.val.length * val2.val > BIGLIMIT.strlen) throw new Error('large string repeat attempted, to disable warning turn off in settings.');
    return new ExpString(val1.val.repeat(val2.val));
  } else if (val1.type == 'number' && val2.type == 'string') {
    if (val2.val.length * val1.val > BIGLIMIT.strlen) throw new Error('large string repeat attempted, to disable warning turn off in settings.');
    return new ExpString(val2.val.repeat(val1.val));
  } else {
    if (val1.__mul__) {
      let rv = val1.__mul__(val2);
      if (rv !== undefined) return rv;
      if (val2.__rmul__) {
        let rv = val2.__rmul__(val2);
        if (rv !== undefined) return rv;
      }
    }
    throw new Error('unsupported operand type(s) for *: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpDivide(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val / val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val / val2.val);
  } else {
    if (val1.__div__) {
      let rv = val1.__div__(val2);
      if (rv !== undefined) return rv;
      if (val2.__rdiv__) {
        let rv = val2.__rdiv__(val2);
        if (rv !== undefined) return rv;
      }
    }
    throw new Error('unsupported operand type(s) for /: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpRemainder(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val % val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val % val2.val);
  } else {
    throw new Error('unsupported operand type(s) for %: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpAdd(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val + val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val + val2.val);
  } else if (val1.type == 'string' && val2.type == 'string') {
    return new ExpString(val1.val + val2.val);
  } else {
    if (val1.__add__) {
      let rv = val1.__add__(val2);
      if (rv !== undefined) return rv;
      if (val2.__radd__) {
        let rv = val2.__radd__(val2);
        if (rv !== undefined) return rv;
      }
    }
    throw new Error('unsupported operand type(s) for +: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpSubtract(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val - val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val - val2.val);
  } else {
    if (val1.__sub__) {
      let rv = val1.__sub__(val2);
      if (rv !== undefined) return rv;
      if (val2.__rsub__) {
        let rv = val2.__rsub__(val2);
        if (rv !== undefined) return rv;
      }
    }
    throw new Error('unsupported operand type(s) for -: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpGreaterThan(val1, val2) {
  return new ExpBool(val1.val > val2.val);
}
function ExpLessThan(val1, val2) {
  return new ExpBool(val1.val < val2.val);
}
function ExpGreaterThanEqual(val1, val2) {
  return new ExpBool(val1.val >= val2.val);
}
function ExpLessThanEqual(val1, val2) {
  return new ExpBool(val1.val <= val2.val);
}
function ExpEqual(val1, val2) {
  return new ExpBool(val1.val == val2.val);
}
function ExpNotEqual(val1, val2) {
  return new ExpBool(val1.val != val2.val);
}
function ExpBitwiseAnd(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val & val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val & val2.val);
  } else {
    throw new Error('unsupported operand type(s) for &: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpBitwiseXor(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val ^ val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val ^ val2.val);
  } else {
    throw new Error('unsupported operand type(s) for ^: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpBitwiseOr(val1, val2) {
  if (val1.type == 'number' && val2.type == 'number') {
    return new ExpNumber(val1.val | val2.val);
  } else if (val1.type == 'bigint' && val2.type == 'bigint') {
    return new ExpBigInt(val1.val | val2.val);
  } else {
    throw new Error('unsupported operand type(s) for |: \'' + val1.type + '\' and \'' + val2.type + '\'');
  }
}
function ExpLogicalAnd(val1, val2) {
  return new ExpBool(val1.val && val2.val);
}
function ExpLogicalOr(val1, val2) {
  return new ExpBool(val1.val || val2.val);
}