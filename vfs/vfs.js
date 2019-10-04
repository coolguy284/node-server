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

let { rfs, rfs2, fsv, fsv2 } = test.makeTestFS();

exports.rfs = rfs;
exports.rfs2 = rfs2;
exports.fs = fsv;
exports.fs2 = fsv2;