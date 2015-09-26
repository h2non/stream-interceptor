var Chunk = require('./chunk')
var Queue = require('./queue')

module.exports = Hook

function Hook() {
  this.stack = []
  this.queue = new Queue
}

Hook.prototype.push = function (hook) {
  this.stack.push(hook)
}

Hook.prototype.run = function (data, done) {
  var index = 0
  var stack = this.stack
  var queue = this.queue
  var chunk = new Chunk(data, done)

  function finish(data) {
    if (data === true) chunk.ignore = true
    // Flag as ready
    chunk.flag(data)
    // Empty queue in FIFO order
    queue.drain()
    // Clean reference
    chunk = null
  }

  function next(data) {
    if (data === true) return finish(true)
    if (index++ === (stack.length - 1)) return finish(data)
    run(data)
  }

  function run(data) {
    var job = stack[index]
    if (data === undefined) job(next)
    else job(data, next)
  }

  queue.push(chunk)
  run(data)
}

exports.Hook = Hook
