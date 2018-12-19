ExpMatrix.prototype = {
  __pos__: function () {
    let rm = new ExpMatrix(this.h, this.w);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.h; x++) {
        rm.val[y][x] = ExpUnaryPlus(this.val[y][x]);
      }
    }
    return rm;
  },
  __neg__: function () {
    let rm = new ExpMatrix(this.h, this.w);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.h; x++) {
        rm.val[y][x] = ExpUnaryMinus(this.val[y][x]);
      }
    }
    return rm;
  },
  __add__: function (that) {
    if (that.type != 'matrix') return;
    if (this.w != that.w || this.h != that.h) throw new Error('mismatching matrix sizes');
    let rm = new ExpMatrix(this.h, this.w);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.h; x++) {
        rm.val[y][x] = ExpAdd(this.val[y][x], that.val[y][x]);
      }
    }
    return rm;
  },
  __sub__: function (that) {
    if (that.type != 'matrix') return;
    if (this.w != that.w || this.h != that.h) throw new Error('mismatching matrix sizes');
    let rm = new ExpMatrix(this.h, this.w);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.h; x++) {
        rm.val[y][x] = ExpSubtract(this.val[y][x], that.val[y][x]);
      }
    }
    return rm;
  },
  __mul__: function (that) {
    if (that.type == 'number') {
      let rm = new ExpMatrix(this.h, this.w);
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.h; x++)
          rm.val[y][x] = ExpMultiply(this.val[y][x], that);
      return rm;
    } else if (that.type == 'matrix') {
      let rm = new ExpMatrix(that.w, this.h);
      for (let y = 0; y < rm.h; y++) {
        for (let x = 0; x < rm.w; x++) {
          let s = new ExpNumber(0);
          for (let i = 0; i < this.w; i++) s = ExpAdd(s, ExpMultiply(this.get(y, i), that.get(i, x)));
          rm.set(y, x, s);
        }
      }
      return rm;
    }
  },
  __rmul__: function (that) {
    if (that.type == 'number') {
      let rm = new ExpMatrix(this.h, this.w);
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.h; x++)
          rm.val[y][x] = ExpMultiply(that, this.val[y][x]);
      return rm;
    }
  },
  get: function (y, x) {
    return this.val[y][x];
  },
  set: function (y, x, val) {
    this.val[y][x] = val;
  },
  getrow: function(y) {
    let ar = [];
    for (var x = 0; x < this.w; x++) ar.push(this.get(y, x));
  },
  getcol: function(x) {
    let ar = [];
    for (var y = 0; y < this.h; y++) ar.push(this.get(y, x));
  },
  submat: function(y, x) {
    let rm = new ExpMatrix(this.h - 1, this.w - 1);
    let jval = 0;
    for (let j = 0; j < this.h; j++) {
      if (j != y) {
        let ival = 0;
        for (let i = 0; i < this.w; i++) {
          if (i != x) {
            rm.set(jval, ival, this.get(j, i));
            ival += 1;
          }
        }
        jval += 1;
      }
    }
    return rm;
  },
  transp: function () {
    let rm = new ExpMatrix(this.w, this.h);
    for (let j = 0; j < this.h; j++)
      for (let i = 0; i < this.w; i++)
        rm.set(i, j, this.get(j, i));
    return rm;
  },
  det: function () {
    if (this.w != this.h) throw new Error('cannot calculate the determinant of a non square matrix');
    if (this.w == 1) return this.val[0][0];
    else if (this.w == 2) return ExpSubtract(ExpMultiply(this.val[0][0], this.val[1][1]), ExpMultiply(this.val[0][1], this.val[1][0]));
    else {
      let ds = new ExpNumber(0);
      for (let i = 0; i < this.w; i++) {
        ds = ExpAdd(ds, ExpMultiply(new ExpNumber((-1) ** i), ExpMultiply(this.get(0, i), this.submat(0, i).det())));
      }
      return ds;
    }
  },
  adj: function () {
    if (this.w != this.h) throw new Error('cannot calculate the adjuglate of a non-square matrix');
    if (this.w == 1) return Matrix([[new ExpNumber(1)]]);
    else if (this.w == 2) {
      return new ExpMatrix([
        [this.get(1, 1), ExpUnaryMinus(this.get(0, 1))],
        [ExpUnaryMinus(this.get(1, 0)), this.get(0, 0)]
      ]);
    } else if (this.w == 3) {
      let rm = this.transp();
      let rm2 = new ExpMatrix(this.w, this.h);
      for (let j = 0; j < rm.h; j++) {
        for (let i = 0; i < rm.w; i++) {
          rm2.set(j, i, ExpMultiply(new ExpNumber((-1) ** (j + i)), rm.submat(j, i).det()));
        }
      }
      return rm2;
    }
  },
  inv: function () {
    if (this.w != this.h) throw new Error('cannot calculate the inverse of a non-square matrix');
    return ExpMultiply(ExpDivide(new ExpNumber(1), this.det()), this.adj());
  }
};