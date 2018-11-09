// jshint -W041
module.exports = {
  'exec' : function (genf, params) {
    let rv, cba = [], done = false;
    cba.push(genf.apply(null, params));
    while (!done) {
      let grv = cba[cba.length - 1].next(rv);
      if (grv.done) {
        cba.pop();
        rv = grv.value;
        if (cba.length == 0) done = true;
      } else {
        rv = grv.value;
        if (rv[0] == 'return') {
          rv = rv[1];
          cba.pop();
          if (cba.length == 0) done = true;
        } else {
          cba.push(rv[0].apply(null, rv[1]));
          rv = undefined;
        }
      }
    }
    return rv;
  },
  'func1' : function (lim, arr) {
    if (!arr) arr = [];
    if (lim > 0) {arr.push('e'); module.exports.func1(lim - 1, arr)}
    return arr;
  },
  'func1a' : function* (lim, arr) {
    if (!arr) arr = [];
    if (lim > 0) {arr.push('e'); yield [module.exports.func1a, [lim - 1, arr]]}
    yield ['return', arr];
  },
};