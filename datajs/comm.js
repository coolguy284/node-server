// jshint -W061
module.exports = {
  'nlist' : ['help', 'say', 'spls', 'splb', 'edtt', 'webban', 'webunban', 'webpardon', 'lock', 'unlock', 'kick', 'ban', 'unban', 'pardon', 'ipban', 'ban-ip', 'ipunban', 'unban-ip', 'ippardon', 'pardon-ip', 'ripban', 'rban-ip', 'ripunban', 'runban-ip', 'rippardon', 'rpardon-ip', 'feat', 'rule', 'cc', 'cct'],
  'list' : {
    'help' : ['Lists all commands or usage of one.', '[command]'],
    'say' : ['Says something in chat, under the name of "[server]".', '<text>'],
    'spls' : ['Remove something from chat at a specific index.', '<index>'],
    'splb' : ['Remove a number of things from the beginning of the chat.', '<number>'],
    'edtt' : ['Edit the text of the chat.', '<index> <text>'],
    'webban' : ['Ban an ip from this website.', '<ip>'],
    'webunban' : ['Unban an ip from this website.', '<ip>'],
    'lock' : ['Lock the server, preventing all requests except administration.', ''],
    'unlock' : ['Unlock the server, allowing all requests to it.', ''],
    'kick' : ['Kick someone from the chat.', '<name>'],
    'ban' : ['Ban someone from the chat.', '<name>'],
    'unban' : ['Unban someone from the chat', '<name>'],
    'ipban' : ['Ban an ip from the chat.', '<ip>'],
    'ipunban' : ['Unban an ip from the chat.', '<ip>'],
    'ripban' : ['Ban an ip from the BSC.', '<ip>'],
    'ripunban' : ['Unban an ip from the BSC.', '<ip>'],
    'cadd' : ['Add a command to be run with a key.', '<keyvar> <code>'],
    'caddb' : ['Add a command to be run with multiple keys.', '<keyarr> <code>'],
    'feat' : ['Edit a feature of this website.', '<name> [value]'],
    'cc' : ['Clear the console.', ''],
    'cct' : ['Clear the chat.', '']
  },
  'map' : function (val) {
    switch (val) {
      case 'help':
        return datajs.comm.list.help;
      case 'say':
        return datajs.comm.list.say;
      case 'spls':
        return datajs.comm.list.spls;
      case 'splb':
        return datajs.comm.list.splb;
      case 'edtt':
        return datajs.comm.list.edtt;
      case 'webban':
        return datajs.comm.list.webban;
      case 'webunban':
      case 'webpardon':
        return datajs.comm.list.webunban;
      case 'lock':
        return datajs.comm.list.lock;
      case 'unlock':
        return datajs.comm.list.unlock;
      case 'kick':
        return datajs.comm.list.kick;
      case 'ban':
        return datajs.comm.list.ban;
      case 'unban':
      case 'pardon':
        return datajs.comm.list.unban;
      case 'ipban':
      case 'ban-ip':
        return datajs.comm.list.ipban;
      case 'ipunban':
      case 'unban-ip':
      case 'ippardon':
      case 'pardon-ip':
        return datajs.comm.list.ipunban;
      case 'ripban':
      case 'rban-ip':
        return datajs.comm.list.ripban;
      case 'ripunban':
      case 'runban-ip':
      case 'rippardon':
      case 'rpardon-ip':
        return datajs.comm.list.ripunban;
      case 'feat':
      case 'rule':
        return datajs.comm.list.feat;
      case 'cc':
        return datajs.comm.list.cc;
      case 'cct':
        return datajs.comm.list.cct;
    }
  },
  'run' : function (tex, console) {
    if (tex[0] == '/') {
      tex = tex.substr(1, Infinity);
    }
    if (!console) {
      console = global.console;
    }
    let fa = tex.split(' ');
    let func = fa[0];
    let args = fa.slice(1, fa.length);
    switch (func) {
      case '':
        break;
      case 'term':
        try {process.send(['term']);} catch (e) {process.exit();}
        break;
      case 'restart':
        try {process.send(['restart']);} catch (e) {process.exit();}
        break;
      case 'say':
        adm.addchat(null, '[server]', args.join(' '));
        break;
      case 'spls':
        chat.splice(args[0], 1);
        break;
      case 'splb':
        chat.splice(0, args[0]);
        break;
      case 'edtt':
        adm.setchat(args[0], null, null, args.slice(1, Infinity));
        break;
      case 'webban':
        adm.ban(args.join(' '));
        break;
      case 'webunban':
      case 'webpardon':
        adm.unban(args.join(' '));
        break;
      case 'lock':
        global.locked = true;
        break;
      case 'unlock':
        global.locked = false;
        break;
      case 'kick':
        adm.chatkick(args.join(' '));
        break;
      case 'ban':
        adm.chatban(args.join(' '));
        break;
      case 'unban':
      case 'pardon':
        adm.chatunban(args.join(' '));
        break;
      case 'ipban':
      case 'ban-ip':
        adm.chatipban(args.join(' '));
        break;
      case 'ipunban':
      case 'unban-ip':
      case 'ippardon':
      case 'pardon-ip':
        adm.chatipunban(args.join(' '));
        break;
      case 'ripban':
      case 'rban-ip':
        adm.rchatipban(args.join(' '));
        break;
      case 'ripunban':
      case 'runban-ip':
      case 'rippardon':
      case 'rpardon-ip':
        adm.rchatipunban(args.join(' '));
        break;
      case 'cadd':
        adm.cadd(eval(args[0]), args.slice(1, Infinity).join(' '));
        break;
      case 'caddb':
        adm.caddb(eval(args[0]), args.slice(1, Infinity).join(' '));
        break;
      case 'feat':
      case 'rule':
        if (args.length == 1) {
          return datajs.feat[args[0]];
        } else if (args.length == 2) {
          datajs.feat[args[0]] = eval(args.slice(1, Infinity).join(' '));
        }
        break;
      case 'cc':
        console.clear();
        break;
      case 'cct':
        chat.splice(0, Infinity);
        break;
      case 'servtimo':
        if (args[0] !== undefined) {
          process.send(['settimeout', parseInt(args[0])]);
        } else {
          process.send(['gettimeout']);
          global.comconsole = console;
        }
        break;
      case 'help':
        if (args[0]) {
          if (datajs.comm.list.hasOwnProperty(args[0])) {
            let com = datajs.comm.map(args[0]);
            console.log(com[0]);
            if (com[1].length > 0) {
              console.log('Usage: ' + args[0] + ' ' + com[1]);
            } else {
              console.log('Usage: ' + args[0]);
            }
          } else {
            console.log('Command "' + args[0] + '" Nonexistent');
          }
        } else {
          console.log('List of commands:');
          console.log(datajs.comm.nlist.join(', '));
        }
        break;
      default:
        console.error('Command "' + func + '" Nonexistent');
        break;
    }
  },
};