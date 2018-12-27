function FuncCall(nam, val) {
  /*nam = nam[0].val;
  if (nam == 'mat') return GetMatrix(val);
  else*/
  return new ExpFuncCall(val);
}
function FuncCallProp(func, val, globals, locals) {
  if (func.type != 'func') throw new Error('variable not a function');
  if (func.ftype == 'js') return func.val(val, globals, locals);
  else if (func.ftype == 'comp') {
    var ld = {args: val};
    for (let i in func.args) {
      if (i < val.length) ld[func.args[i]] = val[i];
      else ld[func.args[i]] == GetUndefined();
    }
    return ParseStmtArr(func.val, globals, ld)[0][0];
  }
}