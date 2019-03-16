// jshint maxerr:1000 -W041 -W061 -W122
//e={};e.a='b';e.c={'d':'e'};e.c.z='xyz';e.d=e.c;e.e=e.c.z;e.y={'t':e.c.z};e.f=e;e.g={'h':e};e.g.l=e.g
//e=[];e.push('b');e.push(['e']);e[1].push('xyz');e.push(e[1]);e.push(e[1][1]);e.push([e[1][1]]);e.push(e);e.push([e]);e[6].push(e[6])
/*
testobj = {
  str: 'ell',
  'space name': 'val" \' " \'ue',
  array: [1, 2, 3, Infinity, -0, 'vell', /r ' " ' "/g, new Date(10), new Date(Infinity)],
  map: new Map([['kartograph', -0], [-1, -Infinity], [1, Infinity], [0, -0]]),
  set: new Set(['are', 'we', 'set', 'yet', '?', Symbol.for(' '), Symbol.for('maybe'), '.']),
  smobj: {
    ven: new Buffer([0xde, 0xad, 0xbe, 0xef]),
  },
  [Symbol.unscopables]: ['dex', 'jex', 'krex', -1, -0.00001, 0.00001, 0, Number.MAX_SAFE_INTEGER]
};
testobj.array.push(testobj, testobj.array);
testobj.map.set(testobj.array, testobj.smobj);
testobj.map.set(testobj, testobj.map);
testobj.set.add(testobj);
testobj.set.add(testobj.set);
testobj.smobj.vel = new Buffer(testobj.smobj.ven.buffer);
testobj.smobj.target = testobj;
testobj.smobj.loupe = testobj.smobj;
*/
module.exports = {
  symbolk: ['hasInstance', 'isConcatSpreadable', 'iterator', 'match', 'replace', 'search', 'species', 'split', 'toPrimitive', 'toStringTag', 'unscopables'],
  symbolv: [Symbol.hasInstance, Symbol.isConcatSpreadable, Symbol.iterator, Symbol.match, Symbol.replace, Symbol.search, Symbol.species, Symbol.split, Symbol.toPrimitive, Symbol.toStringTag, Symbol.unscopables],
  getarr: function (obj, rs) {
    let bks = false;
    let bs = '';
    let bds = false;
    for (let i in rs) {
      if (bds) {
        if (rs[i] == '\\' && bks == false) {
          bks = true;
          bs += rs[i];
        } else if (rs[i] == '\\' && bks == true) {
          bks = false;
          bs += rs[i];
        } else if (rs[i] == '"' && bks == false && bs != '') {
          bds = false;
          bs += rs[i];
        } else if (rs[i] == ']') {
          bds = false;
          if (bs == 'st') {
            obj = Array.from(obj);
          } else {
            obj = obj[module.exports.parse(bs)];
          }
          bs = '';
        } else {
          bs += rs[i];
        }
      } else {
        if (rs[i] == '[') {
          bds = true;
        } else if (rs[i] == ']') {
          if (bs == 'st') {
            obj = Array.from(obj);
          } else {
            obj = obj[module.exports.parse(bs)];
          }
          bs = '';
        }
      }
    }
    return obj;
  },
  stringify: function (val, opts, obja, rs) {
    if (opts === undefined) {
      opts = {};
    }
    if (opts.nmapp === undefined) {
      opts.nmapp = true;
    }
    let objs = Object.prototype.toString.call(val);
    if (val === undefined) {
      return 'undefined';
    } else if (val === null) {
      return 'null';
    } else if (typeof val == 'boolean') {
      return val.toString();
    } else if (typeof val == 'number') {
      if (Object.is(val, -0)) {
        return '-0';
      }
      return val.toString();
    } else if (typeof val == 'bigint') {
      return val.toString() + 'n';
    } else if (typeof val == 'string') {
      return JSON.stringify(val);
    } else if (typeof val == 'symbol') {
      let sind = module.exports.symbolv.indexOf(val);
      if (sind > -1) {
        return 's.' + module.exports.symbolk[sind];
      }
      let ss = val.toString();
      return 's' + module.exports.stringify(ss.substring(7, ss.length - 1));
    } else if (typeof val == 'function') {
      return val.toString();
    } else if (objs == '[object RegExp]') {
      return val.toString();
    } else if (objs == '[object Date]') {
      return 'd' + module.exports.stringify(val.getTime());
    } else if (objs == '[object Map]') {
      if (!obja) obja = [[val], ['']];
      return 'm' + module.exports.stringify(Array.from(val), opts, obja, (rs || '') + '[st]');
    } else if (objs == '[object Set]') {
      if (!obja) obja = [[val], ['']];
      return 'st' + module.exports.stringify(Array.from(val), opts, obja, (rs || '') + '[st]');
    } else if (Object.prototype.toString.call(val) == '[object Array]') {
      if (!obja) obja = [[val], ['']];
      if (!rs) rs = '';
      let bs = '';
      let pv = -1;
      for (let i in val) {
        if (parseInt(i) != (pv + 1)) {
          bs += 'i' + i + ':';
        }
        let ind = obja[0].indexOf(val[i]);
        if (ind < 0) {
          let ms = module.exports.stringify(i);
          if (!opts.nmapp || typeof val[i] == 'object' || typeof val[i] == 'function') {
            obja[0].push(val[i]);
            obja[1].push(rs + '[' + ms + ']');
          }
          bs += module.exports.stringify(val[i], opts, obja, rs + '[' + ms + ']');
        } else {
          bs += 'p' + module.exports.stringify(obja[1][ind]);
        }
        if (i < val.length - 1) {
          bs += ',';
        }
        pv = parseInt(i);
      }
      return '[' + bs + ']';
    } else if (typeof val == 'object') {
      if (!obja) {
        obja = [[val], ['']];
      }
      if (!rs) {
        rs = '';
      }
      let pn;
      if (opts.incsymbol) {
        pn = Reflect.ownKeys(val);
      } else {
        pn = Object.getOwnPropertyNames(val);
      }
      let bs = '';
      for (let i in pn) {
        let obj = pn[i];
        bs += module.exports.stringify(obj) + ':';
        let ind = obja[0].indexOf(val[obj]);
        if (ind < 0) {
          let ms = module.exports.stringify(obj);
          if (!opts.nmapp || typeof val[obj] == 'object' || typeof val[obj] == 'function') {
            obja[0].push(val[obj]);
            obja[1].push(rs + '[' + ms + ']');
          }
          bs += module.exports.stringify(val[obj], opts, obja, rs + '[' + ms + ']');
        } else {
          bs += 'p' + module.exports.stringify(obja[1][ind]);
        }
        if (i < pn.length - 1) {
          bs += ',';
        }
      }
      return '{' + bs + '}';
    }
  },
  parse: function (val, obj, rs, poarr) {
    if (val.length > 0) {
      if (val == 'undefined') {
        return undefined;
      } else if (val == 'null') {
        return null;
      } else if (val == 'true') {
        return true;
      } else if (val == 'false') {
        return false;
      } else if (val == 'Infinity') {
        return Infinity;
      } else if (val == '-Infinity') {
        return -Infinity;
      } else if (val == 'NaN') {
        return NaN;
      } else if ('0123456789-'.indexOf(val[0]) > -1) {
        if (val[val.length - 1] == 'n') {
          return BigInt(val.substr(0, val.length - 1));
        } else {
          return Number(val);
        }
      } else if (val[0] == '"') {
        return JSON.parse(val);
      } else if (val[0] == 's' && val[1] == '"') {
        return Symbol(JSON.parse(val.substr(1, Infinity)));
      } else if (val[0] == 's' && val[1] == '.') {
        return Symbol[val.substr(2, Infinity)];
      } else if (val[0] == 'f') {
        return eval('(' + val + ')');
      } else if (val[0] == '/') {
        let rp = /\/(.*)\/(.*)/.exec(val);
        return RegExp(rp[0], rp[1]);
      } else if (val[0] == 'd') {
        return new Date(module.exports.parse(val.substr(1, Infinity)));
      } else if (val[0] == 'm') {
        return new Map(module.exports.parse(val.substr(1, Infinity)));
      } else if (val[0] == 's' && val[1] == 't') {
        let st = new Set();
        let sar = module.exports.parse(val.substr(2, Infinity), obj || st, (rs || '') + '[st]', poarr || []);
        for (let i in sar) {
          st.add(sar[i]);
        }
        return st;
      } else if (val[0] == 'r') {
        return new Object(module.exports.parse(val.substr(1, Infinity)));
      } else if (val[0] == 'o') {
        return module.exports.stringify(val.substr(1, Infinity));
      } else if (val[0] == '[') {
        let rv = [];
        if (val == '[]') {
          return rv;
        }
        let ca = ['a'];
        let aind = -1;
        let nael = 1;
        let naind = '';
        let se = false;
        val = val.substring(1, val.length - 1);
        for (let i in val) {
          if (nael > 0) {
            if (nael == 1) {
              if (val[i] == 'i') {
                nael = 2;
                continue;
              } else {
                nael = 0;
                aind += 1;
                rv[aind] = '';
              }
            } else if (nael == 2) {
              if (val[i] == ':') {
                nael = 0;
                aind = Number(naind);
                rv[aind] = '';
                continue;
              } else {
                naind += val[i];
                continue;
              }
            }
          }
          let nset = false;
          if (val[i] == '[' && ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
            ca.push('a');
          } else if (val[i] == ']') {
            if (ca[ca.length-1] == 'a') {
              ca.pop();
            } else if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              throw new SyntaxError('unexpected token');
            }
          } else if (val[i] == '{' && ca[ca.length-1] != 's') {
            ca.push('o');
          } else if (val[i] == '}') {
            if (ca[ca.length-1] == 'o') {
              ca.pop();
            } else if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              throw new SyntaxError('unexpected token');
            }
          } else if (val[i] == '"') {
            if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              ca.push('s');
            } else if (se == false && ca[ca.length-1] != 'r') {
              ca.pop();
            }
          } else if (val[i] == '/') {
            if (ca[ca.length-1] != 'r' && ca[ca.length-1] != 's') {
              ca.push('r');
            } else if (se == false && ca[ca.length-1] != 's') {
              ca.pop();
            }
          } else if (val[i] == '\\' && ca[ca.length-1] == 's') {
            se = !se;
            if (se == true) {
              nset = true;
            }
          } else if (val[i] == ',' && ca.length == 1) {
            nael = 1;
          }
          if (val[i] != ',' || ca.length != 1) {
            rv[aind] += val[i];
          }
          if (se && !nset) {
            se = false;
          }
        }
        parr = poarr || [];
        for (let i in rv) {
          if (rv[i][0] != 'p') {
            rv[i] = module.exports.parse(rv[i], obj || rv, (rs || '') + '[' + module.exports.stringify(i) + ']', parr);
          } else {
            parr.push([rs, i]);
          }
        }
        if (!poarr) {
          for (let i in parr) {
            let trv = module.exports.getarr(rv, parr[i][0]);
            trv[parr[i][1]] = module.exports.parse(trv[parr[i][1]], obj || rv);
          }
        }
        return rv;
      } else if (val[0] == '{') {
        let rv = {};
        if (val == '{}') {
          return rv;
        }
        let ca = ['o'];
        let aind = '';
        let nael = 1;
        let se = false;
        val = val.substring(1, val.length - 1);
        for (let i in val) {
          if (nael > 0) {
            if (nael == 1) {
              let nset = false;
              if (val[i] == '"') {
                if (ca[ca.length-1] != 's') {
                  ca.push('s');
                } else if (se == false) {
                  ca.pop();
                }
              } else if (val[i] == '\\') {
                se = !se;
                if (se == true) {
                  nset = true;
                }
              }
              if (val[i] == ':' && ca[ca.length-1] != 's') {
                nael = 0;
                aind = module.exports.parse(aind);
                rv[aind] = '';
                continue;
              } else {
                aind += val[i];
                if (se && !nset) {
                  se = false;
                }
                continue;
              }
            }
          }
          let nset = false;
          if (val[i] == '[' && ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
            ca.push('a');
          } else if (val[i] == ']') {
            if (ca[ca.length-1] == 'a') {
              ca.pop();
            } else if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              throw new SyntaxError('unexpected token');
            }
          } else if (val[i] == '{' && ca[ca.length-1] != 's') {
            ca.push('o');
          } else if (val[i] == '}') {
            if (ca[ca.length-1] == 'o') {
              ca.pop();
            } else if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              throw new SyntaxError('unexpected token');
            }
          } else if (val[i] == '"') {
            if (ca[ca.length-1] != 's' && ca[ca.length-1] != 'r') {
              ca.push('s');
            } else if (se == false && ca[ca.length-1] != 'r') {
              ca.pop();
            }
          } else if (val[i] == '/') {
            if (ca[ca.length-1] != 'r' && ca[ca.length-1] != 's') {
              ca.push('r');
            } else if (se == false && ca[ca.length-1] != 's') {
              ca.pop();
            }
          } else if (val[i] == '\\' && ca[ca.length-1] == 's') {
            se = !se;
            if (se == true) {
              nset = true;
            }
          } else if (val[i] == ',' && ca.length == 1) {
            nael = 1;
            aind = '';
          }
          if (val[i] != ',' || ca.length != 1) {
            rv[aind] += val[i];
          }
          if (se && !nset) {
            se = false;
          }
        }
        parr = poarr || [];
        for (let i in rv) {
          if (rv[i][0] != 'p') {
            rv[i] = module.exports.parse(rv[i], obj || rv, (rs || '') + '[' + module.exports.stringify(i) + ']', parr);
          } else {
            parr.push([rs, i]);
          }
        }
        if (!poarr) {
          for (let i in parr) {
            let trv = module.exports.getarr(rv, parr[i][0]);
            trv[parr[i][1]] = module.exports.parse(trv[parr[i][1]], obj || rv);
          }
        }
        return rv;
      } else if (val[0] == 'p') {
        return module.exports.getarr(obj, module.exports.parse(val.substr(1, Infinity)));
      }
    }
  },
  gettype: function (obj) {
    let objs = Object.prototype.toString.call(obj);
    if (objs == '[object Array]') {
      return 'array';
    } else if (objs == '[object Map]') {
      return 'map';
    } else if (objs == '[object Set]') {
      return 'set';
    } else {
      return 'object';
    }
  },
  serialize: function (obj, opts, ra) {
    let init = false;
    if (opts === undefined) opts = {};
    if (ra === undefined) {ra = [[], [], []]; init = true;}
    let objs = Object.prototype.toString.call(obj);
    if (obj === undefined) {
      return {type : 'undefined'};
    } else if (obj === null) {
      return {type : 'null'};
    } else if (typeof obj == 'boolean') {
      return {type : 'boolean', value : obj.toString()};
    } else if (typeof obj == 'number') {
      if (Object.is(obj, -0)) {
        return {type : 'number', value : '-0'};
      } else {
        return {type : 'number', value : obj.toString()};
      }
    } else if (typeof obj == 'bigint') {
      return {type : 'bigint', value : obj.toString()};
    } else if (typeof obj == 'string') {
      return {type : 'string', value : obj};
    } else if (typeof obj == 'symbol') {
      ra[0].push('symbol');
      ra[1].push(obj);
      ra[2].push(obj);
    } else if (typeof obj == 'function') {
      return {type : 'function', value : obj.toString()};
    } else if (objs == '[object RegExp]') {
      return {type : 'regexp', value : obj.toString()};
    } else if (objs == '[object Date]') {
      return {type : 'date', value : obj.getTime()};
    } else if (objs == '[object Set]' || objs == '[object Map]') {
      ra[0].push(module.exports.gettype(obj));
      ra[1].push(obj);
      let robj = Array.from(obj);
      ra[2].push(robj);
      for (let i in robj) {
        if (ra[1].indexOf(obj[i]) < 0) {
          let rv = module.exports.serialize(obj[i], opts, ra);
          if (rv) {
            robj[i] = rv;
          } else {
            robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
          }
        } else {
          robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
        }
      }
    } else if (objs == '[object Array]') {
      ra[0].push(module.exports.gettype(obj));
      ra[1].push(obj);
      let robj = [];
      ra[2].push(robj);
      for (let i in obj) {
        if (ra[1].indexOf(obj[i]) < 0) {
          let rv = module.exports.serialize(obj[i], opts, ra);
          if (rv) {
            robj[i] = rv;
          } else {
            robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
          }
        } else {
          robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
        }
      }
    } else if (typeof obj == 'object') {
      ra[0].push(module.exports.gettype(obj));
      ra[1].push(obj);
      let robj = {};
      ra[2].push(robj);
      for (let i in obj) {
        if (ra[1].indexOf(obj[i]) < 0) {
          let rv = module.exports.serialize(obj[i], opts, ra);
          if (rv) {
            robj[i] = rv;
          } else {
            robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
          }
        } else {
          robj[i] = {type : module.exports.gettype(obj[i]), value : obj[i]};
        }
      }
    }
    if (init) {
      for (let i in ra[1]) {
        let rao = ra[2][i];
        for (let j in rao) {
          if (['object', 'array'].indexOf(rao[j].type) > -1) {
            rao[j].value = ra[1].indexOf(rao[j].value);
          }
        }
      }
      ra[1] = ra[2];
      ra.pop();
      return datajs.exjson.stringify(ra);
    }
  },
  deserialize: function (ra, opts) {
    if (opts === undefined) opts = {};
    ra = datajs.exjson.parse(ra);
    for (let i in ra[1]) {
      let rao = ra[1][i];
      for (let j in rao) {
        if (['object', 'array', 'set', 'map', 'symbol'].indexOf(rao[j].type) > -1) {
          rao[j] = ra[1][rao[j].value];
        } else if (rao[j].type == 'undefined') {
          rao[j] = undefined;
        } else if (rao[j].type == 'null') {
          rao[j] = null;
        } else if (rao[j].type == 'boolean') {
          rao[j] = Boolean(rao[j].value);
        } else if (rao[j].type == 'number') {
          rao[j] = Number(rao[j].value);
        } else if (rao[j].type == 'bigint') {
          rao[j] = BigInt(rao[j].value);
        } else if (rao[j].type == 'string') {
          rao[j] = rao[j].value;
        } else if (rao[j].type == 'function') {
          rao[j] = eval(rao[j].value);
        } else if (rao[j].type == 'regexp') {
          let rp = /\/(.*)\/(.*)/.exec(rao[j].value);
          rao[j] = new RegExp(rp[0], rp[1]);
        } else if (rao[j].type == 'date') {
          rao[j] = new Date(rao[j].value);
        }
      }
      if (ra[0][i] == 'set') {
        ra[1][i] = new Set(ra[1][i]);
      } else if (ra[0][1] == 'map') {
        ra[1][i] = new Map(ra[1][i]);
      } else if (ra[0][1] == 'symbol') {
        ra[1][i] = ra[1][ra[1][i]];
      }
    }
    if (opts.debug) {
      return ra;
    } else {
      return ra[1][0];
    }
  }
};