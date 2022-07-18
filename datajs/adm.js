// jshint -W041
module.exports = exports = {
  setchat: function setchat(ind, ts, nam, tex) {
    if (typeof ts != 'string') ts = chat[ind][0];
    if (typeof nam != 'string') nam = chat[ind][1];
    if (typeof tex != 'string') tex = chat[ind][2];
    let ci = chat[ind];
    ci[0] = ts; ci[1] = nam; ci[2] = tex;
    chates.emit('chat-refresh');
  },
  addchat: function addchat(ts, nam, tex) {
    if (ts == null) ts = new Date().toISOString();
    else if (ts instanceof Date) ts = ts.toISOString();
    else if (typeof ts != 'string') ts = ts.toString();
    chat.push(['[' + ts + ']', nam, tex]);
    if (chat.length > datajs.feat.lim.chat) {
      chat.splice(0, chat.length - datajs.feat.lim.chat);
    }
    chates.emit('chat-msg', b64.encode(JSON.stringify(['[' + ts + ']', nam, tex])));
  },
  edtt: function edtt(ind, tex) { adm.setchat(ind, 0, 0, tex); },
  rsetchat: function raddchat(ind, v) {
    rchat[ind] = v;
  },
  raddchat: function raddchat(v) {
    rchat.push(v);
    if (rchat.length > datajs.feat.lim.rchat) {
      rchat.splice(0, rchat.length - datajs.feat.lim.rchat);
    }
  },
  mcreatechat: function createmchat(nam, hash) {
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
      if (mchat[nam].chat.length > datajs.feat.lim.mchat) {
        mchat[nam].chat.splice(0, mchat[nam].chat.length - datajs.feat.lim.mchat);
      }
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
    if (chatkicklist.indexOf(nam) < 0) chatkicklist.push(nam);
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
  vhset: function vhadd(rp, url, amt) {
    if (amt == null) amt = 0;
    viewshist[rp][url] = amt;
    if (datajs.feat.es) viewshistes.emit('update', rp, url, amt);
  },
  vhdel: function vhset(rp, urls) {
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
    for (var i in keyarr) {
      codel.push(b64d.encode(keyarr[i], 'o' + code));
    }
  },
};