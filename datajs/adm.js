// jshint maxerr:1000
module.exports = {
  'setchat' : function setchat(ind, ts, nam, tex) {
    if (typeof ts != 'string') {
      ts = chat[ind][0];
    }
    if (typeof nam != 'string') {
      nam = chat[ind][1];
    }
    if (typeof tex != 'string') {
      tex = chat[ind][2];
    }
    chat[ind] = [ts, nam, tex];
  },
  'addchat' : function addchat(ts, nam, tex) {
    if (typeof ts != 'string') {
      ts = new Date().toISOString();
    }
    chat.push(['[' + ts + ']', nam, tex]);
    if (chat.length > datajs.feat.lim.chat) {
      chat.splice(0, chat.length - datajs.feat.lim.chat);
    }
  },
  'edtn' : function edtn(ind, nam) {
    chat[ind] = [chat[ind][0], nam, chat[ind][2]];
  },
  'edtt' : function edtt(ind, tex) {
    chat[ind] = [chat[ind][0], chat[ind][1], tex];
  },
  'ban' : function ban(ip) {
    if (baniplist.indexOf(ip) < 0) {
      baniplist.push(ip);
    }
  },
  'unban' : function unban(nam) {
    let v = baniplist.indexOf(nam);
    if (v > -1) {
      baniplist.splice(v, 1);
    }
  },
  'chatkick' : function chatkick(nam) {
    if (chatkicklist.indexOf(nam) < 0) {
      chatkicklist.push(nam);
    }
  },
  'chatban' : function chatban(nam) {
    if (chatbanlist.indexOf(nam) < 0) {
      chatbanlist.push(nam);
    }
  },
  'chatunban' : function chatunban(nam) {
    let v = chatbanlist.indexOf(nam);
    if (v > -1) {
      chatbanlist.splice(v, 1);
    }
  },
  'chatipban' : function chatipban(ip) {
    if (chatbaniplist.indexOf(ip) < 0) {
      chatbaniplist.push(ip);
    }
  },
  'chatipunban' : function chatipunban(ip) {
    let v = chatbaniplist.indexOf(ip);
    if (v > -1) {
      chatbaniplist.splice(v, 1);
    }
  },
  'rchatipban' : function rchatipban(ip) {
    if (rchatbaniplist.indexOf(ip) < 0) {
      rchatbaniplist.push(ip);
    }
  },
  'rchatipunban' : function rchatipunban(ip) {
    let v = rchatbaniplist.indexOf(ip);
    if (v > -1) {
      rchatbaniplist.splice(v, 1);
    }
  },
  'cadd' : function cadd(key, code) {
    codel.push(b64d.encode(key, 'o' + code));
  },
  'caddb' : function caddb(keyarr, code) {
    for (var i in keyarr) {
      codel.push(b64d.encode(keyarr[i], 'o' + code));
    }
  },
};