// jshint -W086
module.exports = {
  create: function (name, type, opts) {
    if (type === undefined) {
      type = 'normal';
    }
    if (!opts) {
      opts = {};
    }
    if (!opts.console && !opts.colog) {
      opts.console = new datajs.Console();
      opts.colog = opts.console.colog;
    } else if (opts.console && !opts.colog) {
      opts.colog = console.colog;
    } else if (!opts.console && opts.colog) {
      opts.console = new datajs.Console(opts.colog);
    } else {
      opts.console.colog = opts.colog;
    }
    let co = {type: type, colog: opts.colog, console: opts.console};
    if (opts.phash) {
      consoleswpenc.push(name);
      co.phash = opts.phash;
    }
    switch (type) {
      case 'bash':
        co.running = false;
      case 'normal':
        if (opts.penc) {
          co.penc = opts.penc;
        } else if (co.phash) {
          co.penc = datajs.shufstr(b64a.se);
        }
        break;
      case 'vm':
        if (opts.context) {
          co.context = opts.context;
        } else {
          co.context = {};
        }
        co.context.console = co.console;
        vm.createContext(co.context, opts.contextopts);
        if (opts.penc) {
          co.penc = opts.penc;
        } else if (co.phash) {
          co.penc = datajs.shufstr(b64a.se);
        }
        break;
    }
    consoles[name] = co;
  },
  remove: function (name) {
    let ind = consoleswpenc.indexOf(name);
    delete consoles[name];
    if (ind > -1) {
      consoleswpenc.splice(ind, 1);
    }
  },
};