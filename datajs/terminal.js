// jshint -W041
/*
\x1b[<seq1>;<seq2>...m
dark - 30-37 40-47
bright - 90-97 100-107
*/
let c8d = [0x000000, 0x800000, 0x008000, 0x808000, 0x000080, 0x800080, 0x008080, 0xc0c0c0];
let c8b = [0x808080, 0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffffff];
let c256 = [
  0x000000, 0x800000, 0x008000, 0x808000, 0x000080, 0x800080, 0x008080, 0xc0c0c0,
  0x808080, 0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffffff,
  0x000000, 0x00005f, 0x000087, 0x0000af, 0x0000d7, 0x0000ff,
  0x005f00, 0x005f5f, 0x005f87, 0x005faf, 0x005fd7, 0x005fff,
  0x008700, 0x00875f, 0x008787, 0x0087af, 0x0087d7, 0x0087ff,
  0x00af00, 0x00af5f, 0x00af87, 0x00afaf, 0x00afd7, 0x00afff,
  0x00d700, 0x00d75f, 0x00d787, 0x00d7af, 0x00d7d7, 0x00d7ff,
  0x00ff00, 0x00ff5f, 0x00ff87, 0x00ffaf, 0x00ffd7, 0x00ffff,
  0x5f0000, 0x5f005f, 0x5f0087, 0x5f00af, 0x5f00d7, 0x5f00ff,
  0x5f5f00, 0x5f5f5f, 0x5f5f87, 0x5f5faf, 0x5f5fd7, 0x5f5fff,
  0x5f8700, 0x5f875f, 0x5f8787, 0x5f87af, 0x5f87d7, 0x5f87ff,
  0x5faf00, 0x5faf5f, 0x5faf87, 0x5fafaf, 0x5fafd7, 0x5fafff,
  0x5fd700, 0x5fd75f, 0x5fd787, 0x5fd7af, 0x5fd7d7, 0x5fd7ff,
  0x5fff00, 0x5fff5f, 0x5fff87, 0x5fffaf, 0x5fffd7, 0x5fffff,
  0x870000, 0x87005f, 0x870087, 0x8700af, 0x8700d7, 0x8700ff,
  0x875f00, 0x875f5f, 0x875f87, 0x875faf, 0x875fd7, 0x875fff,
  0x878700, 0x87875f, 0x878787, 0x8787af, 0x8787d7, 0x8787ff,
  0x87af00, 0x87af5f, 0x87af87, 0x87afaf, 0x87afd7, 0x87afff,
  0x87d700, 0x87d75f, 0x87d787, 0x87d7af, 0x87d7d7, 0x87d7ff,
  0x87ff00, 0x87ff5f, 0x87ff87, 0x87ffaf, 0x87ffd7, 0x87ffff,
  0xaf0000, 0xaf005f, 0xaf0087, 0xaf00af, 0xaf00d7, 0xaf00ff,
  0xaf5f00, 0xaf5f5f, 0xaf5f87, 0xaf5faf, 0xaf5fd7, 0xaf5fff,
  0xaf8700, 0xaf875f, 0xaf8787, 0xaf87af, 0xaf87d7, 0xaf87ff,
  0xafaf00, 0xafaf5f, 0xafaf87, 0xafafaf, 0xafafd7, 0xafafff,
  0xafd700, 0xafd75f, 0xafd787, 0xafd7af, 0xafd7d7, 0xafd7ff,
  0xafff00, 0xafff5f, 0xafff87, 0xafffaf, 0xafffd7, 0xafffff,
  0xd70000, 0xd7005f, 0xd70087, 0xd700af, 0xd700d7, 0xd700ff,
  0xd75f00, 0xd75f5f, 0xd75f87, 0xd75faf, 0xd75fd7, 0xd75fff,
  0xd78700, 0xd7875f, 0xd78787, 0xd787af, 0xd787d7, 0xd787ff,
  0xd7af00, 0xd7af5f, 0xd7af87, 0xd7afaf, 0xd7afd7, 0xd7afff,
  0xd7d700, 0xd7d75f, 0xd7d787, 0xd7d7af, 0xd7d7d7, 0xd7d7ff,
  0xd7ff00, 0xd7ff5f, 0xd7ff87, 0xd7ffaf, 0xd7ffd7, 0xd7ffff,
  0xff0000, 0xff005f, 0xff0087, 0xff00af, 0xff00d7, 0xff00ff,
  0xff5f00, 0xff5f5f, 0xff5f87, 0xff5faf, 0xff5fd7, 0xff5fff,
  0xff8700, 0xff875f, 0xff8787, 0xff87af, 0xff87d7, 0xff87ff,
  0xffaf00, 0xffaf5f, 0xffaf87, 0xffafaf, 0xffafd7, 0xffafff,
  0xffd700, 0xffd75f, 0xffd787, 0xffd7af, 0xffd7d7, 0xffd7ff,
  0xffff00, 0xffff5f, 0xffff87, 0xffffaf, 0xffffd7, 0xffffff,
  0x080808, 0x121212, 0x1c1c1c, 0x262626, 0x303030, 0x3a3a3a, 0x444444, 0x4e4e4e, 0x585858, 0x626262, 0x6c6c6c, 0x767676, 0x808080, 0x8a8a8a, 0x949494, 0x9e9e9e, 0xa8a8a8, 0xb2b2b2, 0xbcbcbc, 0xc6c6c6, 0xd0d0d0, 0xdadada, 0xe4e4e4, 0xeeeeee
];
let StdoutStream = class StdoutStream extends stream.Duplex {
  constructor(term, options) {
    super(options);
    if (!options) options = {};
    this.term = term;
    this.dfgcolor = options.dfgcolor || 0xc0c0c0;
    this.dbgcolor = options.dbgcolor || 0x000000;
    this.fgcolor = this.dfgcolor;
    this.bgcolor = this.dbgcolor;
    this.esc = false;
    this.es = '';
  }
  _write(chunk, enc, done) {
    this.push(chunk);
    chunk = chunk.toString();
    for (let i in chunk) {
      let v = chunk[i];
      if (!this.esc) {
        if (v == '\n') {
          this.term.moveNextLines(1);
        } else if (v == '\r') {
          this.term.setHorPos(1);
        } else if (v == '\t') {
          this.term.printChars(' '.repeat(8 - this.term.x % 8), this.fgcolor * 0x1000000 + this.bgcolor);
        } else if (v == '\b') {
          this.term.backChar();
        } else if (v == '\x1b') {
          this.esc = true;
        } else {
          this.term.printChar(v, this.fgcolor * 0x1000000 + this.bgcolor);
        }
      } else {
        if (v == 'A') {
          this.term.moveUp(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'B') {
          this.term.moveDown(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'C') {
          this.term.moveRight(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'D') {
          this.term.moveLeft(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'E') {
          this.term.moveNextLines(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'F') {
          this.term.movePrevLines(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'G') {
          this.term.setHorPos(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'H' || v == 'f') {
          let pa = this.es.split(';');
          this.term.setPos(pa[1] == '' ? 1 : Number(es), pa[0] == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'J') {
          let cm = this.es == '' ? 0 : Number(es);
          if (cm == 2 || cm == 3) {
            this.term.clearLines(this.term.y - 1, cm);
            this.term.setPos(1, 1);
          } else {
            this.term.clearLine(this.term.y - 1, this.term.x - 1);
            this.term.clearLines(this.term.y - 1, cm);
          }
          this.esc = false;
          this.es = '';
        } else if (v == 'K') {
          this.term.clearLine(this.term.y - 1, this.term.x - 1, this.es == '' ? 0 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'S') {
          this.shiftUp(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'T') {
          this.shiftDown(this.es == '' ? 1 : Number(es));
          this.esc = false;
          this.es = '';
        } else if (v == 'm') {
          let pa = this.es.split(';');
          let sm = 0, rs, gs, bs;
          for (let i in pa) {
            let v = pa[i];
            if (sm == 0) {
              let o7 = '01234567'.indexOf(v[v.length - 1]) > -1;
              if (v == '' || v == '0') {
                this.fgcolor = this.dfgcolor;
                this.bgcolor = this.dbgcolor;
              } else if (v == '7') {
                let temp = this.bgcolor;
                this.bgcolor = this.fgcolor;
                this.fgcolor = temp;
              } else if (v[0] == '3' && o7) {
                this.fgcolor = c8d[v[1]];
              } else if (v[0] == '4' && o7) {
                this.bgcolor = c8d[v[1]];
              } else if (v[0] == '38') {
                sm = 1;
              } else if (v[0] == '48') {
                sm = 2;
              } else if (v[0] == '39') {
                this.fgcolor = this.dfgcolor;
              } else if (v[0] == '49') {
                this.bgcolor = this.dbgcolor;
              } else if (v[0] == '9' && o7) {
                this.fgcolor = c8b[v[1]];
              } else if (v[0] == '1' && v[1] == '0' && o7) {
                this.bgcolor = c8b[v[1]];
              }
            } else if (sm == 1 || sm == 2) {
              if (v == '5') {
                sm += 2;
              } else if (v == '2') {
                sm += 4;
              }
            } else if (sm == 3) {
              this.fgcolor = c256[v];
              sm = 0;
            } else if (sm == 4) {
              this.bgcolor = c256[v];
              sm = 0;
            } else if (sm == 5 || sm == 6) {
              rs = Number(v);
              sm += 2;
            } else if (sm == 7 || sm == 8) {
              gs = Number(v);
              sm += 2;
            } else if (sm == 9) {
              bs = Number(v);
              this.fgcolor = rs * 65536 + gs * 256 + bs;
              sm = 0;
            } else if (sm == 10) {
              bs = Number(v);
              this.bgcolor = rs * 65536 + gs * 256 + bs;
              sm = 0;
            }
          }
          this.esc = false;
          this.es = '';
        } else if (v == 'n') {
          if (this.es == '6') {
            this.term.stdin.write('\x1b[' + this.term.y + ';' + this.term.y + 'R');
          }
        } else if (v == 's') {
          this.sx = this.term.x;
          this.sy = this.term.y;
        } else if (v == 'u') {
          this.term.x = this.sx;
          this.term.y = this.sy;
        } else if ('0123456789'.indexOf(v) > -1 || v == ';') {
          this.es += v;
        } else if (v != '[') {
          this.esc = false;
          this.es = '';
        }
      }
    }
    done();
  }
};
let Terminal = class Terminal {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.chars = new ArrayBuffer(width * height * 2);
    this.cols = new ArrayBuffer(width * height * 6);
    this.charsv = new DataView(this.chars);
    this.colsv = new DataView(this.cols);
    this.stdin = new stream.PassThrough();
    this.stdout = new StdoutStream(this);
    this.stderr = new StdoutStream(this, {dfgcolor:0xff0000});
    this.x = 1;
    this.y = 1;
    this.clear();
  }
  getChar(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height)
      return String.fromCharCode(this.charsv.getUint16(y * this.width * 2 + x * 2));
    else
      return ' ';
  }
  setChar(x, y, val) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height)
      this.charsv.setUint16(y * this.width * 2 + x * 2, val.charCodeAt(0));
  }
  getCol(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      let io = y * this.width * 6 + x * 6;
      return this.colsv.getUint16(io) * 0x100000000 + this.colsv.getUint32(io + 2);
    } else {
      return this.stdout.dfgcolor * 0x1000000 + this.stdout.dbgcolor;
    }
  }
  setCol(x, y, val) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      let io = y * this.width * 6 + x * 6;
      this.colsv.setUint16(io, val / 0x100000000);
      this.colsv.setUint32(io + 2, val & 0xffffffff);
    }
  }
  getLine(y) {
    let bs = '';
    for (let i = 0; i < this.width; i++) bs += this.getChar(i, y);
    return bs;
  }
  setLine(y, val) {
    for (let i = 0; i < this.width; i++) this.setChar(i, y, val[i]);
  }
  getColLine(y) {
    let ba = [];
    for (let i = 0; i < this.width; i++) ba.push(this.getCol(i, y));
    return ba;
  }
  setColLine(y, arr) {
    for (let i = 0; i < this.width; i++) this.setCol(i, y, arr[i]);
  }
  clearLine(y, x, mod) {
    let defcol = this.stdout.dfgcolor * 0x1000000 + this.stdout.dbgcolor;
    if (mod == 0) {
      for (let i = x; i < this.width; i++) {
        this.setChar(i, y, ' ');
        this.setCol(i, y, defcol);
      }
    } else if (mod == 1) {
      for (let i = x; i > -1; i--) {
        this.setChar(i, y, ' ');
        this.setCol(i, y, defcol);
      }
    } else if (mod == 2 || mod == 3) {
      for (let i = 0; i < this.width; i++) {
        this.setChar(i, y, ' ');
        this.setCol(i, y, defcol);
      }
    }
  }
  clearLines(y, mod) {
    let fs = ' '.repeat(this.width);
    let defcol = this.stdout.dfgcolor * 0x1000000 + this.stdout.dbgcolor, defcola;
    for (let i = 0; i < this.width; i++) defcola.push(defcol);
    if (mod == 0) {
      for (let i = y + 1; i < this.width; i++) {
        this.setLine(i, fs);
        this.setColLine(i, defcola);
      }
    } else if (mod == 1) {
      for (let i = y - 1; i > -1; i--) {
        this.setLine(i, fs);
        this.setColLine(i, defcola);
      }
    } else if (mod == 2 || mod == 3) {
      for (let i = 0; i < this.width; i++) {
        this.setLine(i, fs);
        this.setColLine(i, defcola);
      }
    }
  }
  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setChar(x, y, ' ');
        this.setCol(x, y, this.stdout.fgcolor * 0x1000000 + this.stdout.bgcolor);
      }
    }
  }
  setHorPos(x) {
    this.x = x;
    if (this.x < 1) this.x = 1;
    if (this.x > this.width) this.x = this.width;
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
    if (this.x < 1) this.x = 1;
    if (this.x > this.width) this.x = this.width;
    if (this.y < 1) this.y = 1;
    if (this.y > this.height) this.y = this.height;
  }
  moveUp(num) {
    this.y -= num;
    if (this.y < 1) this.y = 1;
  }
  moveDown(num) {
    this.y += num;
    if (this.y > this.height) this.y = this.height;
  }
  moveLeft(num) {
    this.x -= num;
    if (this.x < 1) this.x = 1;
  }
  moveRight(num) {
    this.x += num;
    if (this.x > this.width) this.x = this.width;
  }
  moveNextLines(num) {
    this.y += num;
    this.x = 1;
    if (this.y > this.height) {
      this.shiftUp(this.y - this.height);
      this.y = this.height;
    }
  }
  movePrevLines(num) {
    this.y -= num;
    this.x = 1;
    if (this.y < 1) {
      this.shiftDown(1 - this.y);
      this.y = 1;
    }
  }
  shiftUp(num) {
    for (let i = 0; i < this.height; i++) {
      this.setLine(i, this.getLine(i + num));
      this.setColLine(i, this.getColLine(i + num));
    }
  }
  shiftDown(num) {
    for (let i = this.height - 1; i > -1; i--) {
      this.setLine(i, this.getLine(i - num));
      this.setColLine(i, this.getColLine(i - num));
    }
  }
  backChar() {
    this.x--;
    if (this.x < 1) {
      this.movePrevLines(1);
      this.x = this.width;
    }
    this.setChar(this.x - 1, this.y - 1, ' ');
    this.setCol(this.x - 1, this.y - 1, this.stdout.dfgcolor * 0x1000000 + this.stdout.dbgcolor);
  }
  printChar(val, col) {
    this.setChar(this.x - 1, this.y - 1, val);
    this.setCol(this.x - 1, this.y - 1, col);
    this.x += 1;
    if (this.x > this.width) {
      this.moveNextLines(1);
    }
  }
  printChars(val, col) {
    for (let i in val) this.printChar(val[i], col);
  }
  toConsPart(y) {
    let val = this.getLine(y), arr = this.getColLine(y).map(x => [x >> 24, x & 0xffffff]);
    let bs = '';
    let fgcol = arr[0][0], bgcol = arr[0][1];
    bs += '<span style="color:#' + fgcol.toString(16).padStart(6, '0') + ';background-color:#' + bgcol.toString(16).padStart(6, '0') + ';">';
    for (let i in val) {
      if (fgcol != arr[i][0] || bgcol != arr[i][1]) {
        fgcol = arr[i][0];
        bgcol = arr[i][1];
        bs += '</span><span style="color:#' + fgcol.toString(16).padStart(6, '0') + ';background-color:#' + bgcol.toString(16).padStart(6, '0') + ';">';
      }
      bs += datajs.escapeHTML(val[i]).replace(/&#x20;/g, ' ');
    }
    bs += '</span>';
    return bs;
  }
  toCons() {
    let arr = [];
    for (let i = 0; i < this.height; i++) {
      arr.push(['', this.toConsPart(this.getLine(i), this.getColLine(i))]);
    }
    return arr;
  }
  toText() {
    let bs = '';
    for (let i = 0; i < this.height; i++) bs += this.getLine(i) + '\n';
    return bs;
  }
};
module.exports = { Terminal, StdoutStream, c8d, c8b, c256 };