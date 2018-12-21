var pbtn = document.createElement('button');
pbtn.innerHTML = '<img src = "https://upload.wikimedia.org/wikipedia/commons/c/ca/Ic_palette_48px.svg" style = "width:20px;height:20px;">';
pbtn.style = 'position:fixed;bottom:5px;right:5px;';
pbtn.onclick = 'PalleteTogg();';
document.body.appendChild(pbtn);
var pallte = document.createElement('div');
pallte.style = 'position:fixed;left:50%;top:50%;margin-left:-200px;margin-top:-100px;width:400px;height:200px;';
pallte.innerHTML = `
  ell
`;
function PalleteTogg() {
  if (pallte.style.cssText == 'display: none;') {
    pallte.style = 'position:fixed;left:50%;top:50%;margin-left:-200px;margin-top:-100px;width:400px;height:200px;';
  } else {
    pallte.stype = 'display:none;';
  }
}