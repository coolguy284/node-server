hacks = [['getting username', 0], ['getting password', 1000], ['saving account info', 2000], ['messing up account', 3000], ['acquiescing bone marrow', 4500], ['complete', 6000]];
percs = [[16, 1000], [33, 2000], [38, 2500], [42, 2750], [47, 2900], [50, 3000], [75, 4000], [80, 4250], [83, 4500], [95, 5000], [100, 6000]];
hacking = false;
function DA() {
  idd.innerHTML += '.';
}
function Hack() {
  v = confirm('Are you sure you want to initiate the hacking?');
  while (!v) {
    v = confirm('Are you sure you want to initiate the hacking?');
  }
  hi.style = '';
  idd.innerHTML = '';
}
function Hack2() {
  if (hacking) {
    alert('You are already hacking!');
    return;
  }
  hacking = true;
  inpute.disabled = true;
  idd.innerHTML += '<br>Initiating Hack Software';
  setTimeout(DA, 500);
  setTimeout(DA, 1000);
  setTimeout(DA, 1500);
  setTimeout(Hack3, 2000);
}
function Hack3() {
  idd.innerHTML += '<br>Contacting Hacking Server';
  setTimeout(DA, 500);
  setTimeout(DA, 1000);
  setTimeout(DA, 1500);
  setTimeout(Hack4, 2000);
}
function Hack4() {
  idd.innerHTML += '<br>Connected';
  setTimeout(Hack5, 500);
}
function Hack5() {
  idd.innerHTML += '<br><span style = "color:red;">Warning! Hacking has begun</span><progress value = 0 max = 100 id = "prog" style = "width:100%;height:20px;"></progress>';
  setTimeout(Hack6, 500);
}
function Hack6() {
  idd.innerHTML += '<br><span id = "htext"></span>';
  for (var i in hacks) {
    setTimeout('htext.innerHTML="'+hacks[i][0]+'";', hacks[i][1]);
  }
  for (var i in percs) {
    setTimeout('prog.value='+percs[i][0]+';', percs[i][1]);
  }
  setTimeout(Hack7, hacks[hacks.length-1][1]+500);
}
function Hack7() {
  idd.innerHTML += '<br>Retreving Hacked Data';
  setTimeout(DA, 500);
  setTimeout(DA, 1000);
  setTimeout(DA, 1500);
  setTimeout(Hack8, 2000);
}
function Hack8() {
  idd.innerHTML += '<br>Hack Results:<br><p style = "background:#afafaf;margin:7px;width:100%;word-break:break-all;">SWYgeW91IGFyZSByZWFkaW5nIHRoaXMgbm93LCB5b3UgcHJvYmFibHkgZGlkbid0IGJlbGlldmUgdGhhdCB5b3Ugd2VyZSBoYWNraW5nIGFueXdheS4gIEJ1dCBqdXN0IHNvIHlvdSBrbm93LCBJIHdhcyBib3JlZCB3aGVuIEkgY29kZWQgdGhpcyBhbmQgSSB3YW50ZWQgdG8gbWFrZSBhIHJlYWxseSBzaWxseSBwcm9ncmFtIHRoYXQgbm9uIHRlY2gtc2F2dnkgcGVvcGxlIHdvdWxkIGJlbGlldmUu</p>';
}
inpute.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    Hack2();
  }
});