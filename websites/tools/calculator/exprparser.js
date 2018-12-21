function ParseExpArr(arr, globals, locals) {
  let exp = [], op = [], dov;
  // parenthesis
  for (let i = 0; i < arr.length; i++) {
    if (Object.prototype.toString.call(arr[i]) == '[object Array]') arr[i] = ParseExpArr(arr[i], globals, locals)[0][0];
  }
  // function call, variable, property access
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].type == 'variable' && VARRESCLS(arr, i)) {
      if (arr[i].val in locals) arr[i] = locals[arr[i].val];
      else if (arr[i].val in globals) arr[i] = globals[arr[i].val];
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
        let ar = arr[i + 1].val;
        for (let j in ar) ar[j] = ParseExpArr(ar[j], globals, locals)[0][0];
        let fcres = FuncCallProp(arr[i], ar, globals, locals);
        if (fcres === undefined) throw new Error('function returned undefined');
        arr.splice(i, 2, fcres);
        clss = true;
      }
    }
  }
  // logical not, bitwise not, unary plus, unary negation, typeof, void, delete : right > left
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
          arr.splice(i, 2, new ExpString(arr[i + 1].type));
        } else if (arr[i].val == 'void') {
          arr.splice(i, 2, CL_UNDEFINED);
        } else if (arr[i].val == 'del' || arr[i].val == 'delete') {
          if (arr[i + 2] && arr[i + 2].type == 'op' && arr[i + 2].val == '.') {
            let nam = arr[i + 3].val;
            delete arr[i + 1].val[nam];
            arr.splice(i, 4, new ExpBool(true));
          } else {
            let varn = arr[i + 1];
            if (varn.type != 'variable') throw new Error('delete: unexpected token');
            varn = varn.val;
            if (varn in locals) {
              arr.splice(i, 2, new ExpBool(true));
              delete locals[varn];
            } else {
              arr.splice(i, 2, new ExpBool(false));
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
  // greater than, less than, greater than equal, less than equal : left > right
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
  // equality, inequality : left > right
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
          locals[nam] = val;
          exp.splice(i, 2, val);
          op.splice(i, 1);
          nb = true;
          break;
        }
      }
    }
    dov = nb;
  }
  if (exp.length == 0) exp.push(CL_UNDEFINED);
  return [exp, op];
}