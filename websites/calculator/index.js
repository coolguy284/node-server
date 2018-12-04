// jshint maxerr:1000 -W041 -W051 -W060 -W061
var calcarr = [];
var cinphist = [];
var histind = 0;
var currtext = '';
function SettingsTogg() {
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
function ObjToText(val) {
  if (val.type == 'bool') {
    return '' + val.val
  } else if (val.type == 'num') {
    return '' + val.val
  } else if (val.type == 'bignum') {
    return '' + val.val + 'n'
  }
}
function ParseText(val) {
  let rval;
  try {
    if (val[0] == ':') {
      rval = inspect(eval(val.substr(1, Infinity)));
    } else if (val.indexOf('=') > 0) {
      let st = val.split('=');
      varns[st[0]] = ParseExpArr(ToExpArr(st[1]))[0][0];
      rval = undefined;
    } else if (val.substr(0, 4) == 'del ') {
      delete varns[val.substr(4, Infinity)];
      rval = undefined;
    } else if (val.substr(0, 7) == 'delete ') {
      delete varns[val.substr(7, Infinity)];
      rval = undefined;
    } else {
      rval = ObjToText(ParseExpArr(ToExpArr(val))[0][0]);
    }
  } catch (e) {
    rval = e.toString() + '\n' + e.stack;
  }
  if (ccul.value == 'cat') {
    rval = rval + ' cats';
  } else {
    rval = rval;
  }
  rval = rval.replace(/\n/g, '<br>');
  if (parseInt(enenh.value) == 1) {
    document.write('<body style = "background:#e8e8ff;"><div style = "text-align:center;padding:40px;"><p style = "font-family:monospace;font-size:48px;">The answer is:</p><p style = "font-family:monospace;font-size:72px;">' + rval + '</p><p style = "font-family:monospace;font-size:48px;">Thank you for using my calculator!</p></div></body>');
  }
  return rval;
}
cinp.addEventListener('keydown', function (e) {
  if (e.keyCode == 13) {
    calcarr.push('>> ' + cinp.value);
    let pv = ParseText(cinp.value);
    if (pv !== undefined) calcarr.push('<- ' + pv);
    if (calcarr.length > 100) calcarr.splice(0, calcarr.length - 100);
    calcres.innerHTML = calcarr.join('<br>');
    if (cinphist[cinphist.length-1] != cinp.value) {
      cinphist.push(cinp.value);
    }
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