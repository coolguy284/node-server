function FuncCall(nam, val) {
  nam = nam[0].val;
  if (nam == 'mat') return new ExpMatrix(val);
  else return new ExpFuncCall(val);
}
function FuncCallProp(func, val, globals, locals) {
  if (func.type != 'func') throw new Error('variable not a function');
  if (func.ftype == 'js') return func.val(val, globals, locals);
  else if (func.ftype == 'comp') return ParseStmtArr(func.val)[0][0];
}