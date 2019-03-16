// jshint -W041
module.exports = {
  func: function () {
    savedvars.timeout += 1;
    savedvars.maxtimeout = Math.max(savedvars.timeout, savedvars.maxtimeout);
    savedvars.uptime = (new Date().getTime()) - sst;
    savedvars.maxuptime = Math.max(savedvars.uptime, savedvars.maxuptime);
    let remt = new Date().getTime();
    global.chatherelist = chatherelist.filter(function (val) {return val[0] > remt - 5000});
    global.chattyplist = chattyplist.filter(function (val) {return val[0] > remt - 2000});
    global.owneyesid = owneyesid.filter(function (val) {return val[0] > remt - 5000});
    global.loginid = loginid.filter(function (val) {return val[0] > remt - 864000000});
    if (Math.random() < 0.0001 && chatherelist.length == 5) {
      adm.addchat(null, '[server ghost]', datajs.splash[Math.floor(Math.random() * datajs.splash.length)]);
    }
    if (datajs.feat.datadir != '' && global.ticks % datajs.feat.savefreq == 0) {
      datajs.tick.savev();
    }
    global.pcpuUsage = cpuUsage;
    global.cpuUsage = process.cpuUsage();
    global.dcpuUsage = { user: cpuUsage.user - pcpuUsage.user, system: cpuUsage.system - pcpuUsage.system };
    global.memUsage = process.memoryUsage();
    global.ticks++;
    for (let i in datajs.tick.funcl) {
      datajs.tick.funcl[i](remt);
    }
  },
  on: function () {
    datajs.tick.int = setInterval(datajs.tick.func, datajs.feat.tickint);
  },
  off: function () {
    clearInterval(datajs.tick.int);
  },
  savev: function () {
    fs.writeFile(datajs.feat.datadir + '/chat.json', JSON.stringify(chat), function (err) {});
    fs.writeFile(datajs.feat.datadir + '/rchat.json', JSON.stringify(rchat), function (err) {});
    fs.writeFile(datajs.feat.datadir + '/mchat.json', JSON.stringify(mchat), function (err) {});
    fs.writeFile(datajs.feat.datadir + '/views.json', JSON.stringify(viewshist), function (err) {});
    if (datajs.feat.enc == 'b64') {
      fs.writeFile(datajs.feat.datadir + '/colog.dat', b64a.encode(JSON.stringify(colog)), function (err) {});
      fs.writeFile(datajs.feat.datadir + '/cologd.dat', b64a.encode(JSON.stringify(cologd)), function (err) {});
    } else if (datajs.feat.enc == 'aes') {
      fs.writeFile(datajs.feat.datadir + '/colog.dat', CryptoJS.AES.encrypt(JSON.stringify(colog), b64a.server), function (err) {});
      fs.writeFile(datajs.feat.datadir + '/cologd.dat', CryptoJS.AES.encrypt(JSON.stringify(cologd), b64a.server), function (err) {});
    }
    fs.writeFile(datajs.feat.datadir + '/savedvars.json', JSON.stringify(savedvars), function (err) {});
    fs.writeFile(datajs.feat.datadir + '/saveddat.json', JSON.stringify(saveddat), function (err) {});
  },
  funcl: [],
};