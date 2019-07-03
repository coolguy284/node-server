function ParseExpArr(arr, globals, locals) {
  arr = arr.slice();
  let exp = [], op = [], dov;
  // parenthesis
  for (let i = 0; i < arr.length; i++) {
    if (Object.prototype.toString.call(arr[i]) == '[object Array]') arr[i] = ParseExpArr(arr[i], globals, locals)[0][0];
  }
  // variable, property access, function call
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].type == 'variable' && VARRESCLS(arr, i)) {
      if (arr[i].val in locals.val) arr[i] = locals.val[arr[i].val];
      else if (arr[i].val in globals.val) arr[i] = globals.val[arr[i].val];
      else throw new Error('variable ' + arr[i].val + ' nonexistent');
    } else if (arr[i].type == 'tarray') {
      for (let j in arr[i].val) arr[i].val[j] = ParseExpArr(arr[i].val[j], globals, locals)[0][0];
      arr[i] = new ExpArray(arr[i].val);
    } else if (arr[i].type == 'tobject') {
      for (let j in arr[i].val) arr[i].val[j] = ParseExpArr(arr[i].val[j], globals, locals)[0][0];
      arr[i] = new ExpObject(arr[i].val);
    }
    let clss = true;
    while (clss) {
      clss = false;
      while (PROPACCCLS(arr, i)) {
        arr.splice(i, 3, ExpPropAcc(arr[i], arr[i + 2]));
        clss = true;
      }
      if (arr[i + 1] && arr[i + 1].type == 'funccall') {
        let ar = arr[i + 1].val.slice();
        for (let j in ar) ar[j] = ParseExpArr(ar[j], globals, locals)[0][0];
        let fcres = FuncCallProp(arr[i], ar, globals, locals);
        if (fcres === undefined) throw new Error('function returned undefined');
        arr.splice(i, 2, fcres);
        clss = true;
      }
    }
  }
  // logical not, bitwise not, unary plus, unary minus, typeof, void, delete : right > left
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = arr.length - 1; i >= 0; i--) {
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
          if (arr[i - 1] && arr[i - 1].type != 'op') continue;
          arr.splice(i, 2, ExpUnaryPlus(arr[i + 1]));
          nb = true;
          break;
        } else if (arr[i].val == '-') {
          if (arr[i - 1] && arr[i - 1].type != 'op') continue;
          arr.splice(i, 2, ExpUnaryMinus(arr[i + 1]));
          nb = true;
          break;
        } else if (arr[i].val == 'typeof') {
          arr.splice(i, 2, ExpTypeof(arr[i + 1]));
        } else if (arr[i].val == 'void') {
          arr.splice(i, 2, GetUndefined());
        } else if (arr[i].val == 'del' || arr[i].val == 'delete') {
          if (arr[i + 2] && arr[i + 2].type == 'op' && arr[i + 2].val == '.') {
            let nam = arr[i + 3].val;
            delete arr[i + 1].val[nam];
            arr.splice(i, 4, GetBool(true));
          } else {
            let varn = arr[i + 1];
            if (varn.type != 'variable') throw new Error('delete: unexpected token');
            varn = varn.val;
            if (varn in locals.val) {
              arr.splice(i, 2, GetBool(true));
              delete locals.val[varn];
            } else {
              arr.splice(i, 2, GetBool(false));
            }
          }
        }
      }
    }
    dov = nb;
  }
  // split up into exp and op
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 == 0) exp.push(arr[i]);
    else op.push(arr[i].val);
  }
  // exponents : right > left
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = op.length - 1; i >= 0; i--) {
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
    for (let i = 0; i < op.length; i++) {
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
    for (let i = 0; i < op.length; i++) {
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
  // bitwise left shift, bitwise right shift : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '<<') {
        exp.splice(parseInt(i), 2, ExpBitwiseLeftShift(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      } else if (op[i] == '>>') {
        exp.splice(parseInt(i), 2, ExpBitwiseRightShift(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // greater than, less than, greater than or equal, less than or equal : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '>') {
        exp.splice(i, 2, ExpGreaterThan(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      } else if (op[i] == '<') {
        exp.splice(i, 2, ExpLessThan(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      } else if (op[i] == '>=') {
        exp.splice(i, 2, ExpGreaterThanEqual(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      } else if (op[i] == '<=') {
        exp.splice(i, 2, ExpLessThanEqual(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // equality, inequality, true equality : left > right
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '==') {
        exp.splice(i, 2, ExpEqual(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      } else if (op[i] == '!=') {
        exp.splice(i, 2, ExpNotEqual(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      } else if (op[i] == 'is') {
        exp.splice(i, 2, ExpIs(exp[i], exp[i + 1]));
        op.splice(i, 1);
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
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '&') {
        exp.splice(i, 2, ExpBitwiseAnd(exp[i], exp[i + 1]));
        op.splice(i, 1);
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
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '#') {
        exp.splice(i, 2, ExpBitwiseXor(exp[i], exp[i + 1]));
        op.splice(i, 1);
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
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '|') {
        exp.splice(i, 2, ExpBitwiseOr(exp[i], exp[parseInt(i) + 1]));
        op.splice(i, 1);
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
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '&&') {
        exp.splice(i, 2, ExpLogicalAnd(exp[i], exp[i + 1]));
        op.splice(i, 1);
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
    for (let i = 0; i < op.length; i++) {
      if (op[i] == '||') {
        exp.splice(i, 2, ExpLogicalOr(exp[i], exp[i + 1]));
        op.splice(i, 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
  // assignment : right > left
  dov = true;
  while (dov) {
    let nb = false;
    for (let i = op.length - 1; i >= 0; i--) {
      if (op[i] == '=') {
        if (op[i - 1] && op[i - 1] == '.') {
          let nam = exp[i].val, val = exp[i + 1];
          exp[i - 1].val[nam] = val;
          exp.splice(i - 1, 3, val);
          op.splice(i - 1, 2);
          nb = true;
          break;
        } else {
          if (exp[i].type != 'variable') throw new Error('invalid left-hand side in assignment');
          let nam = exp[i].val, val = exp[i + 1];
          locals.val[nam] = val;
          exp.splice(i, 2, val);
          op.splice(i, 1);
          nb = true;
          break;
        }
      }
    }
    dov = nb;
  }
  if (exp.length == 0) exp.push(GetUndefined());
  return [exp, op];
}