module.exports = {
  'filt' : function (arr, opts) {
    if (opts === undefined) {
      opts = {};
    }
    if (opts.regexp) {
      if (Object.prototype.toString.call(opts.regexp) == '[object RegExp]') {
        opts.regexp = [opts.regexp, 'url'];
      }
    }
    let ra = [];
    for (let i in arr) {
      let tv = true;
      if (opts.func) {
        if (opts.func(arr[i])) {
          tv = tv || arr[i];
        }
      }
      if (opts.regexp) {
        if (opts.regexp[1].substr(0, 6) == 'socket') {
          tv = tv && opts.regexp[0].test(arr[i].socket[opts.regexp[1].substr(7, Infinity)]);
        } else if (opts.regexp[1].substr(0, 10) == 'connection') {
          tv = tv && opts.regexp[0].test(arr[i].socket[opts.regexp[1].substr(11, Infinity)]);
        } else {
          tv = tv && opts.regexp[0].test(arr[i][opts.regexp[1]]);
        }
      }
      if (opts.ajax == 1) {
        if (datajs.feat.el.ajaxl.indexOf(arr[i].url) > -1) {
          tv = tv && true;
        } else {
          tv = tv && false;
        }
      } else if (opts.ajax == 2) {
        if (datajs.feat.el.ajaxl.indexOf(arr[i].url) > -1) {
          tv = tv && false;
        } else {
          tv = tv && true;
        }
      }
      if (opts.ss == 1) {
        if (datajs.feat.el.vl.every(datajs.notstartswith, arr[i].url)) {
          tv = tv && false;
        } else {
          tv = tv && true;
        }
      } else if (opts.ss == 2) {
        if (datajs.feat.el.vl.every(datajs.notstartswith, arr[i].url)) {
          tv = tv && true;
        } else {
          tv = tv && false;
        }
      }
      if (tv) {
        ra.push(arr[i]);
      }
    }
    return ra;
  },
  'prnt' : function (arr, opts, cons) {
    if (cons === undefined) {
      cons = console.log;
    }
    if (opts === undefined || opts === null) {
      opts = {};
    }
    if (opts.modts === undefined) {
      opts.modts = true;
    }
    for (let i in arr) {
      if (opts.modts) {
        cons('[' + new Date(arr[i].timestamp).toISOString() + '] ' + arr[i].url);
      } else {
        cons('[' + arr[i].timestamp + '] ' + arr[i].url);
      }
    }
  }
};