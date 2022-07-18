// jshint -W041
module.exports = {
  func: function () {
    savedvars.timeout += 1;
    savedvars.maxtimeout = Math.max(savedvars.timeout, savedvars.maxtimeout);
    savedvars.uptime = (new Date().getTime()) - sstdate.getTime();
    savedvars.maxuptime = Math.max(savedvars.uptime, savedvars.maxuptime);
    let remt = new Date().getTime();
    if (!datajs.feat.es) {
      global.chatherelist = chatherelist.filter(val => val[0] > remt - 60000);
      global.chattyplist = chattyplist.filter(val => val[0] > remt - 60000);
    }
    global.owneyesid = owneyesid.filter(val => val[0] > remt - 60000);
    global.loginid = loginid.filter(val => val[0] > remt - 864000000);
    if (datajs.feat.chatghost && Math.random() < 0.006 && chatherelist.length == 5) {
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
  savev: async function () {
    await fs.promises.writeFile(datajs.feat.datadir + '/chat.json', JSON.stringify(chat));
    await fs.promises.writeFile(datajs.feat.datadir + '/rchat.json', JSON.stringify(rchat));
    await fs.promises.writeFile(datajs.feat.datadir + '/mchat.json', JSON.stringify(mchat));
    await fs.promises.writeFile(datajs.feat.datadir + '/views.json', JSON.stringify(viewshist));
    if (datajs.feat.enc == 'b64') {
      await fs.promises.writeFile(datajs.feat.datadir + '/colog.dat', b64a.encode(JSON.stringify(colog)));
      await fs.promises.writeFile(datajs.feat.datadir + '/cologd.dat', b64a.encode(JSON.stringify(cologd)));
    } else if (datajs.feat.enc == 'aes') {
      await fs.promises.writeFile(datajs.feat.datadir + '/colog.dat', CryptoJS.AES.encrypt(JSON.stringify(colog), b64a.server).toString());
      await fs.promises.writeFile(datajs.feat.datadir + '/cologd.dat', CryptoJS.AES.encrypt(JSON.stringify(cologd), b64a.server).toString());
    }
    await fs.promises.writeFile(datajs.feat.datadir + '/savedvars.json', JSON.stringify(savedvars));
    await fs.promises.writeFile(datajs.feat.datadir + '/saveddat.json', JSON.stringify(saveddat));
  },
  savevSync: async function () {
    fs.writeFileSync(datajs.feat.datadir + '/chat.json', JSON.stringify(chat));
    fs.writeFileSync(datajs.feat.datadir + '/rchat.json', JSON.stringify(rchat));
    fs.writeFileSync(datajs.feat.datadir + '/mchat.json', JSON.stringify(mchat));
    fs.writeFileSync(datajs.feat.datadir + '/views.json', JSON.stringify(viewshist));
    if (datajs.feat.enc == 'b64') {
      fs.writeFileSync(datajs.feat.datadir + '/colog.dat', b64a.encode(JSON.stringify(colog)));
      fs.writeFileSync(datajs.feat.datadir + '/cologd.dat', b64a.encode(JSON.stringify(cologd)));
    } else if (datajs.feat.enc == 'aes') {
      fs.writeFileSync(datajs.feat.datadir + '/colog.dat', CryptoJS.AES.encrypt(JSON.stringify(colog), b64a.server).toString());
      fs.writeFileSync(datajs.feat.datadir + '/cologd.dat', CryptoJS.AES.encrypt(JSON.stringify(cologd), b64a.server).toString());
    }
    fs.writeFileSync(datajs.feat.datadir + '/savedvars.json', JSON.stringify(savedvars));
    fs.writeFileSync(datajs.feat.datadir + '/saveddat.json', JSON.stringify(saveddat));
  },
  funcl: [],
};