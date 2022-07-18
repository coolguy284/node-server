// jshint -W041
module.exports = exports = {
  setchat: function setchat(ind, ts, nam, tex) {
    if (typeof ts != 'string') ts = chat[ind][0];
    if (typeof nam != 'string') nam = chat[ind][1];
    if (typeof tex != 'string') tex = chat[ind][2];
    let ci = chat[ind];
    ci[0] = ts; ci[1] = nam; ci[2] = tex;
    chates.emit('refresh');
  },
  addchat: function addchat(ts, nam, tex, doneByUser) {
    if (ts == null) ts = new Date().toISOString();
    else if (ts instanceof Date) ts = ts.toISOString();
    else if (typeof ts != 'string') ts = ts.toString();
    chat.push(['[' + ts + ']', nam, tex]);
    chates.emit('message', '[' + ts + ']', nam, tex);
    if (chat.length > datajs.feat.lim.chat) {
      adm.splb(chat.length - datajs.feat.lim.chat);
    }
    //if (doneByUser)
    //  setTimeout(adm.chattypremove, 100, nam.slice(1, -1));
  },
  edtt: function edtt(ind, tex) {
    adm.setchat(ind, null, null, tex);
  },
  spls: function spls(ind) {
    chat.splice(args[0], 1);
    chates.emit('splicei', args[0]);
  },
  splb: function splb(amt) {
    chat.splice(0, args[0]);
    chates.emit('spliceb', args[0]);
  },
  clearchat: function clearchat() {
    chat.splice(0, Infinity);
    chates.emit('clear');
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
  },
  raddchat: function raddchat(v) {
    rchat.push(v);
    if (rchat.length > datajs.feat.lim.rchat)
      rchat.splice(0, rchat.length - datajs.feat.lim.rchat);
  },
  rclearchat: function rclearchat() {
    rchat.splice(0, Infinity);
  },
  mcreatechat: function mcreatechat(nam, hash) {
    mchat[nam] = {
      hash: hash,
      chat: [],
    };
  },
  maddchat: function maddchat(nam, ts, j) {
    if (ts == null) ts = new Date().toISOString();
    else if (ts instanceof Date) ts = ts.toISOString();
    else if (typeof ts != 'string') ts = ts.toString();
    if (mchat[nam]) {
      mchat[nam].chat.push(['[' + ts + ']', j]);
      if (mchat[nam].chat.length > datajs.feat.lim.mchat)
        mchat[nam].chat.splice(0, mchat[nam].chat.length - datajs.feat.lim.mchat);
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
  },
  vhset: function vhset(rp, url, amt) {
    if (amt == null) amt = 0;
    viewshist[rp][url] = amt;
    if (datajs.feat.es) viewshistes.emit('update', rp, url, amt);
  },
  vhdel: function vhdel(rp, urls) {
    for (var url of urls) delete viewshist[rp][url];
    if (datajs.feat.es) viewshistes.emit('delete', rp, urls);
  },
  vhrefresh: function vhrefresh(rp, url) {
    if (datajs.feat.es) viewshistes.emit('refresh');
  },
  cadd: function cadd(key, code) {
    codel.push(b64d.encode(key, 'o' + code));
  },
  caddb: function caddb(keyarr, code) {
    for (var i in keyarr)
      codel.push(b64d.encode(keyarr[i], 'o' + code));
  },
};