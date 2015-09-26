module.exports = Chunk

function Chunk(data, fn) {
  this.ready = false
  this.ignore = false
  this.data = data
  this.resolver = fn
}

Chunk.prototype.resolve = function () {
  this.resolver && this.resolver(this.data)
}

Chunk.prototype.flag = function (data) {
  this.ready = true
  this.data = data
}
