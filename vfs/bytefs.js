class ByteFileSystem {
  constructor(size, blocksize, writable) {
    this.size = size;
    this.blocksize = blocksize;
    this.writable = writable;
    this.buf = Buffer.alloc(size);
  }
  getBlock(blk) {
    return this.buf.slice(blk * this.blocksize, (blk + 1) * this.blocksize);
  }
  getBlockCopy(blk) {
    let rb = Buffer.allocUnsafe(this.blocksize);
    this.buf.copy(rb, 0, blk * this.blocksize, (blk + 1) * this.blocksize);
    return rb;
  }
  setBlock(blk, buf) {
    buf.copy(this.buf, blk * this.blocksize);
  }
  format(size, blocksize, writable) {
    if (writable === undefined) writable = true;
    let blk = this.getBlock(0);
    blk[0] = writable;
    blk.writeUint8BE(Math.log2(blocksize), 1);
    blk.writeUintBE(size / blocksize, 2, 6);
  }
  readFromFile(buf) {
    this.buf = buf;
    this.blocksize = Math.pow(2, buf.readUint8BE(1));
    this.size = this.blocksize * buf.readUintBE(2, 6);
    this.writable = buf[0];
  }
}