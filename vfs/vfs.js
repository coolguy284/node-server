let helperf = require('./helperf.js'),
    errors = require('./errors.js'),
    s = require('./s.js'),
    rawfs = require('./rawfs.js'),
    fscontext = require('./fscontext.js');
let { VFSReadStream, VFSWriteStream } = s;
let { FileSystem } = rawfs;
let { FileSystemContext } = fscontext;

function SecureView(fsc) {
  return {
    get cwd() { return fsc.cwd; },
    set cwd(val) { return fsc.chdir(val); },
    chdir: fsc.chdir.bind(fsc),
    realpathSync: fsc.realpathSync.bind(fsc),
    existsSync: fsc.existsSync.bind(fsc),
    statSync: fsc.statSync.bind(fsc),
    lstatSync: fsc.lstatSync.bind(fsc),
    chmodSync: fsc.chmodSync.bind(fsc),
    lchmodSync: fsc.lchmodSync.bind(fsc),
    chownSync: fsc.chownSync.bind(fsc),
    lchownSync: fsc.lchownSync.bind(fsc),
    chattrSync: fsc.chattrSync.bind(fsc),
    lchattrSync: fsc.lchattrSync.bind(fsc),
    utimesSync: fsc.utimesSync.bind(fsc),
    readFileSync: fsc.readFileSync.bind(fsc),
    writeFileSync: fsc.writeFileSync.bind(fsc),
    appendFileSync: fsc.appendFileSync.bind(fsc),
    truncateSync: fsc.truncateSync.bind(fsc),
    createReadStream: fsc.createReadStream.bind(fsc),
    createWriteStream: fsc.createWriteStream.bind(fsc),
    linkSync: fsc.linkSync.bind(fsc),
    unlinkSync: fsc.unlinkSync.bind(fsc),
    copyFileSync: fsc.copyFileSync.bind(fsc),
    readlinkSync: fsc.readlinkSync.bind(fsc),
    symlinkSync: fsc.symlinkSync.bind(fsc),
    readdirSync: fsc.readdirSync.bind(fsc),
    mkdirSync: fsc.mkdirSync.bind(fsc),
    renameSync: fsc.renameSync.bind(fsc),
    rmdirSync: fsc.rmdirSync.bind(fsc),
    realpath: fsc.realpath.bind(fsc),
    stat: fsc.stat.bind(fsc),
    lstat: fsc.lstat.bind(fsc),
    chmod: fsc.chmod.bind(fsc),
    lchmod: fsc.lchmod.bind(fsc),
    chown: fsc.chown.bind(fsc),
    lchown: fsc.lchown.bind(fsc),
    utimes: fsc.utimes.bind(fsc),
    readFile: fsc.readFile.bind(fsc),
    writeFile: fsc.writeFile.bind(fsc),
    appendFile: fsc.appendFile.bind(fsc),
    truncate: fsc.truncate.bind(fsc),
    link: fsc.link.bind(fsc),
    unlink: fsc.unlink.bind(fsc),
    copyFile: fsc.copyFile.bind(fsc),
    readlink: fsc.readlink.bind(fsc),
    symlink: fsc.symlink.bind(fsc),
    readdir: fsc.readdir.bind(fsc),
    mkdir: fsc.mkdir.bind(fsc),
    rename: fsc.rename.bind(fsc),
    rmdir: fsc.rmdir.bind(fsc),
    openSync: fsc.openSync.bind(fsc),
    closeSync: fsc.closeSync.bind(fsc),
    open: fsc.open.bind(fsc),
    close: fsc.close.bind(fsc),
    fstatSync: fsc.fstatSync.bind(fsc),
    fchmodSync: fsc.fchmodSync.bind(fsc),
    fchownSync: fsc.fchownSync.bind(fsc),
    futimesSync: fsc.futimesSync.bind(fsc),
    ftruncateSync: fsc.ftruncateSync.bind(fsc),
    fstat: fsc.fstat.bind(fsc),
    fchmod: fsc.fchmod.bind(fsc),
    fchown: fsc.fchown.bind(fsc),
    futimes: fsc.futimes.bind(fsc),
    ftruncate: fsc.ftruncate.bind(fsc),
    fdatasyncSync: fsc.fdatasyncSync.bind(fsc),
    fsyncSync: fsc.fsyncSync.bind(fsc),
    fdatasync: fsc.fdatasync.bind(fsc),
    fsync: fsc.fsync.bind(fsc),
  };
}

module.exports = {
  helperf, errors, VFSReadStream, VFSWriteStream,
  FileSystem, FileSystemContext, SecureView,
};
exports = module.exports;

let test = require('./test.js');

let { rfs, rfs2, fsv, fsv2 } = test.makeTestFS();

exports.rfs = rfs;
exports.rfs2 = rfs2;
exports.fs = fsv;
exports.fs2 = fsv2;