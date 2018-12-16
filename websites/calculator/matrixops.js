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
  det: function () {
    if (this.w != this.h) throw new Error('cannot calculate the determinant of a non square matrix');
    if (this.w == 1) return this.val[0][0];
    if (this.w == 2) return ExpSubtract(ExpMultiply(this.val[0][0], this.val[1][1]), ExpMultiply(this.val[0][1], this.val[1][0]));
  },
};