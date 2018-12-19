ExpSurreal.__prototype__ = {
  
};
function ExpSurrAddTerm(valarr, term, val) {
  let ind = ExpSurrHasTerm(valarr, term);
  if (ind > -1) valarr[ind][0] += val;
  else {
    valarr.push([val, term]);
    valarr = ExpSurrSortArr(valarr);
  }
}
function ExpSurrHasTerm(valarr, term) {
  for (let i in valarr) if (valarr[i][1].val == term.val) return parseInt(i);
  return -1;
}
function ExpSurrCompareP(va1, va2) {
  if (va1[0].val >= 0 && va2[0].val >= 0) {
    if (va1[1].val > va2[1].val) return 1;
    else if (va2[1].val > va1[1].val) return -1;
    else return 0;
  } else if (va1[0].val >= 0 && va2[0].val < 0) {
    return 1;
  } else if (va2[0].val >= 0 && va1[0].val < 0) {
    return -1;
  } else if (va1[0].val < 0 && va2[0].val < 0) {
    if (va1[1].val > va2[1].val) return -1;
    else if (va2[1].val > va1[1].val) return 1;
    else return 0;
  }
}
function ExpSurrCompare(self, other) {
  if (other.type == 'surreal' && self.type != 'surreal') return ExpUnaryMinus(ExpSurrCompare(other, self));
  if (self.type != 'surreal' && other.type != 'surreal') {
    if (self.val > other.val) return 1;
    else if (self.val == other.val) return 0;
    else if (self.val < other.val) return -1;
    return 0;
  }
  if (other.type == 'surreal') {
    for (let i in self.valarr) {
      cv = ExpSurrCompareP(self.valarr[i], other.valarr[i]);
      if (cv > 0) return 1;
      else if (cv < 0) return -1;
      else if (cv == 0) {
        if (self.valarr[i][0] > other.valarr[i][0]) return 1;
        else if (other.valarr[i][0] > self.valarr[i][0]) return -1;
      }
    }
    return 0;
  } else {
    for (iv in self.valarr) {
      let i = self.valarr[iv].map(x => x.val);
      if (i[1] > 0.0) {
        if (i[0] > 0.0) return 1;
        else return -1;
      } else if (i[1] == 0.0) {
        if (i[0] > other.val) return 1;
        else if (i[0] == other.val) return 0;
        else if (i[0] < other.val) return -1;
      } else if (i[1] < 0.0) {
        if (other.val > 0.0) return -1;
        else if (other.val < 0.0) return 1;
        else if (i[0] > 0.0) return 1;
        else if (i[0] < 0.0) return -1;
        else return 0;
      }
    }
    return 0;
  }
}
function ExpSurrToValArr(val) {
  valarr = [];
  valstr = '';
  valexp = '';
  valmode = 'num';
  valbegin = true;
  for (var i = 0; i < val.length; i++) {
    if (valmode == 'num') {
      if (val[i] == '-' && valbegin) {
        valstr += '-';
        valbegin = false;
      } else if ('0123456789.e'.indexOf(val[i]) > -1) {
        valstr += val[i];
      } else if (val[i] == 'w') {
        if (valstr == '') valstr = '1';
        else if (valstr == '-') valstr = '-1';
        valexp = '';
        valmode = 'numtexp';
      } else if ('+-'.indexOf(val[i]) > -1) {
        valarr.push([new ExpNumber(valstr), new ExpNumber(0)])
        if (val[i] == '-') valstr = '-';
        else valstr = '';
        valmode = 'num';
        valbegin = true;
      }
      if (valbegin) valbegin = false;
    } else if (valmode == 'numtexp') {
      if (val[i] == '^') {
        valmode = 'exp';
        valbegin = true;
      } else if ('+-'.indexOf(val[i]) > -1) {
        valarr.push([new ExpNumber(valstr), new ExpNumber(1.0)])
        if (val[i] == '-') valstr = '-';
        else valstr = '';
        valexp = '';
        valmode = 'num';
        valbegin = true;
      } else {
        valarr.push([new ExpNumber(valstr), new ExpNumber(valexp)]);
        valexp = '';
        valmode = 'num';
        valbegin = true;
      }
    } else if (valmode == 'exp') {
      if (val[i] == '-' && valbegin) valexp = '-';
      else if ('0123456789.e'.indexOf(val[i]) > -1) valexp += val[i];
      else if ('+-'.indexOf(val[i]) > -1) {
        valarr.push([new ExpNumber(valstr), new ExpNumber(valexp)]);
        if (val[i] == '-') valstr = '-';
        else valstr = '';
        valexp = '';
        valmode = 'num';
        valbegin = true;
      }
      if (valbegin) valbegin = false;
    }
  }
  if (valmode == 'numtexp') {
    valarr.push([new ExpNumber(valstr), new ExpNumber(1.0)]);
  } else {
    if (valstr.length > 0) {
      if (valexp.length > 0) valarr.push([new ExpNumber(valstr), new ExpNumber(valexp)]);
      else valarr.push([new ExpNumber(valstr), 0.0]);
    }
  }
  return valarr;
}
function ExpSurrToStr(valarr) {
  let valstr = '';
  for (i in valarr) {
    if (valarr[i][0].val >= 0 && i != 0) valstr += '+';
    if (valarr[i][0].val == -1 && valarr[i][1] != 0) valstr += '-';
    else if (valarr[i][0].val != 1 || valarr[i][1].val == 0) {
      if ((Math.floor(valarr[i][0].val) == valarr[i][0].val) && Math.abs(valarr[i][0].val) < 1e9) valstr += String(valarr[i][0].val);
      else valstr += String(valarr[i][0].val);
    }
    if (valarr[i][1].val != 0.0) {
      if (valarr[i][1].val == 1.0) valstr += 'w';
      else {
        if ((Math.floor(valarr[i][1].val) == valarr[i][1].val) && Math.abs(valarr[i][1].val) < 1e9) valstr += 'w^' + String(valarr[i][1].val);
        else valstr += 'w^' + String(valarr[i][1].val);
      }
    }
  }
  return valstr;
}
function ExpSurrSortArr(valarr) {
  let ra = new Array(valarr);
  return valarr.sort(function (a, b) {
    if (a[1] > b[1]) return -1;
    else if (a[1] < b[1]) return 1;
    else if (a[1] == b[1]) return 0;
  });
}
function ExpSurrSimpArr(valarr) {
  valarr = ExpSurrSortArr(valarr);
  let ra = [];
  for (let i in valarr) if (valarr[i][0].val != 0.0) ExpSurrAddTerm(ra, valarr[i][1], valarr[i][0]);
  if (ra.length == 0) return [[new ExpNumber(0), new ExpNumber(0)]];
  return ra;
}