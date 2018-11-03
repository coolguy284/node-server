todo = [];
for (var i in todo) {
  tdl.innerHTML += '<li>' + todo[i] + '</li>';
}
if (todo.length === 0) {
  tdl.innerHTML += '</h3>There\'s nothing here. &nbsp;This website will probably still get updated though.</h3>';
}