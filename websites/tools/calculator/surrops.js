ExpSurreal.prototype = {
  __pos__: function() {
    let rs = GetSurreal(this.valarr.map(x => x.map(y => ExpUnaryPlus(y))));
    for (let i in rs.valarr) {
      rs.valarr[i][0] = ExpUnaryPlus(rs.valarr[i][0]);
      rs.valarr[i][1] = ExpUnaryPlus(rs.valarr[i][1]);
    }
    return rs;
  },
  __neg__: function() {
    let rs = GetSurreal(this.valarr.map(x => x.map(y => ExpUnaryPlus(y))));
    for (let i in rs.valarr) {
      rs.valarr[i][0] = ExpUnaryMinus(rs.valarr[i][0]);
      rs.valarr[i][1] = ExpUnaryPlus(rs.valarr[i][1]);
    }
    return rs;
  },
  __add__: function(that) {
    if (that.type != 'surreal') {
      let rs = ExpUnaryPlus(this);
      ExpSurrAddTerm(rs.valarr, GetNumber(0), that);
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    } else {
      let rs = ExpUnaryPlus(this);
      for (let iv in that.valarr) {
        let i = that.valarr[iv];
        ExpSurrAddTerm(rs.valarr, i[1], i[0]);
      }
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    }
  },
  __radd__: function (that) {
    let rs = ExpUnaryPlus(this);
    ExpSurrAddTerm(rs.valarr, GetNumber(0), that);
    rs.valarr = ExpSurrSimpArr(rs.valarr);
    return rs;
  },
  __sub__: function (that) {
    if (that.type != 'surreal') {
      let rs = ExpUnaryPlus(this);
      ExpSurrAddTerm(rs.valarr, GetNumber(0), ExpUnaryMinus(that));
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    } else {
      let rs = ExpUnaryPlus(this);
      for (let iv in that.valarr) {
        let i = that.valarr[iv];
        ExpSurrAddTerm(rs.valarr, i[1], ExpUnaryMinus(i[0]));
      }
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    }
  },
  __rsub__: function (that) {
    let rs = ExpUnaryMinus(this);
    ExpSurrAddTerm(rs.valarr, GetNumber(0), that);
    rs.valarr = ExpSurrSimpArr(rs.valarr);
    return rs;
  },
  __mul__: function (that) {
    if (that.type != 'surreal') {
      let rs = GetSurreal([[GetNumber(0), GetNumber(0)]]);
      for (let iv in this.valarr) {
        let i = this.valarr[iv];
        ExpSurrAddTerm(rs.valarr, i[1], ExpMultiply(i[0], that));
      }
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    } else {
      let rs = GetSurreal([[GetNumber(0), GetNumber(0)]]);
      for (let iv in that.valarr) {
        let i = that.valarr[iv];
        for (let jv in this.valarr) {
          let j = this.valarr[jv];
          ExpSurrAddTerm(rs.valarr, ExpAdd(j[1], i[1]), ExpMultiply(j[0], i[0]));
        }
      }
      rs.valarr = ExpSurrSimpArr(rs.valarr);
      return rs;
    }
  },
  __rmul__: function (that) {
    let rs = GetSurreal([[GetNumber(0), GetNumber(0)]]);
    for (let iv in this.valarr) {
      let i = this.valarr[iv];
      ExpSurrAddTerm(rs.valarr, i[1], ExpMultiply(that, i[0]));
    }
    rs.valarr = ExpSurrSimpArr(rs.valarr);
    return rs;
  },
  __div__: function (that) {
    return this.__mul__(ExpDivide(GetNumber(1), that));
  },
  __rdiv__: function (that) {
    return this.recip().__mul__(that);
  },
  __pow__: function (that) {
    if (self.valarr.length == 1) {
      return GetSurreal([[ExpExponentiate(this.valarr[0][0], that), ExpMultiply(this.valarr[0][1], that)]]);
    }
  },
  __gt__: function (that) {
    return GetBool(ExpSurrCompare(this, that) > 0);
  },
  __lt__: function (that) {
    return GetBool(ExpSurrCompare(this, that) < 0);
  },
  __ge__: function (that) {
    return GetBool(ExpSurrCompare(this, that) >= 0);
  },
  __le__: function (that) {
    return GetBool(ExpSurrCompare(this, that) <= 0);
  },
  __eq__: function (that) {
    return GetBool(ExpSurrCompare(this, that) == 0);
  },
  __ne__: function (that) {
    return GetBool(ExpSurrCompare(this, that) != 0);
  },
  recip: function () {
    return GetSurreal([[ExpDivide(GetNumber(1), this.valarr[0][0]), ExpUnaryMinus(this.valarr[0][1])]]);
  },
  to_float: function() {
    for (let iv in this.valarr) {
      let i = this.valarr[iv];
      if (ExpGreaterThan(i[1], GetNumber(0)).val) {
        if (ExpGreaterThan(i[0], GetNumber(0)).val) {
          return GetNumber(Infinity);
        } else {
          return GetNumber(-Infinity);
        }
      } else if (ExpEqual(i[1], GetNumber(0)).val) {
        return ExpUnaryPlus(i[0]);
      } else if (ExpLessThan(i[1], GetNumber(0)).val) {
        if (ExpGreaterThanEqual(i[0], GetNumber(0)).val) {
          return GetNumber(0);
        } else {
          return GetNumber(-0);
        }
      }
    }
  }
};
function ExpSurrAddTerm(valarr, term, val) {
  let ind = ExpSurrHasTerm(valarr, term);
  if (ind > -1) valarr[ind][0] = ExpAdd(valarr[ind][0], val);
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
      if (i[1] > 0) {
        if (i[0] > 0) return 1;
        else return -1;
      } else if (i[1] == 0) {
        if (i[0] > other.val) return 1;
        else if (i[0] == other.val) return 0;
        else if (i[0] < other.val) return -1;
      } else if (i[1] < 0) {
        if (other.val > 0) return -1;
        else if (other.val < 0) return 1;
        else if (i[0] > 0) return 1;
        else if (i[0] < 0) return -1;
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
        valarr.push([GetNumber(valstr), GetNumber(0)]);
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
        valarr.push([GetNumber(valstr), GetNumber(1)])
        if (val[i] == '-') valstr = '-';
        else valstr = '';
        valexp = '';
        valmode = 'num';
        valbegin = true;
      } else {
        valarr.push([GetNumber(valstr), GetNumber(valexp)]);
        valexp = '';
        valmode = 'num';
        valbegin = true;
      }
    } else if (valmode == 'exp') {
      if (val[i] == '-' && valbegin) valexp = '-';
      else if ('0123456789.e'.indexOf(val[i]) > -1) valexp += val[i];
      else if ('+-'.indexOf(val[i]) > -1) {
        valarr.push([GetNumber(valstr), GetNumber(valexp)]);
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
    valarr.push([GetNumber(valstr), GetNumber(1.0)]);
  } else {
    if (valstr.length > 0) {
      if (valexp.length > 0) valarr.push([GetNumber(valstr), GetNumber(valexp)]);
      else valarr.push([GetNumber(valstr), GetNumber(0)]);
    }
  }
  return valarr;
}
function ExpSurrToStr(valarr) {
  let valstr = '';
  for (i in valarr) {
    if (valarr[i][0].val >= 0 && i != 0) valstr += '+';
    if (valarr[i][0].val == -1 && valarr[i][1].val != 0) valstr += '-';
    else if (valarr[i][0].val != 1 || valarr[i][1].val == 0) {
      valstr += valarr[i][0].val;
    }
    if (valarr[i][1].val != 0) {
      if (valarr[i][1].val == 1) valstr += 'w';
      else {
        valstr += 'w^' + valarr[i][1].val;
      }
    }
  }
  return valstr;
}
function ExpSurrSortArr(valarr) {
  let ra = new Array(valarr);
  return valarr.sort(function (a, b) {
    if (a[1].val > b[1].val) return -1;
    else if (a[1].val < b[1].val) return 1;
    else if (a[1].val == b[1].val) return 0;
  });
}
function ExpSurrSimpArr(valarr) {
  valarr = ExpSurrSortArr(valarr);
  let ra = [];
  for (let i in valarr) if (valarr[i][0].val != 0.0) ExpSurrAddTerm(ra, valarr[i][1], valarr[i][0]);
  if (ra.length == 0) return [[GetNumber(0), GetNumber(0)]];
  return ra;
}