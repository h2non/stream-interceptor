var Chunk = require('./chunk')
var Queue = require('./queue')

module.exports = Hook

/**
 * Hook implements a trivial abstraction
 * to push and dispatch hook with a convenient control flow
 */

function Hook() {
  this.stack = []
  this.queue = new Queue
}

Hook.prototype.push = function (hook) {
  this.stack.push(hook)
}

Hook.prototype.end = function (cb) {
  this.queue.end(cb)
}

Hook.prototype.run = function (data, done) {
  var index = 0
  var self = this
  var stack = this.stack
  var queue = this.queue

  var chunk = new Chunk(data, done)
  queue.push(chunk)

  function finish(data) {
    if (data === true) chunk.ignore = true
    // Flag as ready
    chunk.flag(data)
    // Empty queue
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
    job(data, next)
  }

  run(data)
}

exports.Hook = Hook
