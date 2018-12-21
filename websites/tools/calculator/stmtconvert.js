function ToStmtArr(val) {
  let p = {ra: [], bs: '', exp: false, com: 0};
  for (let i in val) {
    if (p.exp == false) {
      if (p.com == 0) {
        if (val[i] == '\\') {
          p.exp = true;
        } else if (val[i] == '/') {
          p.com == 1;
        } else if (val[i] == '\n' || val[i] == '\r') {
          p.ra.push(ToExpArr(p.bs));
          p.bs = '';
        } else {
          p.bs += val[i];
        }
      } else if (p.com == 1) {
        if (val[i] == '/') {
          p.com = 2;
          p.ra.push(ToExpArr(p.bs));
          p.bs = '';
        } else if (val[i] == '*') {
          p.com = 3;
        } else if (val[i] == '\n' || val[i] == '\r') {
          p.com = 0;
          p.bs += '/';
          p.ra.push(ToExpArr(p.bs));
          p.bs = '';
        } else {
          p.com = 0;
          p.bs += '/';
        }
      } else if (p.com == 2) {
        if (val[i] == '/n' || val[i] == '/r') {
          p.com = 0;
        }
      } else if (p.com == 3) {
        if (val[i] == '*') {
          p.com = 4;
        }
      } else if (p.com == 4) {
        if (val[i] == '/') {
          p.com = 0;
        } else {
          p.com = 3;
        }
      }
    } else {
      if (val[i] != '\n' && val[i] != '\r') {
        p.esc = false;
      } else {
        p.bs += val[i];
        p.esc = false;
      }
    }
  }
  if (p.bs != '') p.ra.push(ToExpArr(p.bs));
  return p.ra;
}