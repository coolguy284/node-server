function ParseStmtArr(val, globals, locals) {
  let rv;
  for (let i in val) rv = ParseExpArr(val[i], globals, locals);
  return rv;
}