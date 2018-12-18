ExpSurreal.__prototype__ = {
  
};/*
function ExpSurrealToValArr(val) {
  valarr = [];
  valstr = '';
  valexp = '';
  valmode = 'num';
  valbegin = true;
  for (var i = 0; i < val.length; i++) {
    if valmode == 'num':
      if val[i] == '-' and valbegin:
        valstr += '-';
        valbegin = false;
      elif val[i] in '0123456789.e':
        valstr += val[i];
      elif val[i] == 'w':
        if valstr == '':
          valstr = '1';
        elif valstr == '-':
          valstr = '-1';
        valexp = '';
        valmode = 'numtexp';
      elif val[i] in '+-':
        valarr.push([Number(valstr), 0.0])
        if val[i] == '-':
          valstr = '-';
        else:
          valstr = '';
        valmode = 'num';
        valbegin = true;
      if (valbegin) valbegin = false;
    elif valmode == 'numtexp':
      if val[i] == '^':
        valmode = 'exp'
        valbegin = true
      elif val[i] in '+-':
        valarr.push([Number(valstr), 1.0])
        if val[i] == '-':
          valstr = '-'
        else:
          valstr = ''
        valexp = ''
        valmode = 'num'
        valbegin = true
      else:
        valarr.push([Number(valstr), Number(valexp)])
        valexp = ''
        valmode = 'num'
        valbegin = true
    elif valmode == 'exp':
      if val[i] == '-' and valbegin:
        valexp = '-'
      elif val[i] in '0123456789.e':
        valexp += val[i]
      elif val[i] in '+-':
        valarr.push([Number(valstr), Number(valexp)])
        if (val[i] == '-') valstr = '-';
        else valstr = '';
        valexp = '';
        valmode = 'num';
        valbegin = true;
      if (valbegin) valbegin = false;
  }
  if (valmode == 'numtexp') {
    valarr.push([Number(valstr), 1.0]);
  } else {
    if (valstr.length > 0) {
      if (valexp.length > 0) valarr.push([Number(valstr), Number(valexp)]);
      else valarr.push([Number(valstr), 0.0]);
    }
  }
  return valarr;
}*/