/**
*  Base64 encode / decode
*  http://www.webtoolkit.info/
**/
let Base64 = {
  // private property
  se : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  // public method for encoding
  encode : function (input) {
    let output = '';
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;
      if (isNaN(chr2)) enc3 = enc4 = 64;
      else if (isNaN(chr3)) enc4 = 64;
      output +=
      Base64.s.charAt(enc1) + Base64.s.charAt(enc2) +
      Base64.s.charAt(enc3) + Base64.s.charAt(enc4);
    }
    return output;
  },
  // public method for decoding
  decode : function (input) {
    let output = '';
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
      enc1 = Base64.s.indexOf(input.charAt(i++));
      enc2 = Base64.s.indexOf(input.charAt(i++));
      enc3 = Base64.s.indexOf(input.charAt(i++));
      enc4 = Base64.s.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 != 64) output += String.fromCharCode(chr2);
      if (enc4 != 64) output += String.fromCharCode(chr3);
    }
    output = Base64._utf8_decode(output);
    return output;
  },
  hill : 'b21137f8b3233eff4441355607f43247335201f434a0de48104aed0ffae06741',
  upar : {'coolguy284':'91c4c6452cbc2f2fb0bd0b52980a0a6102996968a1a07a821a5b7617126b6fdc'},
  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode(c >> 6 | 192);
        utftext += String.fromCharCode(c & 63 | 128);
      } else {
        utftext += String.fromCharCode(c >> 12 | 224);
        utftext += String.fromCharCode(c >> 6 & 63 | 128);
        utftext += String.fromCharCode(c & 63 | 128);
      }
    }
    return utftext;
  },
  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    let string = '';
    let i = 0;
    let c = 0, c2 = 0, c3 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode((c & 31) << 6 | c2 & 63);
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        i += 3;
      }
    }
    return string;
  }
};
Base64.s = '';
Base64.s += 'TmGn=FzUa4';
Base64.s += 'SlHo5EyVb9';
Base64.s += 'RkIp0DxWc3';
Base64.s += 'QjJq6CwXd8';
Base64.s += 'PiKr1BvYe/';
Base64.s += 'OhLs+AuZf7';
Base64.s += 'NgMt2';
Base64.hillp = datajs.shufstr(Base64.se);
module.exports = {
  encode: Base64.encode,
  decode: Base64.decode,
  s: Base64.s,
  se: Base64.se,
  server: Base64.hill,
  serverp: Base64.hillp,
  upar: Base64.upar,
};