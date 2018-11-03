// jshint maxerr:1000 -W041 -W051 -W060 -W061
var calcarr = [];
var cinphist = [];
var histind = 0;
var currtext = '';
var SettingsTogg = function SettingsTogg() {
  if (settins.style.cssText == 'display: none;') {
    settins.style = 'position:fixed;top:2px;width:100%;height:400px;background:white;';
  } else {
    settins.style = 'display:none;';
  }
};
function AllComp(v) {
  if (parseInt(v) == 1) {
    ccul.style = '';
  } else {
    ccul.style = 'display:none;';
  }
}
function ShowSett(v) {
  if (parseInt(v) == 1) {
    SettingsTogg = ASettingsTogg;
    delete ASettingsTogg;
  } else {
    ASettingsTogg = SettingsTogg;
    SettingsTogg = function () {};
  }
}
function ExpNumber(val) {
  this.type = 'num';
  this.val = val;
}
function ExpBigNum(val) {
  this.type = 'bignum';
  this.val = val;
}
function ExpMatrix(val) {
  this.type = 'mat';
  this.val = val;
}
function ExpArray(val) {
  this.type = 'array';
  this.val = val;
}
function ExpOperator(val) {
  this.type = 'op';
  this.val = val;
}
function ExpFuncCall(val) {
  this.type = 'funccall';
  this.val = val;
}
function ExpFunc(val) {
  this.type = 'func';
  this.val = val;
}
function ToExpArr(val) {
  // 0123456789.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/%^|&()[]
  let ra = [];
  let bs = '';
  let ba = [];
  let bt = '';
  let pl = [];
  for (var i in val) {
    if (bt == '') {
      if ('0123456789.'.indexOf(val[i]) > -1) {
        bs += val[i];
        bt = 'number';
      } else if (val[i] == '(') {
        bt = 'paren';
        pl = ['p'];
      } else if (val[i] == '[') {
        ba = new ExpArray([]);
        bt = 'array';
        pl = ['a'];
      }
    } else if (bt == 'number') {
      if ('0123456789.'.indexOf(val[i]) > -1) {
        bs += val[i];
      }
      if ('+-*/%^|&'.indexOf(val[i]) > -1) {
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
  } else if (bt == 'paren') {
    throw new SyntaxError('parenthesis or bracket mismatch');
  }
  return ra;
}
function ParseText(val) {
  //let earr = ToExpArr(val);
  let rval;
  try {
    rval = inspect(eval(val));
  } catch (e) {
    rval = e.toString();
  }
  if (ccul.value == 'cat') {
    rval = rval + ' cats';
  } else {
    rval = rval;
  }
  if (parseInt(enenh.value) == 1) {
    document.write('<body style = "background:#e8e8ff;"><div style = "text-align:center;padding:40px;"><p style = "font-family:monospace;font-size:48px;">The answer is:</p><p style = "font-family:monospace;font-size:72px;">' + rval + '</p><p style = "font-family:monospace;font-size:48px;">Thank you for using my calculator!</p></div></body>');
  }
  return rval;
}
cinp.addEventListener('keydown', function (e) {
  if (e.keyCode == 13) {
    calcarr.push('>> ' + cinp.value);
    calcarr.push('<- ' + ParseText(cinp.value));
    if (calcarr.length > 100) {calcarr.splice(100, Infinity)}
    calcres.innerHTML = calcarr.join('<br>');
    if (cinphist[cinphist.length-1] != cinp.value) {
      cinphist.push(cinp.value);
    }
    if (cinphist.length > 100) {
      cinphist.splice(0, cinphist.length - 100);
    }
    cinp.value = '';
    histind = cinphist.length;
    currtext = '';
  } else if (e.keyCode === 38) {
    if (histind > 0) {
      histind -= 1;
      cinp.value = cinphist[histind];
    }
    setTimeout(function(){ cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
    SetEnd(cinp);
  } else if (e.keyCode === 40) {
    if (histind < cinphist.length - 1) {
      histind += 1;
      cinp.value = cinphist[histind];
    } else if (histind == cinphist.length - 1) {
      histind = cinphist.length;
      cinp.value = currtext;
    }
    setTimeout(function(){ cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
    SetEnd(cinp);
  } else if (e.keyCode === 8) {
    histind = cinphist.length;
    setTimeout(function() {currtext = cinp.value;}, 0);
  }
});
cinp.addEventListener('keypress', function (e) {
  if (!e.charCode) {return;}
  histind = cinphist.length;
  setTimeout(function() {currtext = cinp.value;}, 0);
});