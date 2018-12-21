try { util } catch (e) { util = {}; }
utila = (function () {
  let format = function() {
    let args = Array.from(arguments);
    if (args.length == 0) return '';
    else if (typeof args[0] != 'string') return args.map((x) => inspect(x)).join(' ');
    else if (args.length == 1) return args[0];
    let perc = false, str = args[0], argind = 1, bs = '';
    while (str.length > 0) {
      let si = str.search('%');
      if (si < 0 || !str[si + 1]) {bs += str; break;}
      bs += str.substr(0, si);
      let i = si + 1;
      if (argind < args.length) {
        if (str[i] == 's') {
          bs += String(args[argind]);
          argind++;
        } else if (str[i] == 'd') {
          if (typeof args[argind] == 'bigint') bs += args[argind].toString() + 'n';
          else bs += Number(args[argind]).toString();
          argind++;
        } else if (str[i] == 'i') {
          if (typeof args[argind] == 'bigint') bs += args[argind].toString() + 'n';
          else bs += Math.trunc(Number(args[argind])).toString();
          argind++;
        } else if (str[i] == 'f') {
          bs += Number(args[argind]).toString();
          argind++;
        } else if (str[i] == 'j') {
          try {bs += JSON.stringify(args[argind]);} catch (e) {bs += '[' + e.toString() + ']';}
          argind++;
        } else if (str[i] == 'o') {
          bs += inspect(args[argind], {showHidden: true});
          argind++;
        } else if (str[i] == 'O') {
          bs += inspect(args[argind]);
          argind++;
        } else {
          bs += str[i] == '%' ? '%' : '%' + str[i];
        }
      } else {
        bs += str[i] == '%' ? '%' : '%' + str[i];
      }
      str = str.substr(i + 1, Infinity);
    }
    if (argind < args.length) {
      bs += ' ' + args.slice(argind, Infinity).map((x) => {if (typeof x == 'string') return x; return inspect(x)}).join(' ');
    }
    return bs;
  }
  return {format};
})();
Object.assign(util, utila);
format = util.format;