var hacks = [
  //1 - Time for each section
  //2 - Number of sections
  //3 - probability of adjusting progress bar in section
  //4 - progress bar start
  //5 - progress bar end
  //6 - random halt probability
  //name                            1    2    3    4   5     6
  ['retrieving username',          30,  50, 0.5,   0, 10,  0.03],
  ['retrieving password',          10, 150, 0.33, 10, 22,  0.02],
  ['retrieving and saving account info',           5, 200, 0.4,  22, 40,  0.03],
  ['messing up account',            7, 200, 0.2,  40, 55,  0.04],
  ['acquiescing bone marrow',      45,  70, 1,    55, 70,  0.02],
  ['executing hacking javacode',   15,  70, 0.5,  70, 85,  0.05],
  ['hacking dishwasher',            8, 200, 0.05, 85, 93,  0.01],
  ['cleaning up traces',            7, 150, 0.2, 93, 100, 0.03],
  ['complete',                      0,   0, 1,   100, 100, 0],
];
percs = [[16, 1000], [33, 2000], [38, 2500], [42, 2750], [47, 2900], [50, 3000], [75, 4000], [80, 4250], [83, 4500], [95, 5000], [100, 6000]];
var hacking = 0, v;
function Hack() {
  v = 0;
  while (!v) {
    v = confirm('Are you sure you want to initiate the hacking?');
  }
  init.style = 'display:none;';
  hac.style = '';
}
function sleep(tim) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, tim);
  });
}
function str(val) {
  var s = String(Math.floor(val * 10) / 10);
  if (s == '100') return s;
  else if (s.indexOf('.') < 0) return s + '.0';
  else return s;
}
async function Dot3() {
  await sleep(500);
  for (var i = 0; i < 3; i++) {
    hacktxt.innerHTML += '.';
    await sleep(500);
  }
}
async function Hack2() {
  if (hacking) {
    alert('You are already hacking!');
    return;
  }
  hacking = 1;
  hackinp.disabled = true;
  hacktxt.innerHTML += '<br>Initiating Hack Software';
  await Dot3();
  hacktxt.innerHTML += '<br>Contacting Hacking Server';
  await Dot3();
  hacktxt.innerHTML += '<br>connected';
  await sleep(500);
  hacktxt.innerHTML += '<br><span style = "color:red;">Warning! Hacking has begun</span><progress value = 0 max = 100 id = "prog" style = "width:100%;height:20px;"></progress><br><span id = "ptext">starting</span> (<span id = "pval">0.0</span>%)';
  await sleep(500);
  for (var i in hacks) {
    var o = hacks[i];
    var d = o[5] - o[4];
    ptext.innerHTML = o[0];
    prog.value = o[4];
    pval.innerHTML = str(Number(prog.value));
    for (var i = 0; i < o[2]; i++) {
      var v = o[4] + (i / o[2]) * d;
      if (Math.random() < o[3]) {
        prog.value = v;
        pval.innerHTML = str(v);
      }
      if (Math.random() < o[6]) {
        await sleep(1000);
      }
      await sleep(o[1]);
    }
  }
  await sleep(500);
  hacktxt.innerHTML += '<br>Retrieving Hacked Data';
  await Dot3();
  hacktxt.innerHTML += '<br>Hack Results:';
  await sleep(200);
  hacktxt.innerHTML += '<br><span id = "hackres">-</span>';
  await sleep(100);
  hackres.innerHTML = '/';
  await sleep(100);
  hackres.innerHTML = '|';
  await sleep(100);
  hackres.innerHTML = '\\';
  await sleep(100);
  hackres.innerHTML = '-';
  await sleep(100);
  hackres.innerHTML = '<p id = "hackres2" style = "background:#afafaf;margin:7px;width:calc(100%-14px);word-break:break-all;"></p>';
  var hmsg = 'VGhpcyBpcyB0aGUgbmV3IGFuZCBpbXByb3ZlZCBTdXBlciBIYWNrZXIgMjAwMCwgd2hpY2ggaGFzIGEgYmV0dGVyIHByb2dyZXNzIGJhciBhbmQgbW9yZSBpdGVtcy4KSGVyZSBpcyB0aGUgbWVzc2FnZSBmcm9tIHRoZSBvbGRlciBTdXBlciBIYWNrZXIgMjAwMDoKSWYgeW91IGFyZSByZWFkaW5nIHRoaXMgbm93LCB5b3UgcHJvYmFibHkgZGlkbid0IGJlbGlldmUgdGhhdCB5b3Ugd2VyZSBoYWNraW5nIGFueXdheS4gIEJ1dCBqdXN0IHNvIHlvdSBrbm93LCBJIHdhcyBib3JlZCB3aGVuIEkgY29kZWQgdGhpcyBhbmQgSSB3YW50ZWQgdG8gbWFrZSBhIHJlYWxseSBzaWxseSBwcm9ncmFtIHRoYXQgbm9uIHRlY2gtc2F2dnkgcGVvcGxlIHdvdWxkIGJlbGlldmUu';
  for (var i = 0; i < hmsg.length; i++) {
    hackres2.innerHTML += hmsg[i];
    await sleep(5);
  }
  hacking = 2;
}
onbeforeunload = function() {
  if (hacking == 1) return 'You are in the middle of hacking, are you sure you want to leave?';
}
hackinp.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    Hack2();
  }
});