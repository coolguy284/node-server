let { FileSystem, FileSystemContext } = require('./vfs.js');

function makeTestFS() {
  let rfs = new FileSystem({writable:true, maxsize:2**30});
  let rfs2 = new FileSystem({writable:true, maxsize:2**29});
  let fsv = new FileSystemContext(rfs, {uid:1000});
  let fsv2 = new FileSystemContext(rfs2, {uid:1000});
  fsv.mkdirSync('/dir');
  fsv.writeFileSync('/dir/Some File.txt', 'This is a test file, inside a folder.');
  fsv.linkSync('/dir/Some File.txt', '/dir/File Hardlink.txt');
  fsv.symlinkSync('Some File.txt', '/dir/File Symlink.txt');
  fsv.mkdirSync('/dir/Some Folder');
  fsv.writeFileSync('/dir/Some Folder/File in Folder.txt', 'A file in a folder, to demonstrate symlinks.');
  fsv.linkSync('/dir/Some Folder', '/dir/Folder Hardlink');
  fsv.symlinkSync('Some Folder', '/dir/Folder Symlink');
  fsv.mkdirSync('/dir/Folder Mount Point');
  fsv.mount('/dir/Folder Mount Point', 0, fsv, '/dir/Some Folder');
  fsv.mkdirSync('/dir/Folder Hardlink Loop');
  fsv.linkSync('/dir/Folder Hardlink Loop', '/dir/Folder Hardlink Loop/Loop');
  fsv.writeFileSync('/dir/Folder Hardlink Loop/file.txt', 'A text file to demonstrate the strange infinite nested directory structure.');
  fsv.mkdirSync('/dir/Folder Symlink Loop');
  fsv.symlinkSync('.', '/dir/Folder Symlink Loop/Loop');
  fsv.writeFileSync('/dir/Folder Symlink Loop/file.txt', 'A text file to demonstrate the nested directory structure.');
  fsv.mkdirSync('/fs2');
  fsv.mount('/fs2', 0, fsv2, '/ell');
  fsv2.mkdirSync('/ell');
  fsv2.writeFileSync('/ell/test.txt', 'A test text file in a mounted filesystem.');
  return { rfs, rfs2, fsv, fsv2 };
}

module.exports = { makeTestFS };