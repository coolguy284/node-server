function ParseExpArr(arr) {
  let exp = [], op = [], dov;
  // parenthesis, function call, variable
  for (var i in arr) {
    if (Object.prototype.toString.call(arr[i]) == '[object Array]') {
      arr[i] = ParseExpArr(arr[i])[0][0];
    } else if (arr[i].type == 'funccall') {
      let ar = arr[i].val;
      for (let i in ar) ar[i] = ParseExpArr(ar[i])[0][0];
      arr[i] = FuncCallProp(arr[i].nam, ar);
    } else if (arr[i].type == 'variable') {
      if (arr[i].val in varns) {
        arr[i] = varns[arr[i].val];
      } else {
        throw new Error('variable ' + arr[i].val + ' nonexistent');
      }
    }
  }
  // logical not, bitwise not, unary plus, unary negation : right > left
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i].type == 'op') {
        if (arr[i].val == '!') {
          arr.splice(i, 2, ExpLogicalNot(arr[i + 1]));
          nb = true;
          break;
        } else if (arr[i].val == '~') {
          arr.splice(i, 2, ExpBitwiseNot(arr[i + 1]));
          nb = true;
          break;
        } else if (arr[i].val == '+') {
          if (arr[i - 1] !== undefined)
          if (NONUNARY.indexOf(arr[i - 1].type) > -1)
          continue;
          arr.splice(i, 2, ExpUnaryPlus(arr[i + 1]));
          nb = true;
          break;
        } else if (arr[i].val == '-') {
          if (arr[i - 1] !== undefined)
          if (NONUNARY.indexOf(arr[i - 1].type) > -1)
          continue;
          arr.splice(i, 2, ExpUnaryMinus(arr[i + 1]));
          nb = true;
          break;
        }
      }
    }
    dov = nb;
  }
  // split up into exp and op
  for (var i = 0; i < arr.length; i++) {
    if (i % 2 == 0) {
      exp.push(arr[i]);
    } else {
      op.push(arr[i].val);
    }
  }
  // exponents : right > left
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = op.length - 1; i >= 0; i--) {
      if (op[i] == '**' || op[i] == '^') {
        exp.splice(parseInt(i), 2, ExpExponentiate(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // multiply, divide, remainder : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '*') {
        exp.splice(parseInt(i), 2, ExpMultiply(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '/') {
        exp.splice(parseInt(i), 2, ExpDivide(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '%') {
        exp.splice(parseInt(i), 2, ExpRemainder(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // addition, subtraction : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '+') {
        exp.splice(parseInt(i), 2, ExpAdd(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '-') {
        exp.splice(parseInt(i), 2, ExpSubtract(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // greater than, less than, greater than equal, less than equal : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '>') {
        exp.splice(parseInt(i), 2, ExpGreaterThan(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '<') {
        exp.splice(parseInt(i), 2, ExpLessThan(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '>=') {
        exp.splice(parseInt(i), 2, ExpGreaterThanEqual(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '<=') {
        exp.splice(parseInt(i), 2, ExpLessThanEqual(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // equality, inequality : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '==') {
        exp.splice(parseInt(i), 2, ExpEqual(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '!=') {
        exp.splice(parseInt(i), 2, ExpNotEqual(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // bitwise and : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '&') {
        exp.splice(parseInt(i), 2, ExpBitwiseAnd(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // bitwise xor : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '#') {
        exp.splice(parseInt(i), 2, ExpBitwiseXor(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // bitwise or : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '|') {
        exp.splice(parseInt(i), 2, ExpBitwiseOr(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // logical and : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '&&') {
        exp.splice(parseInt(i), 2, ExpLogicaAnd(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // logical or : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == '||') {
        exp.splice(parseInt(i), 2, ExpLogicalOr(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  return [exp, op];
}