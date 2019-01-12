var pds;
if (location.href.split('/').slice(-1)[0] == 'calculator.html') pds = '..';
else pds = '../..';
hdtog.src = pds + '/images/help.png';
sdtog.src = pds + '/images/settings.png';
hdcls.src = stcls.src = pds + '/images/close.png';