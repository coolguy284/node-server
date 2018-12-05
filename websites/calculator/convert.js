function ToExpArr(val) {
  // 0123456789.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/%^|&()[]
  let ra = [];
  let bs = '';
  let ba = [];
  let bt = '';
  let pl = [];
  for (var i in val) {
    if (bt == '') {
      if (NUM.indexOf(val[i]) > -1) {
        bs += val[i];
        bt = 'number';
      } else if (STR.indexOf(val[i]) > -1) {
        bt = 'string';
        ba.push(val[i], false, 0, '');
      } else if (OPS.indexOf(val[i]) > -1) {
        let li = ra[ra.length - 1];
        if (li !== undefined) {
          if (li.type == 'op' && li.val == '*' && OPSA.indexOf(val[i]) > -1) {
            li.val += val[i];
          } else {
            ra.push(new ExpOperator(val[i]));
          }
        } else {
          ra.push(new ExpOperator(val[i]));
        }
      } else if (val[i] == '(') {
        if (Object.prototype.toString.call(ra[ra.length - 1]) == '[object Array]') {
          ra.push(new ExpOperator('*'));
        }
        bt = 'paren';
        pl = ['p'];
      } else if (val[i] == '[') {
        ba = new ExpArray([]);
        bt = 'array';
        pl = ['a'];
      } else if (VAR.indexOf(val[i]) > -1) {
        bs += val[i];
        bt = 'var';
      }
    } else if (bt == 'number') {
      if (NUMA.indexOf(val[i]) > -1) {
        bs += val[i];
      } else if (VAR.indexOf(val[i]) > -1) {
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
      if (VAR.indexOf(val[i]) > -1) {
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
    } else if (bt == 'string') {
      if (ba[1] && ba[2] == 0) {
        if (val[i] == '\\') {
          bs += '\\';
          ba[1] = false;
        } else if (val[i] == 'n') {
          bs += '\n';
          ba[1] = false;
        } else if (val[i] == 't') {
          bs += '\t';
          ba[1] = false;
        } else if (val[i] == 'x') {
          ba[2] = 1;
        } else if (val[i] == 'u') {
          ba[2] = 4;
        } else if (val[i] == 'U') {
          ba[2] = 9;
        } else {
          bs += val[i];
          ba[1] = false;
        }
      } else if (ba[1] && ba[2] == 2) {
        ba[3] += val[i];
        ba[2] = 3;
      } else if (ba[1] && ba[2] == 3) {
        ba[3] += val[i];
        bs += String.fromCharCode(parseInt(ba[3], 16));
        ba[1] = false;
        ba[2] = 0;
        ba[3] = '';
      } else if (ba[1] && ba[2] == 4) {
        if (val[i] != '{') {
          ba[3] += val[i];
          ba[2] = 5;
        } else {
          ba[2] = 8;
        }
      } else if (ba[1] && ba[2] <= 6) {
        ba[3] += val[i];
        ba[2]++;
      } else if (ba[1] && ba[2] == 7) {
        ba[3] += val[i];
        bs += String.fromCharCode(parseInt(ba[3], 16));
        ba[1] = false;
        ba[2] = 0;
        ba[3] = '';
      } else if (ba[1] && ba[2] == 8) {
        if (val[i] != '}') {
          ba[3] += val[i];
        } else {
          bs += String.fromCharCode(parseInt(ba[3], 16));
          ba[1] = false;
          ba[2] = 0;
          ba[3] = '';
        }
      } else if (ba[1] && ba[2] == 9) {
        ba[3] = val[i];
        ba[2] = 10;
      } else if (ba[1] && ba[2] <= 15) {
        ba[3] += val[i];
        ba[2]++;
      } else if (ba[1] && ba[2] == 16) {
        ba[3] += val[i];
        bs += String.fromCharCode(parseInt(ba[3], 16));
        ba[1] = false;
        ba[2] = 0;
        ba[3] = '';
      } else {
        if (val[i] == ba[0]) {
          ra.push(new ExpString(bs));
          bs = '';
          bt = '';
          ba.splice(0, Infinity);
        } else if (val[i] == '\\') {
          ba[1] = true;
        } else {
          bs += val[i];
        }
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
  } else if (bt == 'paren' || bt == 'funccall' || bt == 'string') {
    throw new SyntaxError('parenthesis or bracket mismatch');
  }
  return ra;
}