let numstatlinux = ['Tgid', 'Ngid', 'Pid', 'PPid', 'TracerPid', 'FDSize', 'NStgid', 'NSpid', 'NSpgid', 'NSsid', 'Threads', 'NoNewPrivs', 'Seccomp', 'voluntary_ctxt_switches', 'nonvoluntary_ctxt_switches'];
function pidlist() {
  if (process.platform == 'linux') {
    return fs.readdirSync('/proc').map(x => parseInt(x)).filter(x => x + '' != 'NaN');
  }
}
function getstat(pid, filt) {
  if (process.platform == 'linux') {
    let statobj = {};
    fs.readFileSync('/proc/' + pid + '/status').toString().split('\n').slice(0, -1).forEach(v => {
      let s = v.split('\t');
      let nam = s[0].slice(0, -1);
      if (filt) {
        if (filt.indexOf(nam) > -1) {
          statobj[nam] = s.length > 2 ? s.slice(1, Infinity) : (numstatlinux.indexOf(nam) > -1 ? parseInt(s[1]) : s[1]);
        }
      } else {
        statobj[nam] = s.length > 2 ? s.slice(1, Infinity) : (numstatlinux.indexOf(nam) > -1 ? parseInt(s[1]) : s[1]);
      }
    });
    return statobj;
  }
}
function getchilds(pid, pidl) {
  if (typeof pid == 'string') pid = parseInt(pid);
  if (pidl === undefined) {
    let pidli = pidlist();
    pidl = {};
    pidli.forEach(x => {
      pidl[x] = getstat(x, ['PPid']).PPid;
    });
  }
  let chl = [];
  for (var i in pidl) {
    let j = pidl[i];
    if (j == pid) {
      chl.push(parseInt(i));
    }
  }
  return chl;
}
function getallchilds(pid) {
  let pidli = pidlist();
  pidl = {};
  pidli.forEach(x => {
    pidl[x] = getstat(x, ['PPid']).PPid;
  });
  let chl = [], achl = [pid];
  while (achl.length > 0) {
    let tachl = [];
    for (var i in achl) {
      getchilds(achl[i], pidl).forEach(v => {
        chl.push(v);
        tachl.push(v);
      });
    }
    achl = tachl;
  }
  return chl;
}
module.exports = { numstatlinux, pidlist, getstat, getchilds, getallchilds };