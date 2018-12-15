// jshint maxerr:1000 -W041 -W051 -W060 -W061
var calcarr = [], cinphist = [], histind = 0, currtext = '';
function HelpTogg() {
  if (helpdiv.style.cssText == 'display: none;') {
    helpdiv.style = 'position:fixed;top:2px;width:100%;height:400px;background:white;';
  } else {
    helpdiv.style = 'display:none;';
  }
};
var SettingsTogg = function SettingsTogg() {
  if (settins.style.cssText == 'display: none;') {
    settins.style = 'position:fixed;top:2px;width:100%;height:400px;background:white;';
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
    return '' + val.val;
  } else if (val.type == 'bigint') {
    return '' + val.val + 'n';
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
  } else if (val.type == 'matrix') {
    if (va.indexOf(val) >= 0) return '[Circular]';
    va.push(val);
    return 'Matrix([' + val.val.map(x => '[' + x.map(y => ObjToText(y, va)) + ']').join(',\n           ') + '])';
  } else if (val.type == 'jsobj') {
    return 'JSObj { ' + inspect(val.val) + ' }';
  } else {
    return inspect(val);
  }
}
function ParseText(val) {
  let rval;
  try {
    if (val[0] == ':') rval = inspect(eval(val.substr(1, Infinity)));
    else rval = ObjToText(ParseExpArr(ToExpArr(val), varns, varns)[0][0]);
  } catch (e) {
    rval = e.toString() + '\n' + e.stack;
  }
  if (ccul.value == 'cat') rval += ' cats';
  if (rval !== undefined) rval = rval.replace(/\n/g, '<br>');
  if (parseInt(enenh.value) == 1) {
    document.write('<body style = "background:#e8e8ff;"><div style = "text-align:center;padding:40px;"><p style = "font-family:monospace;font-size:48px;">The answer is:</p><p style = "font-family:monospace;font-size:72px;">' + rval + '</p><p style = "font-family:monospace;font-size:48px;">Thank you for using my calculator!</p></div></body>');
  }
  return rval;
}
function CalcArrRefresh() {
  if (calcarr.length > 100) calcarr.splice(0, calcarr.length - 100);
  calcres.innerHTML = calcarr.join('<br>');
  calcres.scrollTop = calcres.scrollHeight;
}
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
    setTimeout(function(){ cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
    //SetEnd(cinp);
  } else if (e.keyCode === 40) {
    if (histind < cinphist.length - 1) {
      histind += 1;
      cinp.value = cinphist[histind];
    } else if (histind == cinphist.length - 1) {
      histind = cinphist.length;
      cinp.value = currtext;
    }
    setTimeout(function(){ cinp.selectionStart = cinp.selectionEnd = 10000; }, 0);
    //SetEnd(cinp);
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