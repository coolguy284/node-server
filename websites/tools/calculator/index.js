var calcarr = [], cinphist = [], histind = 0, currtext = '';
var globalns = CreateNSCopy(varns), localns = CreateNS({});
function HelpTogg() {
  if (helpdiv.style.cssText == 'display: none;') {
    helpdiv.style = 'position:fixed;top:2px;width:calc(100% - 10px);height:400px;background-color:#ffffffff;overflow:scroll;word-break:break-word;';
  } else {
    helpdiv.style = 'display:none;';
  }
};
var SettingsTogg = function SettingsTogg() {
  if (settins.style.cssText == 'display: none;') {
    settins.style = 'position:fixed;top:2px;width:calc(100% - 10px);height:400px;background-color:white;';
  } else {
    settins.style = 'display:none;';
  }
};
function LrExp(v) {
  if (parseInt(v) == 1) {
    BIGLIMIT.digit = 1000;
    BIGLIMIT.strlen = 1000;
  } else {
    BIGLIMIT.digit = Infinity;
    BIGLIMIT.strlen = Infinity;
  }
}
function AllComp(v) {
  if (parseInt(v) == 1) {
    ccul.style = '';
  } else {
    ccul.style = 'display:none;';
    ccul.value = 'cal';
  }
}
function ShowSett(v) {
  if (parseInt(v) == 1) {
    SettingsTogg = ASettingsTogg;
    delete ASettingsTogg;
  } else {
    settins.style = 'display:none;';
    ASettingsTogg = SettingsTogg;
    SettingsTogg = function () {};
  }
}
function ObjToText(val, va) {
  if (va === undefined) va = [];
  va = Array.from(va);
  if (val.type == 'undefined') {
    return 'undefined';
  } else if (val.type == 'null') {
    return 'null';
  } else if (val.type == 'bool') {
    return '' + val.val;
  } else if (val.type == 'number') {
    if (Object.is(val.val, -0)) return '-0';
    else return '' + val.val;
  } else if (val.type == 'bigint') {
    return '' + val.val + 'n';
  } else if (val.type == 'bignum') {
    return '' + val.val.toString() + 'd';
  } else if (val.type == 'string') {
    return inspect(val.val);
  } else if (val.type == 'array') {
    if (va.indexOf(val) >= 0) return '[Circular]';
    va.push(val);
    if (val.val.length == 0) return '[]';
    return '[ ' + val.val.map(x=>ObjToText(x, va)).join(', ') + ' ]';
  } else if (val.type == 'object') {
    if (va.indexOf(val) >= 0) return '[Circular]';
    va.push(val);
    let ka = Object.keys(val.val), ba = [];
    if (ka.length == 0) return '{}';
    for (let i in ka) ba.push(inspect(ka[i]) + ': ' + ObjToText(val.val[ka[i]], va));
    return '{ ' + ba.join(', ') + ' }';
  } else if (val.type == 'func') {
    if (val.ftype == 'js') return '[Native Function]';
    else return '[Function: ' + inspect(val.source) + ']';
  } else if (val.type == 'complex') {
    return '(' + ObjToText(val.a) + (ExpGreaterThanEqual(val.b, GetNumber(0)).val ? ('+' + ObjToText(val.b)) : ObjToText(val.b)) + 'i)';
  } else if (val.type == 'matrix') {
    if (va.indexOf(val) >= 0) return '[Circular]';
    va.push(val);
    return 'Matrix([' + val.val.map(x => '[' + x.map(y => ObjToText(y, va)).join(', ') + ']').join(',\n           ') + '])';
  } else if (val.type == 'surreal') {
    return ExpSurrToStr(val.valarr);
  } else if (val.type == 'jsobj') {
    return 'JSObj { ' + inspect(val.val) + ' }';
  } else if (val.toString !== undefined) {
    return val.toString();
  } else {
    return inspect(val);
  }
}
function ParseText(val) {
  let rval;
  try {
    if (val[0] == ':') rval = inspect(eval(val.substr(1, Infinity)));
    else rval = ObjToText(ParseExpArr(ToExpArr(val), globalns, localns)[0][0]);
  } catch (e) {
    rval = e.toString() + '\n' + e.stack.replace(/\n$/, '');
  }
  if (realmode.value == 1) {
    let rv = Math.random(), rm;
    if (rval == 'true') {
      if (rv < 0.77) rm = 0;
      else if (rv < 0.97) rm = 1;
      else rm = 2;
    } else if (rval == 'false') {
      if (rv > 0.77) rm = 0;
      else if (rv > 0.57) rm = 1;
      else rm = 2;
    } else if (rval == 'NaN') {
      rm = 6;
    } else if (rval == '0') {
      rm = 7;
    } else if (rval == '-0') {
      rm = 8;
    } else if (rval == 'Infinity') {
      rm = 9;
    } else if (rval == '-Infinity') {
      rm = 10;
    } else {
      if (rv < 0.75) rm = 3;
      else if (rv < 0.95) rm = 4;
      else rm = 5;
    }
    if (rm == 0) rval = '7';
    else if (rm == 1) rval = '21';
    else if (rm == 2) {
      rval = '<a href = "' + pds + '/r?e=aHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi8yLzI3L0hpbGxhcnlfQ2xpbnRvbl9vZmZpY2lhbF9TZWNyZXRhcnlfb2ZfU3RhdGVfcG9ydHJhaXRfY3JvcC5qcGcvODAwcHgtSGlsbGFyeV9DbGludG9uX29mZmljaWFsX1NlY3JldGFyeV9vZl9TdGF0ZV9wb3J0cmFpdF9jcm9wLmpwZw==">The Answer</a>';
    } else if (rm == 3) rval = 'yes';
    else if (rm == 4) rval = 'no';
    else if (rm == 5) rval = '<a href = "https://en.wikipedia.org/wiki/Dentistry">The Answer</a>';
    else if (rm == 6) rval = 'NaCl';
    else if (rm == 7) rval = 'zero\'s the hero';
    else if (rm == 8) rval = 'negative zero?';
    else if (rm == 9) rval = 'Did you mean: <a href = "https://en.wikipedia.org/wiki/Ordinal_number"><i>א‎<sub>0</sub></i></a>';
    else if (rm == 10) rval = 'Did you mean: <a href = "https://en.wikipedia.org/wiki/Infinity"><i>Infinity</i></a>';
  }
  if (ccul.value == 'cat') rval += ' cats';
  if (rval !== undefined) rval = rval.replace(/\n/g, '<br>');
  if (parseInt(enenh.value) == 1) {
    document.write('<body style = "background-color:#e8e8ff;"><div style = "text-align:center;padding:40px;"><p style = "font-family:monospace;font-size:48px;">The answer is:</p><p style = "font-family:monospace;font-size:72px;">' + rval + '</p><p style = "font-family:monospace;font-size:48px;">Thank you for using my calculator!</p></div></body>');
  }
  return rval;
}
function CalcArrRefresh() {
  if (calcarr.length > 100) calcarr.splice(0, calcarr.length - 100);
  calcres.innerHTML = calcarr.join('<br>');
  calcres.scrollTop = calcres.scrollHeight;
}
onload = function () {
  onload_typessupp();
  onload_namespace();
  let cd = new Date();
  if (cd.getMonth() == 3 && cd.getDate() == 1) {
    realmode.value = 1;
    calcarr.push('Realmode is turned on (not possibly connected to the date), go to Settings/Special Settings to turn off.');
    CalcArrRefresh();
  }
};
cinp.addEventListener('keydown', function (e) {
  if (e.keyCode == 13) {
    calcarr.push('>> ' + cinp.value);
    let pv = ParseText(cinp.value);
    if (pv !== undefined) calcarr.push('<- ' + pv);
    CalcArrRefresh();
    if (cinphist[cinphist.length-1] != cinp.value) cinphist.push(cinp.value);
    if (cinphist.length > 100) cinphist.splice(0, cinphist.length - 100);
    cinp.value = '';
    histind = cinphist.length;
    currtext = '';
  } else if (e.keyCode === 38) {
    if (histind > 0) {
      histind -= 1;
      cinp.value = cinphist[histind];
    }
    setTimeout(function () { cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
  } else if (e.keyCode === 40) {
    if (histind < cinphist.length - 1) {
      histind += 1;
      cinp.value = cinphist[histind];
    } else if (histind == cinphist.length - 1) {
      histind = cinphist.length;
      cinp.value = currtext;
    }
    setTimeout(function () { cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
  } else if (e.keyCode === 8) {
    histind = cinphist.length;
    setTimeout(function () {currtext = cinp.value;}, 0);
  }
});
cinp.addEventListener('keypress', function (e) {
  if (!e.charCode) {return;}
  histind = cinphist.length;
  setTimeout(function () {currtext = cinp.value;}, 0);
});