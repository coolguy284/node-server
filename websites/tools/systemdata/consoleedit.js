var olog = console.log;
var oinfo = console.info;
var odebug = console.debug;
var owarn = console.warn;
var oerror = console.error;
var oclear = console.clear;
function cologadd(value, temp, colog) {
  if (value.search('\n') > -1) {
    let sl = value.split('\n');
    for (let i in sl) {
      cologadd(sl[i], temp, colog);
    }
    return;
  }
  cologaddn([value, temp || '{}']);
}
console.log = function log(value) {
  if (typeof value != 'string') {
    value = inspect(value);
  }
  if (arguments.length > 1) {
    console.log(format.apply(null, arguments));
    return;
  }
  cologadd(value);
  olog(value);
};
console.info = function info(value) {
  if (typeof value != 'string') {
    value = inspect(value);
  }
  if (arguments.length > 1) {
    console.info(format.apply(null, arguments));
    return;
  }
  cologadd(value);
  olog(value);
};
console.debug = function debug(value) {
  if (typeof value != 'string') {
    value = inspect(value);
  }
  if (arguments.length > 1) {
    console.debug(format.apply(null, arguments));
    return;
  }
  cologadd(value, '<span style = "color:#7f7f7f;">{}</span>');
  olog(value);
};
console.warn = function warn(value) {
  if (typeof value != 'string') {
    value = inspect(value);
  }
  if (arguments.length > 1) {
    console.warn(format.apply(null, arguments));
    return;
  }
  cologadd(value, '<span style = "color:#3f3f00;background-color:#ffffcf;min-width:100%;float:left;">{}</span>');
  olog(value);
};
console.error = function error(value) {
  if (typeof value != 'string') {
    value = inspect(value);
  }
  if (arguments.length > 1) {
    console.error(format.apply(null, arguments));
    return;
  }
  cologadd(value, '<span style = "color:#3f0000;background-color:#ffcfcf;min-width:100%;float:left;">{}</span>');
  olog(value);
};
console.clear = function clear() {
  cologaddn('clear');
  oclear();
};