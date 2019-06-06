let topics = {};
topics['datajs.debreq'] =
`datajs.debreq has two functions:
  filt - filters the debreq array
  prnt - prints a debreq array to console`;
topics['datajs.debreq.filt'] =
`datajs.debreq.filt(arr, opts) filters arr using opts
  opts:
    regexp: [regex, property] or regex
      filters property of debreq object using regex (defaults to 'url' property)
    func: function(val)
      filters each entry in debreq by checking if function returns true
    ajax: number
      1: include only ajax requests
      2: exclude all ajax requests
      other: no filtering on ajax requests
    ss: number
      1: include only '/s', '/r', and '/a' requests
      2: exclude all '/s', '/r', and '/a' requests
      other: no filtering on '/s', '/r', and '/a' requests`;
topics['datajs.debreq.filt'] =
`datajs.debreq.prnt(arr, opts, cons) prints arr to cons function
  opts:
    modts: convert timestamp from seconds to isostring
  cons: function that can be called to print text, defaults to console.log`;
function help(val) {
  if (!val) return topics.main;
  if (val in topics) return topics[val];
  else return 'Topic not found, call help with no parameters for main help';
}
module.exports = { help, topics };