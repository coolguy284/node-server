var PARR = {p: ')', a: ']', o: '}'};
var OPS = '.!~+-*/%^|&#><=';
var OPSA = {'!':'=', '~':'=',
        '+':'=', '-':'=',
        '*':'*=', '/':'=', '%':'=',
        '**' : '=', '^^' : '=', '^':'^=',
        '|':'|=', '&':'&=', '#':'=',
        '>>': '=', '<<': '=',
        '>':'>=', '<':'<=', '=':'='};
var OPSKW = ['typeof', 'void', 'del', 'delete'];
var OPSNVF = ['=', '+=', '-=', '*=', '/=', '%=', '**=', '^=', '>>=', '<<=', '|=', '&=', '#='];
var OPSNVB = ['del', 'delete'];
var NUM = '0123456789';
var NUMA = '0123456789.e';
var STR = '\'"';
var VAR = '0123456789!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
var VARN = '0123456789n!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
var NONUNARY = ['undefined', 'null', 'bool', 'number', 'bigint', 'string', 'array', 'object', 'matrix'];
var BIGLIMIT = {digit: 1000, strlen: 100000};
var VARRESCLS = function (arr, i) {
  return !(arr[i - 1] && arr[i - 1].type == 'op' && arr[i - 1].val == '.') && ((arr[i + 1] && arr[i + 1].type == 'op' && arr[i + 1].val == '.') || (!(arr[i - 1] && arr[i - 1].type == 'op' && OPSNVB.indexOf(arr[i - 1].val) > -1) && !(arr[i + 1] && arr[i + 1].type == 'op' && OPSNVF.indexOf(arr[i + 1].val) > -1)));
};
var PROPACCCLS = function (arr, i) {
  return (arr[i + 1] && arr[i + 1].type == 'op' && arr[i + 1].val == '.') && (!((arr[i - 1] && arr[i - 1].type == 'op' && OPSNVB.indexOf(arr[i - 1].val) > -1) || (arr[i + 3] && arr[i + 3].type == 'op' && OPSNVF.indexOf(arr[i + 3].val) > -1)) || (arr[i + 3] && arr[i + 3].type == 'op' && arr[i + 3].val == '.'));
};