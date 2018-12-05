function FuncCall(nam, val) {
  nam = nam[0].val;
  if (nam == 'mat') {
    return new ExpMatrix(val);
  } else {
    return new ExpFuncCall(nam, val);
  }
}
function FuncCallProp(nam, val) {
  if (varns[nam]) {
    if (varns[nam].type = 'func') {
      return varns[nam].val(val);
    } else {
      throw new Error('variable ' + inspect(nam) + ' not function');
    }
  } else {
    throw new Error('nonexistent function');
  }
}