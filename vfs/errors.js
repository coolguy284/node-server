/*function FSError(msg) {
  Error.call(this, msg);
}
FSError.prototype = new Error();*/

class FSError extends Error {
  constructor(msg) {
    super(msg);
  }
}
FSError.prototype.name = 'FSError';

class ReadOnlyFSError extends FSError {
  constructor(msg) {
    super(msg || 'read-only filesystem');
  }
}
ReadOnlyFSError.prototype.name = 'ReadOnlyFSError';

let osfserrcodes = {
  'EPERM': [1, 'Operation not permitted'],
  'EACCES': [13, 'Permission denied'],
  'ENOENT': [2, 'No such file or directory'],
  'EEXIST': [17, 'File exists'],
  'ENOTDIR': [20, 'Not a directory'],
  'EISDIR': [21, 'Is a directory'],
  'EINVAL': [22, 'Invalid argument'],
  'ENOSPC': [28, 'No space left on device'],
  'EROFS': [30, 'Read-only file system'],
};

class OSFSError extends FSError {
  constructor(msg, addl) {
    if (osfserrcodes[msg] === undefined) throw new Error(`unacceptable error type ${msg}`);
    if (addl !== undefined)
      super(`${msg}: ${osfserrcodes[msg][1]}: ${addl}`);
    else
      super(`${msg}: ${osfserrcodes[msg][1]}`);
    this.code = msg;
    if (addl !== undefined) this.addl = addl;
  }
}
OSFSError.prototype.name = 'OSFSError';

class InvalUGIDFSError extends FSError {
  constructor(msg) {
    super(msg || 'read-only filesystem');
  }
}
ReadOnlyFSError.prototype.name = 'ReadOnlyFSError';

module.exports = {
  FSError, ReadOnlyFSError, OSFSError
};