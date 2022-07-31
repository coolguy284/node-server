try { util } catch (e) { util = {}; }
utila = (function () {
  let defaultOptions = {
    showHidden: false,
    depth: 2,
    colors: false,
    customInspect: true,
    maxArrayLength: 100,
    breakLength: 60,
    compact: true,
    sorted: false,
  };
  let typedArrays = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array'];
  let boxedPrimitives = ['Boolean', 'Number', 'BigInt', 'String', 'Symbol'];
  let className = function(val) {
    try { return val.constructor.name; } catch (e) { return '[Object: null prototype]';}
  };
  let objectToString = function(val) {
    let tv = Object.prototype.toString.call(val);
    return tv.substring(8, tv.length - 1);
  };
  let stringProp = function(val) {
    if (typeof val == 'symbol') return '[' + inspect(val) + ']';
    if ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_'.indexOf(val[0]) < 0) return inspect(val);
    for (let i in val) if ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'.indexOf(val[i]) < 0) return inspect(val);
    return val;
  };
  let inspect = function(val, opts) {
    if (opts === undefined) opts = {};
    if (opts.showHidden === undefined) opts.showHidden = defaultOptions.showHidden;
    if (opts.depth === undefined) opts.depth = defaultOptions.depth;
    if (opts.colors === undefined) opts.colors = defaultOptions.colors;
    if (opts.customInspect === undefined) opts.customInspect = defaultOptions.customInspect;
    if (opts.maxArrayLength === undefined) opts.maxArrayLength = defaultOptions.maxArrayLength;
    if (opts.breakLength === undefined) opts.breakLength = defaultOptions.breakLength;
    if (opts.compact === undefined) opts.compact = defaultOptions.compact;
    if (opts.sorted === undefined) opts.sorted = defaultOptions.sorted;
    opts.indentLvl = 0;
    opts.objs = [];
    return formatValue(val, opts);
  };
  let formatObject = function(val, opts, keys, ins) {
    if (opts.depth < 0) return ins || '[Object]';
    opts = Object.assign({}, opts);
    opts.objs = [...opts.objs, val];
    if (keys === undefined) {
      if (opts.showHidden == true) keys = Reflect.ownKeys(val);
      else keys = Object.keys(val);
    }
    if (opts.sorted == true) keys.sort();
    else if (opts.sorted != false) keys.sort(opts.sorted);
    let ba = keys.map(function (i) {
      return stringProp(i) + ': ' + formatPropDes(Object.getOwnPropertyDescriptor(val, i), Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2}));
    });
    let baj = ba.join(', ');
    if (baj.length > opts.breakLength) baj = ba.join(',\n' + ' '.repeat(opts.indentLvl + 2));
    if (baj == '') return ins || '{}';
    else return '{ ' + (ins !== undefined ? ins + ' ' : '') + baj + ' }';
  };
  let formatArray = function(val, opts, bkeys) {
    if (opts.depth < 0) return '[Array]';
    opts = Object.assign({}, opts);
    opts.objs = [...opts.objs, val];
    let ba = [], ind = -1, exc = true, vkeys;
    if (bkeys === undefined) {
      if (opts.showHidden == true) bkeys = Reflect.ownKeys(val);
      else bkeys = Object.keys(val);
    }
    keys = bkeys.filter(x => !(!isNaN(x) && Number.isInteger(Number(x)) && Number(x) >= 0) && x != 'length');
    vkeys = bkeys.filter(x => (!isNaN(x) && Number.isInteger(Number(x)) && Number(x) >= 0) && x != 'length');
    if (opts.sorted == true) keys.sort();
    else if (opts.sorted != false) keys.sort(opts.sorted);
    for (let iv in vkeys) {
      let i = vkeys[iv];
      if (ba.length + 1 > opts.maxArrayLength) {
        let ia = val.length - i;
        if (ia > 1) ba.push('... ' + ia + ' more items');
        else ba.push('... 1 more item');
        exc = false;
        break;
      }
      if (i != ind + 1) {
        let ia = i - ind - 1;
        if (ia > 1) ba.push('<' + ia + ' empty items>');
        else ba.push('<1 empty item>');
      }
      ba.push(formatValue(val[i], Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
      ind = parseInt(i);
    }
    if (val.length > ind + 1 && exc) {
      let la = val.length - ind - 1;
      if (la > 1) ba.push('... ' + la + ' more items');
      else ba.push('... 1 more item');
    }
    keys.forEach(function (i) {
      ba.push(stringProp(i) + ': ' + formatPropDes(Object.getOwnPropertyDescriptor(val, i), Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
    });
    let baj = ba.join(', ');
    if (baj.length > opts.breakLength) baj = ba.join(',\n' + ' '.repeat(opts.indentLvl + 2));
    if (baj == '') return '[]';
    else return '[ ' + baj + ' ]';
  };
  let formatMap = function(val, opts, keys) {
    if (opts.depth < 0) return '[Map]';
    opts = Object.assign({}, opts);
    opts.objs = [...opts.objs, val];
    let ba = Array.from(val);
    if (opts.sorted == true) ba.sort((a, b) => (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0));
    else if (opts.sorted != false) ba.sort((a, b) => opts.sorted(a[0], b[0]));
    ba = ba.map(x => formatValue(x[0], Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})) + ' => ' + formatValue(x[1], Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
    if (keys === undefined) {
      if (opts.showHidden == true) keys = Reflect.ownKeys(val);
      else keys = Object.keys(val);
    }
    if (opts.sorted == true) keys.sort();
    else if (opts.sorted != false) keys.sort(opts.sorted);
    keys.forEach(function (i) {
      ba.push(stringProp(i) + ': ' + formatPropDes(Object.getOwnPropertyDescriptor(val, i), Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
    });
    let baj = ba.join(', ');
    if (baj.length > opts.breakLength) baj = ba.join(',\n' + ' '.repeat(opts.indentLvl + 2));
    if (baj == '') return '{}';
    else return '{ ' + baj + ' }';
  };
  let formatSet = function(val, opts, keys) {
    if (opts.depth < 0) return '[Set]';
    opts = Object.assign({}, opts);
    opts.objs = [...opts.objs, val];
    let ba = Array.from(val);
    if (opts.sorted == true) ba.sort();
    else if (opts.sorted != false) ba.sort(opts.sorted);
    ba = ba.map(x => formatValue(x, Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
    if (keys === undefined) {
      if (opts.showHidden == true) keys = Reflect.ownKeys(val);
      else keys = Object.keys(val);
    }
    if (opts.sorted == true) keys.sort();
    else if (opts.sorted != false) keys.sort(opts.sorted);
    keys.forEach(function (i) {
      ba.push(stringProp(i) + ': ' + formatPropDes(Object.getOwnPropertyDescriptor(val, i), Object.assign(Object.assign({}, opts), {depth:opts.depth-1,indentLvl:opts.indentLvl+2})));
    });
    let baj = ba.join(', ');
    if (baj.length > opts.breakLength) baj = ba.join(',\n' + ' '.repeat(opts.indentLvl + 2));
    if (baj == '') return '{}';
    else return '{ ' + baj + ' }';
  };
  let formatPropDes = function(val, opts) {
    if (val.get && val.set) return '[Getter/Setter]';
    else if (val.get) return '[Getter]';
    else if (val.set) return '[Setter]';
    return formatValue(val.value, opts);
  };
  let formatValue = function(val, opts) {
    if (val === undefined) return 'undefined';
    else if (val === null) return 'null';
    else if (typeof val == 'boolean') return val.toString();
    else if (typeof val == 'number') {
      if (Object.is(val, -0)) {
        return '-0';
      } else {
        return val.toString();
      }
    } else if (typeof val == 'bigint') return val.toString() + 'n';
    else if (typeof val == 'symbol') return val.toString();
    else if (typeof val == 'string') {
      let js = JSON.stringify(val);
      return '\'' + js.substring(1, js.length - 1).replace(/'/g, '\\\'').replace(/\\"/g, '"') + '\'';
    } else if (typeof val == 'function') {
      let keys, fn, cn = className(val);
      if (opts.showHidden) {
        keys = Reflect.ownKeys(val).filter(x => x != 'prototype');
      } else {
        keys = Object.keys(val);
      }
      if (val.name == '') fn = '[' + cn + ']';
      else fn = '[' + cn + ': ' + val.name + ']';
      if (keys.length == 0) {
        return fn;
      } else {
        let rs = formatObject(val, opts, keys, fn);
        return rs;
      }
    } else {
      if (opts.objs.indexOf(val) > -1) return '[Circular]';
      if (opts.customInspect) {
        try {
          if (val[inspect.custom]) return val[inspect.custom]();
          if (val.inspect) return val.inspect();
        } catch (e) {}
      }
      let cn = className(val), objs = objectToString(val);
      if (opts.depth < 0) {
        if (cn == objs) return '[' + cn + ']';
        else return cn + ' [' + objs + ']';
      }
      if (cn == 'Object') {
        if (objs == 'Object') return formatObject(val, opts);
        else return 'Object [' + objs + '] ' + formatObject(val, opts);
      } else if (cn == 'Array') {
        if (objs == 'Array') return formatArray(val, opts);
        else return 'Array [' + objs + '] ' + formatArray(val, opts);
      } else if (typedArrays.indexOf(cn) > -1) {
        return cn + ' ' + formatArray(val, opts);
      } else if (boxedPrimitives.indexOf(cn) > -1) {
        let ov = '[' + cn + ': ' + inspect(val.valueOf()) + ']', keys;
        if (opts.showHidden) {
          keys = Reflect.ownKeys(val);
        } else {
          keys = Object.keys(val);
        }
        if (keys.length == 0) {
          return ov;
        } else {
          let rs = formatObject(val, opts, keys, ov);
          return rs;
        }
      } else if (val instanceof Error) {
        return val.stack;
      } else if (cn == 'WeakMap' || cn == 'WeakSet') {
        return cn + '{ [items unknown] }';
      } else if (cn == 'Map') {
        if (objs == 'Map') return cn + ' ' + formatMap(val, opts);
        else return 'Map [' + objs + '] ' + formatMap(val, opts);
      } else if (cn == 'Set') {
        if (objs == 'Set') return cn + ' ' + formatSet(val, opts);
        else return 'Set [' + objs + '] ' + formatSet(val, opts);
      } else if (cn == 'Date') {
        return val.toISOString();
      } else if (cn == objs || objs == 'Object') {
        return cn + ' ' + formatObject(val, opts);
      } else {
        return cn + ' [' + objs + '] ' + formatObject(val, opts);
      }
    }
  };
  inspect.custom = Symbol.for('nodejs.util.inspect.custom');
  return { defaultOptions, typedArrays, boxedPrimitives, className, objectToString, stringProp, inspect, formatObject, formatArray, formatMap, formatSet, formatPropDes, formatValue };
})();
Object.assign(util, utila);
delete utila;
inspect = util.inspect;