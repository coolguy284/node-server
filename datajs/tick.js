// jshint -W041
module.exports = {
  'func' : function () {
    savedvars.timeout += 1;
    savedvars.maxtimeout = Math.max(savedvars.timeout, savedvars.maxtimeout);
    savedvars.uptime = (new Date().getTime()) - starttime;
    savedvars.maxuptime = Math.max(savedvars.uptime, savedvars.maxuptime);
    let remt = new Date().getTime();
    global.chatherelist = chatherelist.filter(function (val) {return val[0] > remt - 5000});
    global.chattyplist = chattyplist.filter(function (val) {return val[0] > remt - 2000});
    global.owneyesid = owneyesid.filter(function (val) {return val[0] > remt - 5000});
    global.loginid = loginid.filter(function (val) {return val[0] > remt - 864000000});
    if (Math.random() < 0.0001 && chatherelist.length == 5) {
      adm.addchat(null, '[server ghost]', datajs.splash[Math.floor(Math.random() * datajs.splash.length)]);
    }
    if (global.ticks % datajs.feat.savefreq == 0) {
      savev();
    }
    global.pcpuUsage = cpuUsage;
    global.cpuUsage = process.cpuUsage();
    global.dcpuUsage = { user: cpuUsage.user - pcpuUsage.user, system: cpuUsage.system - pcpuUsage.system };
    ticks++;
    for (let i in datajs.tick.funcl) {
      datajs.tick.funcl[i](remt);
    }
  },
  'funcl' : [],
  'on' : function () {
    datajs.tick.int = setInterval(datajs.tick.func, datajs.feat.tickint);
  },
  'off' : function () {
    clearInterval(datajs.tick.int);
  },
};