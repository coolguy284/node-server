let helperf = require('./helperf.js');
let rawfs = require('./rawfs.js');
let FileSystem = rawfs.FileSystem;
rawfs.init(helperf);
let fscontext = require('./fscontext.js');
let FileSystemContext = fscontext.FileSystemContext;
fscontext.init(helperf);
function SecureView(view) {
  return {
    get cwd() {
      return view.cwd;
    },
    set cwd(val) {
      return view.chdir(val);
    },
    chdir: view.chdir.bind(view),
    existsSync: view.existsSync.bind(view),
    statSync: view.statSync.bind(view),
    lstatSync: view.lstatSync.bind(view),
    chmodSync: view.chmodSync.bind(view),
    lchmodSync: view.lchmodSync.bind(view),
    chownSync: view.chownSync.bind(view),
    lchownSync: view.lchownSync.bind(view),
    utimesSync: view.utimesSync.bind(view),
    readFileSync: view.readFileSync.bind(view),
    writeFileSync: view.writeFileSync.bind(view),
    appendFileSync: view.appendFileSync.bind(view),
    truncateSync: view.truncateSync.bind(view),
    createReadStream: view.createReadStream.bind(view),
    createWriteStream: view.createWriteStream.bind(view),
    linkSync: view.linkSync.bind(view),
    unlinkSync: view.unlinkSync.bind(view),
    copyFileSync: view.copyFileSync.bind(view),
    readlinkSync: view.readlinkSync.bind(view),
    symlinkSync: view.symlinkSync.bind(view),
    readdirSync: view.readdirSync.bind(view),
    mkdirSync: view.mkdirSync.bind(view),
    renameSync: view.renameSync.bind(view),
    rmdirSync: view.rmdirSync.bind(view)
  };
}
let rfs = new FileSystem(true);
let rfs2 = new FileSystem(true);
let fsv = new FileSystemContext(rfs);
let fsv2 = new FileSystemContext(rfs2);
module.exports = {
  helperf,
  FileSystem,
  FileSystemContext,
  SecureView,
  rfs,
  rfs2,
  fs: fsv,
  fs2: fsv2,
};
fsv.mkdirSync('/dir');
fsv.writeFileSync('/dir/Some File.txt', 'This is a test file, inside a folder.');
fsv.linkSync('/dir/Some File.txt', '/dir/File Hardlink.txt');
fsv.symlinkSync('Some File.txt', '/dir/File Symlink.txt');
fsv.mkdirSync('/dir/Some Folder');
fsv.writeFileSync('/dir/Some Folder/File in Folder.txt', 'A file in a folder, to demonstrate symlinks.');
fsv.symlinkSync('Some Folder', '/dir/Folder Symlink');
fsv.mkdirSync('/fs2');
fsv.mount('/fs2', 0, fsv2, '/ell');
fsv2.mkdirSync('/ell');
fsv2.writeFileSync('/ell/test.txt', 'A test text file in a mounted filesystem.');