function ParseExpArr(arr) {
  let exp = [], op = [], dov;
  for (var i = 0; i < arr.length; i++) {
    if (i % 2 == 0) {
      exp.push(arr[i]);
    } else {
      op.push(arr[i].val);
    }
  }
  for (var i in exp) {
    if (Object.prototype.toString.call(exp[i]) == '[object Array]') {
      exp[i] = ParseExpArr(exp[i])[0][0];
    } else if (exp[i].type == 'funccall') {
      let ar = exp[i].val;
      for (let i in ar) ar[i] = ParseExpArr(ar[i])[0][0];
      exp[i] = FuncCallProp(exp[i].nam, ar);
    } else if (exp[i].type == 'variable') {
      if (exp[i].val in varns) {
        exp[i] = varns[exp[i].val];
      } else {
        throw new Error('variable ' + exp[i].val + ' nonexistent');
      }
    }
  }
  dov = true;
  while (dov) {
    let nb = false;
    for (var i = op.length - 1; i >= 0; i--) {
      if (op[i] == '**') {
        exp.splice(parseInt(i), 2, ExpExponentiate(exp[i], exp[parseInt(i) + 1]));
        op.splice(parseInt(i), 1);
        nb = true;
        break;
      }
    }
    dov = nb;
  }
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
  return [exp, op];
}