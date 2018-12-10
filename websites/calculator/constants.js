var OPS = '!~+-*/%^|&#><=';
var OPSA = {'!':'=',
        '~':'=',
        '+':'=',
        '-':'=',
        '*':'*=',
        '/':'=',
        '%':'=',
        '**' : '=',
        '^^' : '=',
        '^':'^=',
        '|':'|=',
        '&':'&=',
        '#':'=',
        '>':'=',
        '<':'=',
        '=':'='};
var OPSKW = ['typeof', 'void', 'del', 'delete'];
var OPSNV = ['=', 'del', 'delete'];
var NUM = '0123456789.';
var NUMA = '0123456789.e';
var STR = '\'"';
var VAR = '0123456789!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
var VARN = '0123456789n!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
var NONUNARY = ['undefined', 'null', 'bool', 'num', 'bigint', 'string'];
var BIGLIMIT = 1000;