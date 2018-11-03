todo = [
  'add anonymous herelist to bsc',
  '255 503 509',
];
for (var i in todo) {
  tdl.innerHTML += '<li>' + todo[i] + '</li>';
}
if (todo.length === 0) {
  tdl.innerHTML += '</h3>There\'s nothing here. &nbsp;Go do something else with your life.</h3>';
}