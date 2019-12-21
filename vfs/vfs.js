let helperf = require('./helperf.js'),
    errors = require('./errors.js'),
    s = require('./s.js'),
    rawfs = require('./rawfs.js'),
    fscontext = require('./fscontext.js');
let { VFSReadStream, VFSWriteStream } = s;
let { FileSystem } = rawfs;
let { FileSystemContext } = fscontext;

let SecureView = require('./secureview.js');

module.exports = {
  helperf, errors, VFSReadStream, VFSWriteStream,
  FileSystem, FileSystemContext, SecureView,
};
exports = module.exports;

let test = require('./test.js');

exports.test = test;

let obj = test.makeTestFS();
exports.fs = obj.fs;
exports.fs2 = obj.fs2;
exports.rfs = obj.rfs;
exports.rfs2 = obj.rfs2;