// jshint -W041
module.exports = {
  getpath: function (path, addl) {
    if (addl[0] == '/') return addl;
    path = path.split('/').slice(0, -1).concat(addl.split('/'));
    let bp = [];
    for (var i in path) {
      if (path[i] == '..') bp.splice(bp.length - 1, 1);
      else bp.push(path[i]);
    }
    return bp.join('/');
  },
  crawl: function (path, arr, paths, pri) {
    if (pri === undefined) pri = 1;
    if (pri < 0) throw new Error('KRASH ' + util.inspect([path, arr, paths, pri]));
    if (arr === undefined) arr = [[path, fs.statSync('websites' + path).mtime.toISOString().split('T')[0], pri]];
    if (paths === undefined) paths = [path];
    let hrefs = fs.readFileSync('websites' + path).toString().match(/(?<=<a.*href\s*=\s*(?:'|")).*?(?=(?:'|")>)/g);
    let narr = [];
    if (hrefs != null) {
      for (var i in hrefs) {
        try {
          if (/^(?:http:|https:|)\/\//.test(hrefs[i])) continue;
          let patht = module.exports.getpath(path, hrefs[i]);
          if (paths.indexOf(patht) > -1) continue;
          paths.push(patht);
          arr.push([patht, fs.statSync('websites' + patht).mtime.toISOString().split('T')[0], pri - 0.1]);
          narr.push(patht);
        } catch (e) {}
      }
    }
    for (var i in narr) {
      module.exports.crawl(narr[i], arr, paths, pri - 0.1);
    }
    return arr;
  }
};