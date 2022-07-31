function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}
function modf(val) {
  return pad(Math.floor(val / 3600), 2) + ':' + pad(Math.floor(val / 60 % 60), 2) + ':' + pad(val % 60, 2) + ' (' + val + ' seconds)';
}
function basicfunc() {
  basiccode.innerHTML = navigator.appCodeName;
  basicname.innerHTML = navigator.appName;
  basicvers.innerHTML = navigator.appVersion;
  basiclang.innerHTML = navigator.language;
  basicplat.innerHTML = navigator.platform;
  basicprod.innerHTML = navigator.product;
  basicusera.innerHTML = navigator.userAgent;
  basiconline.innerHTML = navigator.onLine;
  basicurl.innerHTML = location;
  basiccookie.innerHTML = navigator.cookieEnabled;
  basicjava.innerHTML = navigator.javaEnabled();
}
function battfunc() {
  try {
    navigator.getBattery().then(function(battery) {
      battcharging.innerHTML = battery.charging;
      batt100.innerHTML = modf(battery.chargingTime);
      batt0.innerHTML = modf(battery.dischargingTime);
      battlevel.innerHTML = battery.level * 100 + '%';
      /*battery.addEventListener('chargingchange', function() {
        battcharging.innerHTML = battery.charging;
      });
      battery.addEventListener('chargingtimechange', function() {
        batt100.innerHTML = battery.chargingTime;
      });
      battery.addEventListener('dischargingtimechange', function() {
        batt0.innerHTML = battery.dischargingTIme;
      });
      battery.addEventListener('levelchange', function() {
        battlevel.innerHTML = battery.level;
      });*/
    });
  } catch (e) {
    batterr.innerHTML = 'Error! Unable to acquire battery data.<br>';
    battcharging.innerHTML = 'N/A';
    batt100.innerHTML = 'N/A';
    batt0.innerHTML = 'N/A';
    battlevel.innerHTML = 'N/A';
    clearInterval(bfint);
  }
}
function geofunc() {
  navigator.geolocation.getCurrentPosition(function(position) {
    geostat.innerHTML = 'Success! [' + new Date().toISOString() + ']';
    geolat.innerHTML = position.coords.latitude;
    geolon.innerHTML = position.coords.longitude;
    geoalt.innerHTML = position.coords.altitude;
    geohead.innerHTML = position.coords.heading;
    geospeed.innerHTML = position.coords.speed;
    geoacc.innerHTML = position.coords.accuracy;
    geoaacc.innerHTML = position.coords.altitudeAccuracy;
  }, function() {
    geostat.innerHTML = 'Faliure! GPS Position Unavailable [' + new Date().toISOString() + ']';
    geolat.innerHTML = 'null';
    geolon.innerHTML = 'null';
    geoalt.innerHTML = 'null';
    geohead.innerHTML = 'null';
    geospeed.innerHTML = 'null';
    geoacc.innerHTML = 'null';
    geoaacc.innerHTML = 'null';
  }, {enableHighAccuracy:true,timeout:30000,maximumAge:0});
}
function sleep(ms) {
  return new Promise((resolve) => {setTimeout(resolve, ms);});
}
function varexpf(e) {
  if (e.target.open) {
    let vn = Base64.decode(e.target.id.substr(7, Infinity));
    let obj = eval(vn);
    let kl = Object.getOwnPropertyNames(obj);
    let thtml = e.target.innerHTML + '<span style = "position:relative;left:10px;">' + (obj + '') + '</span>';
    for (var i in kl) {
      let idstr = 'varexp-' + Base64.encode(vn + '["' + kl[i] + '"]');
      thtml += '<details style = "position:relative;left:10px;" id = "' + idstr + '"><summary>' + kl[i] + '</summary></details>';
      setTimeout(function(idst){document.getElementById(idst).addEventListener('toggle', varexpf)}, 0, idstr);
    }
    e.target.innerHTML = thtml;
  } else {
    let htstr = Base64.decode(e.target.id.substr(7, Infinity)).split('["').slice(-1)[0];
    if (htstr != 'window') {
      e.target.innerHTML = '<summary>' + htstr.substr(0, htstr.length-2) + '</summary>';
    } else {
      e.target.innerHTML = '<summary>window</summary>';
    }
  }
}
onload = function() {
  setTimeout(basicfunc, 0);
  setTimeout(battfunc, 0);
  bfint = setInterval(battfunc, 1000);
  window.addEventListener('devicelight', function(e) {
    illlux.innerHTML = e.value;
  });
  setTimeout(geofunc, 0);
  window.addEventListener('deviceorientation', function(e) {
    if (!parseInt(accround.value)) {
      accalp.innerHTML = e.alpha.toFixed(3);
      accbet.innerHTML = e.beta.toFixed(3);
      accgam.innerHTML = e.gamma.toFixed(3);
    } else {
      accalp.innerHTML = e.alpha;
      accbet.innerHTML = e.beta;
      accgam.innerHTML = e.gamma;
    }
  });
  window.addEventListener('devicemotion', function(e) {
    if (!parseInt(accround.value)) {
      accx.innerHTML = e.acceleration.x.toFixed(3).padStart(6);
      accy.innerHTML = e.acceleration.y.toFixed(3).padStart(6);
      accz.innerHTML = e.acceleration.z.toFixed(3).padStart(6);
      accxg.innerHTML = e.accelerationIncludingGravity.x.toFixed(3).padStart(6);
      accyg.innerHTML = e.accelerationIncludingGravity.y.toFixed(3).padStart(6);
      acczg.innerHTML = e.accelerationIncludingGravity.z.toFixed(3).padStart(6);
      accg.innerHTML = (Math.sqrt(e.accelerationIncludingGravity.x**2 + e.accelerationIncludingGravity.y**2 + e.accelerationIncludingGravity.z**2) / 9.81).toFixed(3);
      accms.innerHTML = Math.sqrt(e.accelerationIncludingGravity.x**2 + e.accelerationIncludingGravity.y**2 + e.accelerationIncludingGravity.z**2).toFixed(3);
    } else {
      accx.innerHTML = e.acceleration.x;
      accy.innerHTML = e.acceleration.y;
      accz.innerHTML = e.acceleration.z;
      accxg.innerHTML = e.accelerationIncludingGravity.x;
      accyg.innerHTML = e.accelerationIncludingGravity.y;
      acczg.innerHTML = e.accelerationIncludingGravity.z;
      accg.innerHTML = (Math.sqrt(e.accelerationIncludingGravity.x**2 + e.accelerationIncludingGravity.y**2 + e.accelerationIncludingGravity.z**2) / 9.81);
      accms.innerHTML = Math.sqrt(e.accelerationIncludingGravity.x**2 + e.accelerationIncludingGravity.y**2 + e.accelerationIncludingGravity.z**2);
    }
  });
  document.getElementById('varexp-d2luZG93').addEventListener('toggle', varexpf);
  //document.getElementById('varexp2').appendChild(document.getElementById('varexp-d2luZG93'));
}