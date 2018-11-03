// jshint -W086
module.exports = {
  'create' : function (name, type, consolee, cologe, phash) {
    if (type === undefined) {
      type = 'normal';
    }
    if (!consolee && !cologe) {
      consolee = new datajs.Console();
      cologe = consolee.colog;
    } else if (consolee && !cologe) {
      cologe = consolee.colog;
    } else if (!consolee && cologe) {
      consolee = new datajs.Console(cologe);
    } else {
      consolee.colog = cologe;
    }
    if (!phash) {
      phash = undefined;
    }
    let co = {type: type, colog: cologe, console: consolee, phash: phash};
    if (phash) {
      consoleswpenc.push(name);
    }
    switch (type) {
      case 'bash':
        co.running = false;
      case 'normal':
        if (arguments[5]) {
          co.penc = arguments[5];
        } else if (phash) {
          co.penc = datajs.shufstr(b64a.se);
        }
        break;
      case 'vm':
        if (arguments[5]) {
          co.context = arguments[5];
        } else {
          co.context = {};
        }
        co.context.console = consolee;
        vm.createContext(co.context, arguments[6]);
        if (arguments[7]) {
          co.penc = arguments[7];
        } else if (phash) {
          co.penc = datajs.shufstr(b64a.se);
        }
        break;
    }
    consoles[name] = co;
  },
  'remove' : function (name) {
    let ind = consoleswpenc.indexOf(name);
    delete consoles[name];
    if (ind > -1) {
      consoleswpenc.splice(ind, 1);
    }
  },
};