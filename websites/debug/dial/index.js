n = 0;
nr = 0;
function updnum() {
  n = Number(vinp.value) * 100000 % 100000;
  vinpn.value = n;
}
function updnumr() {
  nr = Math.pow(10, (Number(vinpr.value) * 6 - 3)) - 0.001;
}
function updnums() {
  n = Number(vinpn.value);
}
function dline(x, y, a, l) {
  p.line(x, y, Math.cos(a) * l + x, Math.sin(a) * l + y);
}
function dellipse(x, y, a, l) {
  p.ellipse(x + Math.cos(a) * l, y + Math.sin(a) * l, 10, 10);
}
p = new Processing(mycanvas, function (p) {
  p.size(400, 400, p.P2D);
  p.textAlign(3, 3);
  p.textSize(72);
  p.draw = function () {
    p.background(0);
    p.fill(255);
    v = Math.floor(n).toString().padStart(5, '0');
    for (var i = 0; i < v.length; i++) {
      p.text(v[i], 200 + (i - v.length / 2 + 0.5) * 36, 40);
    }
    p.strokeWeight(10);
    p.stroke(255);
    p.fill(0);
    p.ellipse(200, 235, 300, 300);
    p.noStroke();
    p.fill(255);
    p.ellipse(200, 235, 20, 20);
    n = (n + nr) % 100000;
    if (document.activeElement != vinpn.value) {
      //vinpn.value = n;
    }
    p.noStroke();
    dellipse(200, 235, n * Math.PI * 2 / 100000 - Math.PI / 2, 17);
    dellipse(200, 235, n * Math.PI * 2 / 10000 - Math.PI / 2, 30);
    p.stroke(255);
    p.strokeWeight(7);
    dline(200, 235, n * Math.PI * 2 / 1000 - Math.PI / 2, 120);
    p.strokeWeight(3);
    dline(200, 235, n * Math.PI * 2 / 100 - Math.PI / 2, 130);
    p.stroke(255, 0, 0);
    p.strokeWeight(2);
    dline(200, 235, n * Math.PI * 2 / 10 - Math.PI / 2, 130);
    vinp.value = n / 100000;
  };
});