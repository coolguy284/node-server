var atm = {
  earth_rad: 6356.766,
  grav: 9.80665,
  basepress: 101325,
  stantemp: 288.15,
  molar: 0.0289644,
  eal: 0.0065,
  eac: 1007,
  ear: 8.31447,
  eatmp1: function (height) {
    return atm.basepress * Math.pow(1 - (atm.eal * height / atm.stantemp), atm.eae);
  },
  eatmp2: function (height) {
    return atm.basepress * Math.exp(-atm.grav * atm.molar * height / atm.eaf);
  },
  eatmp3: function (height) {
    return atm.basepress * Math.pow(2, -0.0000555 * height);
  },
  getstanpress: function (height) {
    // Returns result in Pascals 85997.89842529779
    geopot_height = atm.getgeopot(height / 1000);
    temp = atm.getstantemp(geopot_height);
    if (geopot_height <= 11) {
      return 101325 * Math.pow(288.15 / temp, -5.255877);
    } else if (geopot_height <= 20) {
      return 22632.06 * Math.exp(-0.1577 * (geopot_height - 11));
    } else if (geopot_height <= 32) {
      return 5474.889 * Math.pow(216.65 / temp, 34.16319);
    } else if (geopot_height <= 47) {
      return 868.0187 * Math.pow(228.65 / temp, 12.2011);
    } else if (geopot_height <= 51) {
      return 110.9063 * Math.exp(-0.1262 * (geopot_height - 47));
    } else if (geopot_height <= 71) {
      return 66.93887 * Math.pow(270.65 / temp, -12.2011);
    } else if (geopot_height <= 84.85) {
      return 3.956420 * Math.pow(214.65 / temp, -17.0816);
    } else {
      return atm.eatmp2(height) / 10.126001528241744;
    }
  },
  getstantemp: function (geopot_height) {
    if (geopot_height <= 11) {		 // Troposphere
      return 288.15 - (6.5 * geopot_height);
    } else if (geopot_height <= 20) {// Stratosphere starts
      return 216.65;
    } else if (geopot_height <= 32) {
      return 196.65 + geopot_height;
    } else if (geopot_height <= 47) {
      return 228.65 + 2.8 * (geopot_height - 32);
    } else if (geopot_height <= 51) {// Mesosphere starts
      return 270.65;
    } else if (geopot_height <= 71) {
      return 270.65 - 2.8 * (geopot_height - 51);
    } else if (geopot_height <= 84.85) {
      return 214.65 - 2 * (geopot_height - 71);
    } else {
      return geopot_height;
    }
  },
  getgeopot: function (height) {
    return atm.earth_rad * height / (atm.earth_rad + height);
  }
};
atm.eae = ((atm.grav * atm.molar) / (atm.ear * atm.eal));
atm.eaf = atm.ear * atm.stantemp;