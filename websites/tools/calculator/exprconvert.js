function ExpArrString(val, p) {
  if (p.bas[1] && p.bas[2] == 0) {
    if (val == '\\') {
      p.bs += '\\';
      p.bas[1] = false;
    } else if (val == 'n') {
      p.bs += '\n';
      p.bas[1] = false;
    } else if (val == 't') {
      p.bs += '\t';
      p.bas[1] = false;
    } else if (val == 'x') {
      p.bas[2] = 1;
    } else if (val == 'u') {
      p.bas[2] = 4;
    } else if (val == 'U') {
      p.bas[2] = 9;
    } else {
      p.bs += val;
      p.bas[1] = false;
    }
  } else if (p.bas[1] && p.bas[2] == 2) {
    p.bas[3] += val;
    p.bas[2] = 3;
  } else if (p.bas[1] && p.bas[2] == 3) {
    p.bas[3] += val;
    p.bs += String.fromCharCode(parseInt(p.bas[3], 16));
    p.bas[1] = false;
    p.bas[2] = 0;
    p.bas[3] = '';
  } else if (p.bas[1] && p.bas[2] == 4) {
    if (val != '{') {
      p.bas[3] += val;
      p.bas[2] = 5;
    } else {
      p.bas[2] = 8;
    }
  } else if (p.bas[1] && p.bas[2] <= 6) {
    p.bas[3] += val;
    p.bas[2]++;
  } else if (p.bas[1] && p.bas[2] == 7) {
    p.bas[3] += val;
    p.bs += String.fromCharCode(parseInt(p.bas[3], 16));
    p.bas[1] = false;
    p.bas[2] = 0;
    p.bas[3] = '';
  } else if (p.bas[1] && p.bas[2] == 8) {
    if (val != '}') {
      p.bas[3] += val;
    } else {
      p.bs += String.fromCharCode(parseInt(p.bas[3], 16));
      p.bas[1] = false;
      p.bas[2] = 0;
      p.bas[3] = '';
    }
  } else if (p.bas[1] && p.bas[2] == 9) {
    p.bas[3] = val;
    p.bas[2] = 10;
  } else if (p.bas[1] && p.bas[2] <= 15) {
    p.bas[3] += val;
    p.bas[2]++;
  } else if (p.bas[1] && p.bas[2] == 16) {
    p.bas[3] += val;
    p.bs += String.fromCharCode(parseInt(p.bas[3], 16));
    p.bas[1] = false;
    p.bas[2] = 0;
    p.bas[3] = '';
  } else {
    if (val == p.bas[0]) {
      p.ra.push(new ExpString(p.bs));
      p.bs = '';
      p.bt = '';
      p.bas.splice(0, Infinity);
    } else if (val == '\\') {
      p.bas[1] = true;
    } else {
      p.bs += val;
    }
  }
}
function ToExpArr(val) {
  let p = {ra: [], bs: '', objn: '', emod: false, ba: [], bas: [], bt: '', pl: []};
  for (let i in val) {
    if (p.bt == '') {
      if (NUM.indexOf(val[i]) > -1) {
        p.bs += val[i];
        p.bt = 'number';
      } else if (STR.indexOf(val[i]) > -1) {
        p.bt = 'string';
        p.bas.push(val[i], false, 0, '');
      } else if (OPS.indexOf(val[i]) > -1) {
        let li = p.ra[p.ra.length - 1];
        if (li && li.type == 'op') {
          if (OPSA[li.val] && OPSA[li.val].indexOf(val[i]) > -1) {
            li.val += val[i];
          } else {
            p.ra.push(new ExpOperator(val[i]));
          }
        } else {
          p.ra.push(new ExpOperator(val[i]));
        }
      } else if (val[i] == '(') {
        if (Object.prototype.toString.call(p.ra[p.ra.length - 1]) == '[object Array]') {
          p.ra.push(new ExpOperator('*'));
        }
        p.bt = 'paren';
        p.pl.push('p');
      } else if (val[i] == '[') {
        if (p.ra.length > 0 && p.ra[p.ra.length - 1].type == 'funccall') {
          p.bt = 'propacc';
          p.ra.push(new ExpOperator('.'));
          p.pl.push('a');
          p.bs = '';
        } else {
          p.ba = new ExpTArray([]);
          p.bt = 'array';
          p.pl.push('a');
        }
      } else if (val[i] == '{') {
        p.ba = new ExpTObject({});
        p.bt = 'object';
        p.pl.push('o');
      } else if (VAR.indexOf(val[i]) < 0) {
        p.bs += val[i];
        p.bt = 'var';
      }
    } else if (p.bt == 'number') {
      if (p.emod) {
        if (NUME.indexOf(val[i]) < 0) {
          p.ra.push(new ExpNumber(p.bs.slice(0, -1)), new ExpOperator('*'), new ExpVariable('e'));
          if (OPS.indexOf(val[i]) > -1) {
            p.ra.push(new ExpOperator(val[i]));
            p.bs = '';
            p.bt = '';
          } else if (val[i] == '(') {
            p.ba.push(new ExpVariable('e'));
            p.pl.push('p');
            p.bs = '';
            p.bt = 'funccall';
          }
        } else {
          p.bs += val[i];
        }
        p.emod = false;
      } else {
        if (val[i] == 'e') {p.bs += 'e'; p.emod = true; continue;}
        if (NUMA.indexOf(val[i]) > -1) {
          p.bs += val[i];
        } else if (VARN.indexOf(val[i]) < 0) {
          p.ra.push(new ExpNumber(p.bs));
          p.ra.push(new ExpOperator('*'));
          p.bs = val[i];
          p.bt = 'var';
        } else if (val[i] == 'n') {
          p.ra.push(new ExpBigInt(p.bs));
          p.bt = 'bigint';
        } else if (OPS.indexOf(val[i]) > -1) {
          p.ra.push(new ExpNumber(p.bs));
          p.ra.push(new ExpOperator(val[i]));
          p.bs = '';
          p.bt = '';
        } else if (val[i] == '(') {
          p.ra.push(new ExpNumber(p.bs));
          p.ra.push(new ExpOperator('*'));
          p.bs = '';
          p.bt = 'paren';
          p.pl.push('p');
        } else if (val[i] == ' ') {
          p.ra.push(new ExpNumber(p.bs));
          p.bs = '';
          p.bt = '';
        }
      }
    } else if (p.bt == 'bigint') {
      if (VAR.indexOf(val[i]) < 0) {
        p.ra.push(new ExpOperator('*'));
        p.bs = val[i];
        p.bt = 'var';
      } else if (OPS.indexOf(val[i]) > -1) {
        p.ra.push(new ExpOperator(val[i]));
        p.bs = '';
        p.bt = '';
      } else if (val[i] == '(') {
        p.ra.push(new ExpOperator('*'));
        p.bs = '';
        p.bt = 'paren';
        p.pl.push('p');
      }
    } else if (p.bt == 'string') {
      ExpArrString(val[i], p);
    } else if (p.bt == 'var') {
      if (OPS.indexOf(val[i]) > -1) {
        p.ra.push(new ExpVariable(p.bs));
        p.ra.push(new ExpOperator(val[i]));
        p.bs = '';
        p.bt = '';
      } else if (val[i] == ' ') {
        p.ra.push(new ExpVariable(p.bs));
        p.bs = '';
        p.bt = '';
      } else if (val[i] == '(') {
        p.ra.push(new ExpVariable(p.bs));
        p.ba.push(p.bs);
        p.pl.push('p');
        p.bs = '';
        p.bt = 'funccall';
      } else if (val[i] == '[') {
        p.bt = 'propacc';
        p.ra.push(new ExpVariable(p.bs));
        p.ra.push(new ExpOperator('.'));
        p.pl.push('a');
        p.bs = '';
      } else {
        p.bs += val[i];
      }
    } else if (p.bt == 'vars') {
      if (OPS.indexOf(val[i]) > -1) {
        p.ra.push(new ExpOperator(val[i]));
        p.bs = '';
        p.bt = '';
      } else if (val[i] == ' ') {
        p.bs = '';
        p.bt = '';
      } else if (val[i] == '(') {
        p.ba.push(new ExpVariable(''));
        p.pl.push('p');
        p.bs = '';
        p.bt = 'funccall';
      } else if (val[i] == '[') {
        p.bt = 'propacc';
        p.ra.push(new ExpOperator('.'));
        p.pl.push('a');
        p.bs = '';
      } else {
        p.bs += val[i];
      }
    } else if (p.bt == 'funccall') {
      if (p.pl[p.pl.length - 1] != 's') {
        if (val[i] == '(') {
          p.pl.push('p');
        } else if (val[i] == ')') {
          if (p.pl[p.pl.length - 1] == 'p') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '[') {
          p.pl.push('a');
        } else if (val[i] == ']') {
          if (p.pl[p.pl.length - 1] == 'a') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '{') {
          p.pl.push('o');
        } else if (val[i] == '}') {
          if (p.pl[p.pl.length - 1] == 'o') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == ',' && p.pl.length == 1) {
          p.ba.push(p.bs);
          p.bs = '';
        } else if (STR.indexOf(val[i]) > -1) {
          p.pl.push('s');
          p.bas.push(val[i], false, 0, '');
        }
        if (p.pl.length == 0) {
          if (p.bs != '') p.ba.push(p.bs);
          for (let i in p.ba) p.ba[i] = ToExpArr(p.ba[i]);
          p.ra.push(FuncCall(p.ba[0], p.ba.slice(1, Infinity)));
          p.bs = '';
          p.bt = '';
          p.ba = [];
        } else {
          p.bs += val[i];
        }
      } else {
        let pobj = {ra:[],bs:'',bas:p.bas,bt:'string'};
        ExpArrString(val[i], pobj);
        if (pobj.bt == '') p.pl.pop();
        p.bs += val[i];
      }
    } else if (p.bt == 'propacc') {
      if (p.pl[p.pl.length - 1] != 's') {
        if (val[i] == '[') {
          p.pl.push('a');
        } else if (val[i] == ']') {
          if (p.pl[p.pl.length - 1] == 'a') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (STR.indexOf(val[i]) > -1) {
          p.pl.push('s');
          p.bas.push(val[i], false, 0, '');
        }
        if (p.pl.length == 0) {
          p.ra.push(ToExpArr(p.bs));
          p.bs = '';
          p.bt = 'vars';
        } else {
          p.bs += val[i];
        }
      } else {
        let pobj = {ra:[],bs:'',bas:p.bas,bt:'string'};
        ExpArrString(val[i], pobj);
        if (pobj.bt == '') p.pl.pop();
        p.bs += val[i];
      }
    } else if (p.bt == 'paren') {
      if (p.pl[p.pl.length - 1] != 's') {
        if (val[i] == '(') {
          p.pl.push('p');
        } else if (val[i] == ')') {
          if (p.pl[p.pl.length - 1] == 'p') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (STR.indexOf(val[i]) > -1) {
          p.pl.push('s');
          p.bas.push(val[i], false, 0, '');
        }
        if (p.pl.length == 0) {
          p.ra.push(ToExpArr(p.bs));
          p.bs = '';
          p.bt = '';
        } else {
          p.bs += val[i];
        }
      } else {
        let pobj = {ra:[],bs:'',bas:p.bas,bt:'string'};
        ExpArrString(val[i], pobj);
        if (pobj.bt == '') p.pl.pop();
        p.bs += val[i];
      }
    } else if (p.bt == 'array') {
      if (p.pl[p.pl.length - 1] != 's') {
        if (val[i] == '(') {
          p.pl.push('p');
        } else if (val[i] == ')') {
          if (p.pl[p.pl.length - 1] == 'p') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '[') {
          p.pl.push('a');
        } else if (val[i] == ']') {
          if (p.pl[p.pl.length - 1] == 'a') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '{') {
          p.pl.push('o');
        } else if (val[i] == '}') {
          if (p.pl[p.pl.length - 1] == 'o') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == ',' && p.pl.length == 1) {
          p.ba.val.push(ToExpArr(p.bs));
          p.bs = '';
        } else if (STR.indexOf(val[i]) > -1) {
          p.pl.push('s');
          p.bas.push(val[i], false, 0, '');
        }
        if (p.pl.length == 0) {
          if (p.bs != '') {
            p.ba.val.push(ToExpArr(p.bs));
            p.bs = '';
          }
          p.ra.push(p.ba);
          p.ba = [];
          p.bt = '';
        } else {
          p.bs += val[i];
        }
      } else {
        let pobj = {ra:[],bs:'',bas:p.bas,bt:'string'};
        ExpArrString(val[i], pobj);
        if (pobj.bt == '') p.pl.pop();
        p.bs += val[i];
      }
    } else if (p.bt == 'object') {
      if (p.pl[p.pl.length - 1] != 's') {
        if (val[i] == '(') {
          p.pl.push('p');
        } else if (val[i] == ')') {
          if (p.pl[p.pl.length - 1] == 'p') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '[') {
          p.pl.push('a');
        } else if (val[i] == ']') {
          if (p.pl[p.pl.length - 1] == 'a') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == '{') {
          p.pl.push('o');
        } else if (val[i] == '}') {
          if (p.pl[p.pl.length - 1] == 'o') p.pl.pop();
          else throw new SyntaxError('expected ' + PARR[p.pl[p.pl.length - 1]] + ' got ' + val[i]);
        } else if (val[i] == ':' && p.pl.length == 1) {
          p.objn = ToExpArr(p.bs)[0].val;
          p.bs = '';
        } else if (val[i] == ',' && p.pl.length == 1) {
          p.ba.val[p.objn] = ToExpArr(p.bs);
          p.bs = '';
          p.objn = '';
        } else if (STR.indexOf(val[i]) > -1) {
          p.pl.push('s');
          p.bas.push(val[i], false, 0, '');
        }
        if (p.pl.length == 0) {
          if (p.bs != '') {
            p.ba.val[p.objn] = ToExpArr(p.bs);
            p.bs = '';
          }
          p.ra.push(p.ba);
          p.ba = [];
          p.bt = '';
        } else {
          p.bs += val[i];
        }
      } else {
        let pobj = {ra:[],bs:'',bas:p.bas,bt:'string'};
        ExpArrString(val[i], pobj);
        if (pobj.bt == '') p.pl.pop();
        p.bs += val[i];
      }
    }
  }
  if (p.bt == 'number') {
    p.ra.push(new ExpNumber(p.bs));
    p.bs = '';
    p.bt = '';
  } else if (p.bt == 'var') {
    p.ra.push(new ExpVariable(p.bs));
    p.bs = '';
    p.bt = '';
  } else if (p.bt == 'paren' || p.bt == 'funccall' || p.bt == 'array' || p.bt == 'object' || p.bt == 'string') {
    throw new SyntaxError('parenthesis, bracket, or object mismatch');
  }
  for (var i in p.ra) if (p.ra[i].type == 'variable' && OPSKW.indexOf(p.ra[i].val) > -1) p.ra[i] = new ExpOperator(p.ra[i].val);
  return p.ra;
}