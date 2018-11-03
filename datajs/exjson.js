// jshint maxerr:1000 -W041 -W061 -W122
//e={};e.a='b';e.c={'d':'e'};e.c.z='xyz';e.d=e.c;e.e=e.c.z;e.y={'t':e.c.z};e.f=e;e.g={'h':e};e.g.l=e.g
//e=[];e.push('b');e.push(['e']);e[1].push('xyz');e.push(e[1]);e.push(e[1][1]);e.push([e[1][1]]);e.push(e);e.push([e]);e[6].push(e[6])
module.exports = {
  'getarr' : function (obj, rs) {
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
          obj = obj[module.exports.parse(bs + '"')];
          bs = '';
        } else {
          bs += rs[i];
        }
      } else {
        if (rs[i] == '[') {
          bds = true;
        }
      }
    }
    return obj;
  },
  'parse' : function (val, obj, rs, poarr) {
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
          return BigNum(val);
        } else {
          return Number(val);
        }
      } else if (val[0] == '"') {
        return JSON.parse(val);
      } else if (val[0] == 's' && val[1] == '"') {
        return Symbol(JSON.parse(val.substr(1, Infinity)));
      } else if (val[0] == 'f') {
        return eval('(' + val + ')');
      } else if (val[0] == '/') {
        let esc = false, ep = false, rs = '', rs2 = '';
        val = val.substr(1, Infinity);
        for (let i in val) {
          if (!ep) {
            if (val[i] == '\\' && esc == false) {
              esc = true;
              rs += val[i];
            } else if (val[i] == '\\' && esc == true) {
              esc = false;
              rs += val[i];
            } else if (val[i] == '/' && esc == false) {
              ep = true;
            } else {
              rs += val[i];
            }
          } else {
            rs2 += val[i];
          }
        }
        return RegExp(rs, rs2);
      } else if (val[0] == 'd') {
        return new Date(module.exports.parse(val.substr(1, Infinity)));
      } else if (val[0] == 'm') {
        return new Map(module.exports.parse(val.substr(1, Infinity)));
      } else if (val[0] == 's' && val[1] == 't') {
        return new Set(module.exports.parse(val.substr(1, Infinity)));
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
  'stringify' : function (val, opts, obja, rs) {
    if (opts === undefined) {
      opts = {};
    }
    let objs = Object.prototype.toString.call(val);
    if (val === undefined) {
      return 'undefined';
    } else if (val === null) {
      return 'null';
    } else if (typeof val == 'boolean') {
      return val.toString();
    } else if (typeof val == 'number') {
      return val.toString();
    } else if (typeof val == 'bignum') {
      return val.toString();
    } else if (typeof val == 'string') {
      return JSON.stringify(val);
    } else if (typeof val == 'symbol') {
      let ss = val.toString();
      return 's' + module.exports.stringify(ss.substring(7, ss.length - 1));
    } else if (typeof val == 'function') {
      return val.toString();
    } else if (objs == '[object RegExp]') {
      return val.toString();
    } else if (objs == '[object Date]') {
      return 'd' + module.exports.stringify(val.toISOString());
    } else if (objs == '[object Map]') {
      return 'm' + module.exports.stringify(Array.from(val));
    } else if (objs == '[object Set]') {
      return 'st' + module.exports.stringify(Array.from(val));
    } else if (Object.prototype.toString.call(val) == '[object Array]') {
      if (!obja) {
        obja = [[val], ['']];
      }
      if (!rs) {
        rs = '';
      }
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
      let pn = Object.getOwnPropertyNames(val);
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
};