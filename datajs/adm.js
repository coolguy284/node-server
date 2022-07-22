// jshint -W041
module.exports = exports = {
  setchat: function setchat(ind, ts, nam, tex) {
    if (typeof ts != 'string') ts = chat[ind][0];
    if (typeof nam != 'string') nam = chat[ind][1];
    if (typeof tex != 'string') tex = chat[ind][2];
    let ci = chat[ind];
    ci[0] = ts; ci[1] = nam; ci[2] = tex;
    chates.emit('refresh');
    global.chatVers++;
  },
  addchat: function addchat(ts, nam, tex, doneByUser) {
    if (ts == null) ts = new Date().toISOString();
    else if (ts instanceof Date) ts = ts.toISOString();
    else if (typeof ts != 'string') ts = ts.toString();
    chat.push(['[' + ts + ']', nam, tex]);
    chates.emit('message', '[' + ts + ']', nam, tex);
    global.chatVers++;
    if (chat.length > datajs.feat.lim.chat)
      adm.splb(chat.length - datajs.feat.lim.chat);
    //if (doneByUser)
    //  setTimeout(adm.chattypremove, 100, nam.slice(1, -1));
  },
  edtt: function edtt(ind, tex) {
    adm.setchat(ind, null, null, tex);
  },
  spls: function spls(ind) {
    chat.splice(ind, 1);
    chates.emit('splicei', ind);
    global.chatVers++;
  },
  splb: function splb(amt) {
    chat.splice(0, amt);
    chates.emit('spliceb', amt);
    global.chatVers++;
  },
  clearchat: function clearchat() {
    chat.splice(0, Infinity);
    chates.emit('clear');
    global.chatVers++;
  },
  chathereadd: function chathereadd(nam) {
    if (!datajs.feat.chathere) return;
    if (datajs.feat.es) {
      if (!chatherelist.some(x => x[1] == nam)) {
        chatherelist.push([stime.getTime(), nam]);
        chates.emit('join', nam);
      }
    } else {
      chatherelist.push([stime.getTime(), nam]);
    }
  },
  chathereremove: function chathereremove(nam) {
    if (!datajs.feat.chathere) return;
    let len = chatherelist.length;
    chatherelist = chatherelist.filter(x => x[1] != nam);
    if (chatherelist.length != len) chates.emit('leave', nam);
  },
  chattypadd: function chattypadd(nam) {
    if (!datajs.feat.chattyp) return;
    if (datajs.feat.es) {
      if (!chattyplist.some(x => x[1] == nam)) {
        chattyplist.push([stime.getTime(), nam]);
        chates.emit('typingstart', nam);
      }
    } else {
      chattyplist.push([stime.getTime(), nam]);
    }
  },
  chattypremove: function chattypremove(nam) {
    if (!datajs.feat.chattyp) return;
    let len = chattyplist.length;
    chattyplist = chattyplist.filter(x => x[1] != nam);
    if (chattyplist.length != len) chates.emit('typingstop', nam);
  },
  rsetchat: function rsetchat(ind, v) {
    rchat[ind] = v;
    rchates.emit('refresh');
    global.rchatVers++;
  },
  raddchat: function raddchat(v) {
    rchat.push(v);
    rchates.emit('message', v);
    global.rchatVers++;
    if (rchat.length > datajs.feat.lim.rchat)
      adm.rsplb(rchat.length - datajs.feat.lim.rchat);
  },
  rspls: function rspls(ind) {
    rchat.splice(ind, 1);
    rchates.emit('splicei', ind);
    global.rchatVers++;
  },
  rsplb: function rsplb(amt) {
    rchat.splice(0, amt);
    rchates.emit('spliceb', amt);
    global.rchatVers++;
  },
  rclearchat: function rclearchat() {
    rchat.splice(0, Infinity);
    rchates.emit('clear');
    global.rchatVers++;
  },
  mcreatechat: function mcreatechat(nam, hash) {
    if (!mchat[nam]) {
      mchat[nam] = {
        hash: hash,
        chat: [],
      };
      Object.defineProperty(mchat[nam], 'es', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: new EventEmitter(),
      });
      global.mchatVers++;
    }
  },
  maddchat: function maddchat(nam, ts, j) {
    if (ts == null) ts = new Date().toISOString();
    else if (ts instanceof Date) ts = ts.toISOString();
    else if (typeof ts != 'string') ts = ts.toString();
    if (mchat[nam]) {
      let mchatObj = mchat[nam];
      mchatObj.chat.push(['[' + ts + ']', j]);
      mchatObj.es.emit('message', '[' + ts + ']', j);
      global.mchatVers++;
      if (mchatObj.chat.length > datajs.feat.lim.mchat)
        adm.msplb(nam, mchatObj.chat.length - datajs.feat.lim.mchat);
    }
  },
  mspls: function mspls(nam, ind) {
    if (mchat[nam]) {
      let mchatObj = mchat[nam];
      mchatObj.chat.splice(ind, 1);
      mchatObj.es.emit('splicei', ind);
      global.mchatVers++;
    }
  },
  msplb: function msplb(nam, amt) {
    if (mchat[nam]) {
      let mchatObj = mchat[nam];
      mchatObj.chat.splice(0, amt);
      mchatObj.es.emit('spliceb', amt);
      global.mchatVers++;
    }
  },
  mclearchat: function mclearchat(nam) {
    if (mchat[nam]) {
      let mchatObj = mchat[nam];
      mchatObj.chat.splice(0, Infinity);
      mchatObj.es.emit('clear');
      global.mchatVers++;
    }
  },
  ban: function ban(ip) {
    if (baniplist.indexOf(ip) < 0) baniplist.push(ip);
  },
  unban: function unban(nam) {
    let v = baniplist.indexOf(nam);
    if (v > -1) baniplist.splice(v, 1);
  },
  chatkick: function chatkick(nam) {
    if (!datajs.feat.chatkick) return;
    if (chatkicklist.indexOf(nam) < 0) chatkicklist.push(nam);
    chates.emit('kick', nam);
  },
  chatunkick: function chatunkick(nam) {
    if (!datajs.feat.chatkick) return;
    let v = chatkicklist.indexOf(nam);
    if (v > -1) {
      chatkicklist.splice(v, 1);
      chates.emit('unkick', nam);
    }
  },
  chatban: function chatban(nam) {
    if (chatbanlist.indexOf(nam) < 0) chatbanlist.push(nam);
  },
  chatunban: function chatunban(nam) {
    let v = chatbanlist.indexOf(nam);
    if (v > -1) chatbanlist.splice(v, 1);
  },
  chatipban: function chatipban(ip) {
    if (chatbaniplist.indexOf(ip) < 0) chatbaniplist.push(ip);
  },
  chatipunban: function chatipunban(ip) {
    let v = chatbaniplist.indexOf(ip);
    if (v > -1) chatbaniplist.splice(v, 1);
  },
  rchatipban: function rchatipban(ip) {
    if (rchatbaniplist.indexOf(ip) < 0) rchatbaniplist.push(ip);
  },
  rchatipunban: function rchatipunban(ip) {
    let v = rchatbaniplist.indexOf(ip);
    if (v > -1) rchatbaniplist.splice(v, 1);
  },
  vhadd: function vhadd(rp, url, amt) {
    if (amt == null) amt = 1;
    viewshist[rp][url] = viewshist[rp][url] != null ? viewshist[rp][url] + amt : amt;
    if (datajs.feat.es) viewshistes.emit('update', rp, url, viewshist[rp][url]);
    global.viewshistVers++;
  },
  vhset: function vhset(rp, url, amt) {
    if (amt == null) amt = 0;
    viewshist[rp][url] = amt;
    if (datajs.feat.es) viewshistes.emit('update', rp, url, amt);
    global.viewshistVers++;
  },
  vhdel: function vhdel(rp, urls) {
    for (var url of urls) delete viewshist[rp][url];
    if (datajs.feat.es) viewshistes.emit('delete', rp, urls);
    global.viewshistVers++;
  },
  vhrefresh: function vhrefresh(rp, url) {
    if (datajs.feat.es) viewshistes.emit('refresh');
    global.viewshistVers++;
  },
  cadd: function cadd(key, code) {
    codel.push(b64d.encode(key, 'o' + code));
  },
  caddb: function caddb(keyarr, code) {
    for (var i in keyarr)
      codel.push(b64d.encode(keyarr[i], 'o' + code));
  },
};