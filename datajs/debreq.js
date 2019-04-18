module.exports = {
  /* filters the debreq with opts
    opts [Number]: gets request with number as id
    opts [Object]: {
      func [Function]: passes object into function to test
      regexp [RegExp]: regular expression matching url
      regexp [RegExp, String]: regular expression matching property of object
      ajax [Number]:
        0 - nothing
        1 - only ajax
        2 - only not ajax
      ss [Number]:
        0 - nothing
        1 - only variable urls
        2 - only not variable urls
    }
   */
  filt: function (arr, opts) {
    if (typeof opts == 'number') {
      for (let i in arr) {
        if (arr[i].rrid == opts) return parseInt(i);
      }
    }
    if (!opts) opts = {};
    if (opts.regexp && opts.regexp.constructor.name == 'RegExp') {
      opts.regexp = [opts.regexp, 'url'];
    }
    let ra = [];
    for (let i in arr) {
      if (opts.func && !opts.func(arr[i])) continue;
      if (opts.regexp) {
        if (opts.regexp[1].substr(0, 6) == 'socket') {
          if (!opts.regexp[0].test(arr[i].socket[opts.regexp[1].substr(7, Infinity)])) continue;
        } else if (opts.regexp[1].substr(0, 10) == 'connection') {
          if (!opts.regexp[0].test(arr[i].socket[opts.regexp[1].substr(11, Infinity)])) continue;
        } else {
          if (!opts.regexp[0].test(arr[i][opts.regexp[1]])) continue;
        }
      }
      if (opts.ajax == 1) {
        if (!datajs.feat.el.ajaxl.indexOf(arr[i].url) > -1) continue;
      } else if (opts.ajax == 2) {
        if (datajs.feat.el.ajaxl.indexOf(arr[i].url) > -1) continue;
      }
      if (opts.ss == 1) {
        if (datajs.feat.el.vl.every(datajs.notstartswith, arr[i].url)) continue;
      } else if (opts.ss == 2) {
        if (!datajs.feat.el.vl.every(datajs.notstartswith, arr[i].url)) continue;
      }
      ra.push(arr[i]);
    }
    return ra;
  },
  prnt: function (arr, opts, cons) {
    if (cons === undefined) cons = console.log;
    if (!opts) opts = {};
    if (opts.modts === undefined) opts.modts = true;
    for (let i in arr) {
      if (opts.modts) {
        cons('[' + new Date(arr[i].timestamp).toISOString() + '] ' + (''+arr[i].rrid).padStart(5, '0') + ' ' + arr[i].url);
      } else {
        cons('[' + arr[i].timestamp + '] ' + (''+arr[i].rrid).padStart(5, '0') + ' ' + arr[i].url);
      }
    }
  }
};