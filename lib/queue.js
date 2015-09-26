module.exports = Queue

function Queue() {
  this.queue = []
  this.count = 0
  this.ended = false
  this.closed = false
}

Queue.prototype.inc = function () {
  this.count += 1
}

Queue.prototype.dec = function () {
  this.count -= 1
}

Queue.prototype.push = function (chunk) {
  this.queue.push(chunk)
}

Queue.prototype.isEmpty = function () {
  return this.ended && !this.count
}

Queue.prototype.resolve = function (chunk, index) {
  this.remove(chunk, index)
  chunk.resolve()
}

Queue.prototype.remove = function (chunk, index) {
  this.count -= 1
  this.queue.splice(index, 1)
}

Queue.prototype.flush = function () {
  this.count = 0
  this.queue = []
  this.closed = true
  this.onEnd && this.onEnd()
}

Queue.prototype.end = function (cb) {
  this.onEnd = cb
  this.ended = true
  if (!this.count) this.onEnd()
}

Queue.prototype.drain = function () {
  if (this.closed) return

  var queue = this.queue
  for (var index = 0; index < queue.length; index += 1) {
    var chunk = queue[index]

    if (!chunk.ready) break

    if (chunk.ignore) {
      this.remove(chunk, index)
      index -= 1
      continue
    }

    this.resolve(chunk, index)
    index -= 1
  }

  if (this.isEmpty()) this.flush()
}
