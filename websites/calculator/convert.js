function ToExpArr(val) {
  // 0123456789.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/%^|&()[]
  let ra = [];
  let bs = '';
  let ba = [];
  let bt = '';
  let pl = [];
  for (var i in val) {
    if (bt == '') {
      if (NUM.indexOf(val[i]) > -1 || val[i] == '-' && ra.length == 0) {
        bs += val[i];
        bt = 'number';
      } else if (OPS.indexOf(val[i]) > -1) {
        let li = ra[ra.length - 1];
        if (li.type == 'op' && li.val == '*' && OPSA.indexOf(val[i]) > -1) {
          li.val += val[i];
        } else {
          ra.push(new ExpOperator(val[i]));
        }
      } else if (val[i] == '(') {
        bt = 'paren';
        pl = ['p'];
      } else if (val[i] == '[') {
        ba = new ExpArray([]);
        bt = 'array';
        pl = ['a'];
      } else if (STR.indexOf(val[i]) > -1) {
        bs += val[i];
        bt = 'var';
      }
    } else if (bt == 'number') {
      if (NUMA.indexOf(val[i]) > -1) {
        bs += val[i];
      } else if (STR.indexOf(val[i]) > -1) {
        ra.push(new ExpNumber(bs));
        ra.push(new ExpOperator('*'));
        bs = val[i];
        bt = 'var';
      } else if (val[i] == 'n') {
        ra.push(new ExpBigNum(bs));
        bt = 'bignum';
      } else if (OPS.indexOf(val[i]) > -1) {
        ra.push(new ExpNumber(bs));
        ra.push(new ExpOperator(val[i]));
        bs = '';
        bt = '';
      } else if (val[i] == '(') {
        ra.push(new ExpNumber(bs));
        ra.push(new ExpOperator('*'));
        bs = '';
        bt = 'paren';
        pl = ['p'];
      }
    } else if (bt == 'bignum') {
      if (STR.indexOf(val[i]) > -1) {
        ra.push(new ExpOperator('*'));
        bs = val[i];
        bt = 'var';
      } else if (OPS.indexOf(val[i]) > -1) {
        ra.push(new ExpOperator(val[i]));
        bs = '';
        bt = '';
      } else if (val[i] == '(') {
        ra.push(new ExpOperator('*'));
        bs = '';
        bt = 'paren';
        pl = ['p'];
      }
    } else if (bt == 'var') {
      if (OPS.indexOf(val[i]) > -1) {
        ra.push(new ExpVariable(bs));
        ra.push(new ExpOperator(val[i]));
        bs = '';
        bt = '';
      } else if (val[i] == '(') {
        bt = 'funccall';
        ba.push(bs);
        pl.push('p');
        bs = '';
      } else {
        bs += val[i];
      }
    } else if (bt == 'funccall') {
      if (val[i] == '(') {
        pl.push('p');
      } else if (val[i] == ')') {
        if (pl[pl.length - 1] == 'p') {
          pl.pop();
        } else {
          throw new SyntaxError('parenthesis or bracket mismatch');
        }
      } else if (val[i] == ',' && pl.length == 1) {
        ba.push(bs);
        bs = '';
      }
      if (pl.length == 0) {
        if (bs != '') ba.push(bs);
        for (var i in ba) ba[i] = ToExpArr(ba[i]);
        ra.push(FuncCall(ba[0], ba.slice(1, Infinity)));
        bs = '';
        bt = '';
        ba = [];
      } else {
        bs += val[i];
      }
    } else if (bt == 'paren') {
      if (val[i] == '(') {
        pl.push('p');
      } else if (val[i] == ')') {
        if (pl[pl.length - 1] == 'p') {
          pl.pop();
        } else {
          throw new SyntaxError('parenthesis or bracket mismatch');
        }
      }
      if (pl.length == 0) {
        ra.push(ToExpArr(bs));
        bs = '';
        bt = '';
      } else {
        bs += val[i];
      }
    } else if (bt == 'array') {
      if (val[i] == '(') {
        pl.push('p');
      } else if (val[i] == ')') {
        if (pl[pl.length - 1] == 'p') {
          pl.pop();
        } else {
          throw new SyntaxError('parenthesis or bracket mismatch');
        }
      } else if (val[i] == '[') {
        pl.push('a');
      } else if (val[i] == ']') {
        if (pl[pl.length - 1] == 'a') {
          pl.pop();
        } else {
          throw new SyntaxError('parenthesis or bracket mismatch');
        }
      } else if (val[i] == ',' && pl.length == 1) {
        ba.val.push(ToExpArr(bs));
      }
      if (pl.length == 0) {
        if (bs != '') {
          ba.val.push(ToExpArr(bs));
          bs = '';
        }
        ra.push(ba);
        ba = [];
        bt = '';
      } else {
        bs += val[i];
      }
    }
  }
  if (bt == 'number') {
    ra.push(new ExpNumber(bs));
    bs = '';
    bt = '';
  } else if (bt == 'var') {
    ra.push(new ExpVariable(bs));
    bs = '';
    bt = '';
  } else if (bt == 'paren' || bt == 'funccall') {
    throw new SyntaxError('parenthesis or bracket mismatch');
  }
  return ra;
}