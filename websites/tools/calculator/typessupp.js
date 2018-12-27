var CL_UNDEFINED = new ExpUndefined();
var CL_NULL = new ExpNull();
var CL_TRUE = new ExpBool(true);
var CL_FALSE = new ExpBool(false);
var CL_INFINITY = new ExpNumber(Infinity);
var CL_NINFINITY = new ExpNumber(-Infinity);
var CL_NAN = new ExpNumber(NaN);
var CL_NZERO = new ExpNumber(-0);
var CL_NUMS = [];
for (var i = -5; i < 257; i++) CL_NUMS.push(new ExpNumber(i));
var CL_BIGINTS = [];
try { for (var i = -5; i < 257; i++) CL_BIGINTS.push(new ExpBigInt(i)); } catch(e) {}
var CL_OPS = {};
for (var i in OPSL) CL_OPS[OPSL[i]] = new ExpOperator(OPSL[i]);
function GetUndefined() {
  return CL_UNDEFINED;
}
function GetNull() {
  return CL_NULL;
}
function GetBool(val) {
  if (val) return CL_TRUE;
  else return CL_FALSE;
}
function GetNumber(val) {
  var v = Number(val);
  if (v == Infinity) return CL_INFINITY;
  if (v == -Infinity) return CL_NINFINITY;
  if (Object.is(v, NaN)) return CL_NAN;
  if (Object.is(v, -0)) return CL_NZERO;
  if (Number.isInteger(v) && v > -6 && v < 257) return CL_NUMS[v + 5];
  return new ExpNumber(v);
}
function GetBigInt(val) {
  if (CL_BIGINTS.length == 0) throw new Error('bigints unsupported by browser');
  var v = BigInt(val);
  if (v > -6 && v < 257) return CL_NUMS[v + 5];
  return new ExpBigInt(v);
}
function GetString(val) {
  var v = String(val);
  return new ExpString(v);
}
function GetComplex(a, b) {
  return new ExpComplex(a, b);
}
function GetMatrix(val, val2) {
  return new ExpMatrix(val, val2);
}
function GetSurreal(val) {
  return new ExpSurreal(val);
}
function GetOperator(val) {
  if (val in CL_OPS) return CL_OPS[val];
  return new ExpOperator(val);
}