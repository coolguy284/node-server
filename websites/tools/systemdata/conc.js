function SetEnd(txt) {
  if (txt.createTextRange) {
    //IE
    var FieldRange = txt.createTextRange();
    FieldRange.moveStart('character', txt.value.length);
    FieldRange.collapse();
    FieldRange.select();
  } else {
    //Firefox and Opera
    txt.focus();
    var length = txt.value.length;
    txt.setSelectionRange(length, length);
  }
}
var conchist = [], histind = 0, currtext = '', colog = [];
while (colog.length < 100) colog.push(['', '{}']);
function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function unescapeHTML(str) {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function forma(arra) {
  arr = arra.slice(0, Infinity);
  for (var i in arr) {
    arr[i] = arr[i][1].replace('{}', escapeHTML(arr[i][0]));
  }
  return arr.join('<br>') + '<br><br>';
}
function cologaddn(value) {
  if (value == 'clear') {
    colog = [];
    while (colog.length < 100) {
      colog.push(['', '{}']);
    }
    constext.innerHTML = forma(colog);
  } else {
    colog.push(value);
    if (colog.length > 100) {
      colog.splice(0, colog.length - 100);
    }
    constext.innerHTML = forma(colog);
  }
  constext.scrollTop = constext.scrollHeight;
}
function Send() {
  wpm(conc.value);
  if (conchist[conchist.length-1] != conc.value) {
    conchist.push(conc.value);
  }
  if (conchist.length > 100) {
    conchist.splice(0, conchist.length - 100);
  }
  conc.value = '';
  histind = conchist.length;
  currtext = '';
}
function wpm(v) {
  try {
    console.log('>> ' + v);
    resp = eval(v);
    if (resp !== undefined) {
      console.log('<- ' + inspect(resp));
    }
  } catch (e) {
    console.error('<- ' + e.toString());
    console.error(e);
  }
}
conc.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    Send();
  } else if (e.keyCode === 38) {
    if (histind > 0) {
      histind -= 1;
      conc.value = conchist[histind];
    }
    setTimeout(function(){ conc.selectionStart = conc.selectionEnd = 10000; }, 0);
    SetEnd(conc);
  } else if (e.keyCode === 40) {
    if (histind < conchist.length - 1) {
      histind += 1;
      conc.value = conchist[histind];
    } else if (histind == conchist.length - 1) {
      histind = conchist.length;
      conc.value = currtext;
    }
    setTimeout(function(){ conc.selectionStart = conc.selectionEnd = 10000; }, 0);
    SetEnd(conc);
  } else if (e.keyCode === 8) {
    histind = conchist.length;
    setTimeout(function() {currtext = conc.value;}, 0);
  }
});
conc.addEventListener('keypress', function (e) {
  if (!e.charCode) {return;}
  histind = conchist.length;
  setTimeout(function() {currtext = conc.value;}, 0);
});