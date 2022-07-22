// jshint -W041
module.exports = exports = {
  func: function () {
    savedvars.timeout += 1;
    savedvars.maxtimeout = Math.max(savedvars.timeout, savedvars.maxtimeout);
    savedvars.uptime = (new Date().getTime()) - sstdate.getTime();
    savedvars.maxuptime = Math.max(savedvars.uptime, savedvars.maxuptime);
    global.savedvarsVers++;
    let remt = new Date().getTime();
    if (!datajs.feat.es) {
      global.chatherelist = chatherelist.filter(val => val[0] > remt - 60000);
      global.chattyplist = chattyplist.filter(val => val[0] > remt - 60000);
    }
    global.owneyesid = owneyesid.filter(val => val[0] > remt - 60000);
    global.loginid = loginid.filter(val => val[0] > remt - 864000000);
    if (datajs.feat.chatghost && Math.random() < 0.006 && chatherelist.length == 5)
      adm.addchat(null, '[server ghost]', datajs.splash[Math.floor(Math.random() * datajs.splash.length)]);
    if (datajs.feat.datadir != '' && global.ticks % datajs.feat.saveperiod == 0)
      savev();
    global.pcpuUsage = cpuUsage;
    global.cpuUsage = process.cpuUsage();
    global.dcpuUsage = { user: cpuUsage.user - pcpuUsage.user, system: cpuUsage.system - pcpuUsage.system };
    global.memUsage = process.memoryUsage();
    global.ticks++;
    for (let i in datajs.tick.funcl)
      datajs.tick.funcl[i](remt);
  },
  on: function () {
    datajs.tick.int = setInterval(datajs.tick.func, datajs.feat.tickint);
  },
  off: function () {
    clearInterval(datajs.tick.int);
  },
  saveSingle: async function (varName, fileName, saveFunc, force) {
    if (force || global[varName + 'Vers'] > global[varName + 'VersSaved']) {
      let stringify = JSON.stringify(global[varName]);
      if (saveFunc) stringify = saveFunc(stringify);
      await fs.promises.writeFile(datajs.feat.datadir + '/' + fileName, stringify);
      global[varName + 'VersSaved'] = global[varName + 'Vers'];
    }
  },
  saveSingleSync: function (varName, fileName, saveFunc, force) {
    if (force || global[varName + 'Vers'] > global[varName + 'VersSaved']) {
      let stringify = JSON.stringify(global[varName]);
      if (saveFunc) stringify = saveFunc(stringify);
      fs.writeFileSync(datajs.feat.datadir + '/' + fileName, stringify);
      global[varName + 'VersSaved'] = global[varName + 'Vers'];
    }
  },
  savev: async function (force) {
    await exports.saveSingle('chat', 'chat.json', null, force);
    await exports.saveSingle('rchat', 'rchat.json', null, force);
    await exports.saveSingle('mchat', 'mchat.json', null, force);
    await exports.saveSingle('viewshist', 'views.json', null, force);
    if (datajs.feat.enc == 'b64') {
      await exports.saveSingle('colog', 'colog.dat', b64a.encode, force);
      await exports.saveSingle('cologd', 'cologd.dat', b64a.encode, force);
    } else if (datajs.feat.enc == 'aes') {
      await exports.saveSingle('colog', 'colog.dat', x => CryptoJS.AES.encrypt(x, b64a.server).toString(), force);
      await exports.saveSingle('cologd', 'cologd.dat', x => CryptoJS.AES.encrypt(x, b64a.server).toString(), force);
    }
    await exports.saveSingle('savedvars', 'savedvars.json', null, force);
    await exports.saveSingle('saveddat', 'saveddat.json', null, force);
  },
  savevSync: async function (force) {
    exports.saveSingleSync('chat', 'chat.json', null, force);
    exports.saveSingleSync('rchat', 'rchat.json', null, force);
    exports.saveSingleSync('mchat', 'mchat.json', null, force);
    exports.saveSingleSync('viewshist', 'views.json', null, force);
    if (datajs.feat.enc == 'b64') {
      exports.saveSingleSync('colog', 'colog.dat', b64a.encode, force);
      exports.saveSingleSync('cologd', 'cologd.dat', b64a.encode, force);
    } else if (datajs.feat.enc == 'aes') {
      exports.saveSingleSync('colog', 'colog.dat', x => CryptoJS.AES.encrypt(x, b64a.server).toString(), force);
      exports.saveSingleSync('cologd', 'cologd.dat', x => CryptoJS.AES.encrypt(x, b64a.server).toString(), force);
    }
    exports.saveSingleSync('savedvars', 'savedvars.json', null, force);
    exports.saveSingleSync('saveddat', 'saveddat.json', null, force);
  },
  funcl: [],
};