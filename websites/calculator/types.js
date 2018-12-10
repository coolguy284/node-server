function ExpUndefined() {
  this.type = 'undefined';
  this.val = undefined;
}
function ExpNull() {
  this.type = 'null';
  this.val = null;
}
function ExpBool(val) {
  this.type = 'bool';
  this.val = Boolean(val);
}
function ExpNumber(val) {
  this.type = 'num';
  this.val = Number(val);
}
function ExpBigInt(val) {
  this.type = 'bigint';
  this.val = BigInt(val);
}
function ExpString(val) {
  this.type = 'string';
  this.val = String(val);
}
function ExpVariable(val) {
  this.type = 'variable';
  this.val = val;
}
function ExpMatrix(val) {
  this.type = 'mat';
  let ylen = val.val.length;
  let xlen = val.val[0].val.length;
  this.val = [];
  for (let y = 0; y < ylen; y++) {
    let ta = [];
    for (let x = 0; x < xlen; x++) ta.push(val.val[y].val[x]);
    this.val.push(ta);
  }
}
function ExpArray(val) {
  this.type = 'array';
  this.val = val;
}
function ExpObject(val) {
  this.type = 'object';
  this.val = val;
}
function ExpOperator(val) {
  this.type = 'op';
  this.val = val;
}
function ExpFuncCall(nam, val) {
  this.type = 'funccall';
  this.nam = nam;
  this.val = val;
}
function ExpFunc(val) {
  this.type = 'func';
  this.val = val;
}
function ExpJSObj(val) {
  this.type = 'jsobj';
  this.val = val;
}