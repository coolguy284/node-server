ExpComplex.prototype = {
  real: function () {
    return this.a;
  },
  imag: function () {
    return this.b;
  },
  __pos__: function () {
    return new ExpComplex(ExpUnaryPlus(this.a), ExpUnaryPlus(this.b));
  },
  __neg__: function () {
    return new ExpComplex(ExpUnaryMinus(this.a), ExpUnaryMinus(this.b));
  },
  __add__: function (that) {
    if (that.type == 'complex') {
      return new ExpComplex(ExpAdd(this.a, that.a), ExpAdd(this.b, that.b));
    } else {
      return new ExpComplex(ExpAdd(this.a, that), ExpUnaryPlus(this.b));
    }
  },
  __radd__: function (that) {
    return new ExpComplex(ExpAdd(that, this.a), ExpUnaryPlus(this.b));
  },
  __sub__: function (that) {
    if (that.type == 'complex') {
      return new ExpComplex(ExpSubtract(this.a, that.a), ExpSubtract(this.b, that.b));
    } else {
      return new ExpComplex(ExpSubtract(this.a, that), ExpUnaryPlus(this.b));
    }
  },
  __rsub__: function (that) {
    return new ExpComplex(ExpSubtract(that, this.a), ExpUnaryMinus(this.b));
  },
  __mul__: function (that) {
    if (that.type == 'complex') {
      return new ExpComplex(
        ExpSubtract(ExpMultiply(this.a, that.a), ExpMultiply(this.b, that.b)),
        ExpAdd(ExpMultiply(this.a, that.b), ExpMultiply(this.b, that.a))
      )
    } else {
      return new ExpComplex(ExpMultiply(this.a, that), ExpMultiply(this.b, that));
    }
  },
  __rmul__: function (that) {
    return new ExpComplex(ExpMultiply(that, this.a), ExpMultiply(that, this.b));
  },
  __div__: function (that) {
    if (that.type == 'complex') {
      return new ExpComplex(
        ExpDivide(
          ExpAdd(ExpMultiply(this.a, that.a), ExpMultiply(this.b, that.b)),
          ExpAdd(ExpExponentiate(that.a, new ExpNumber(2)), ExpExponentiate(that.b, new ExpNumber(2)))
        ),
        ExpDivide(
          ExpSubtract(ExpMultiply(this.a, that.a), ExpMultiply(this.b, that.b)),
          ExpAdd(ExpExponentiate(that.a, new ExpNumber(2)), ExpExponentiate(that.b, new ExpNumber(2)))
        )
      );
    } else {
      return new ExpComplex(ExpDivide(this.a, that), ExpDivide(this.b, that));
    }
  },
  __pow__: function (that) {
    if (that.type == 'complex') return;
    let dist = ((this.a.val ** 2 + this.b.val ** 2) ** 0.5) ** that.val;
    let ang = (Math.atan2(this.b.val, this.a.val) * that.val) % (Math.PI * 2);
    return new ExpComplex(new ExpNumber(Math.cos(ang) * dist), new ExpNumber(Math.sin(ang) * dist));
  },
  conjug: function (that) {
    return new ExpComplex(ExpUnaryPlus(this.a), ExpUnaryMinus(this.b));
  },
};