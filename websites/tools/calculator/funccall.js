function FuncCall(nam, val) {
  nam = nam[0].val;
  if (nam == 'mat') return new ExpMatrix(val);
  else return new ExpFuncCall(val);
}
function FuncCallProp(func, val, globals, locals) {
  if (func.type != 'func') throw new Error('variable not a function');
  return func.val(val, globals, locals);
}