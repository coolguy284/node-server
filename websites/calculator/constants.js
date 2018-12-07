OPS = '!~+-*/%^|&#><=';
//OPSA = '*^|&=';
OPSA = {'!':'=',
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
NUM = '0123456789.';
NUMA = '0123456789.e';
STR = '\'"';
//VAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
//VARN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz_';
VAR = '0123456789!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
VARN = '0123456789n!~+-*/%^|&#><=()[]{}\\/,@;:\'"` \n\r\t';
NONUNARY = ['num', 'bigint', 'string'];
BIGLIMIT = 1000;