module.exports = {
  'echo' : function (name, cm) {
    if (name === undefined && cm === undefined) {
      name = 'anonymous';
      cm = console.log;
    } else if (name !== undefined && cm === undefined) {
      cm = console.log;
    }
    return {
      getPrototypeOf : function (obj) {
        cm(name + ' getprototype');
        return Object.getPrototypeOf(obj);
      },
      setPrototypeOf : function (obj, val) {
        cm(name + ' setprototype to ' + val);
        return Object.setPrototypeOf(obj, val);
      },
      isExtensible : function (obj) {
        cm(name + ' isextensible');
        return Object.isExtensible(obj);
      },
      preventExtensions : function (obj) {
        cm(name + ' preventextensions');
        return Object.preventExtensions(obj);
      },
      getOwnPropertyDescriptor : function (obj, nam) {
        cm('getpropdes ' + name + '[' + nam + ']');
        return Object.getOwnPropertyDescriptor(obj, nam);
      },
      defineProperty : function (obj, nam, val) {
        cm(name + ' defineproperty ' + nam + ' as ' + val);
        return Object.defineProperty(obj, nam, val);
      },
      has : function (obj, nam) {
        cm(name + ' has ' + nam.toString());
        return nam in obj;
      },
      get : function (obj, nam) {
        cm('get ' + name + '[' + util.inspect(nam) + ']');
        return obj[nam];
      },
      set : function (obj, nam, val) {
        cm('set ' + name + '[' + util.inspect(nam) + ']' + ' to ' + util.inspect(val));
        return (obj[nam] = val);
      },
      deleteProperty : function (obj, nam) {
        cm(name + ' delete ' + nam);
        return delete obj[nam];
      },
      ownKeys : function (obj) {
        cm(name + ' ownkeys');
        return Reflect.ownKeys(obj);
      },
      apply : function (obj, thiso, args) {
        cm(name + ' apply as ' + thiso + ' with ' + args);
        return obj.apply(thiso, args);
      },
      construct : function (obj, args) {
        cm(name + ' construct with ' + args);
        return new obj(...args);
      },
    };
  },
  'python' : function () {
    return {
      get : function (obj, nam) {
        if (obj.__getattribute__) {
          return obj.__getattribute__(nam);
        }
        if (nam in obj) {
          return obj[nam];
        }
        if (obj.__getattr__) {
          return obj.__getattr__(nam);
        }
      },
    };
  },
};