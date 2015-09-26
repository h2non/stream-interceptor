var Readable = require('stream').Readable
var ReadableProto = Readable.prototype
var Emitter = require('events').EventEmitter
var nativeEmit = Emitter.prototype.emit
var Hook = require('./hook')
var Queue = require('./queue')

module.exports = Interceptor

function Interceptor(opts) {
  if (!(this instanceof Interceptor))
    return new Interceptor(opts)

  this._constructor()
  Readable.call(this, opts)
}

Interceptor.prototype = Object.create(Readable.prototype)

Interceptor.prototype.constructor = Interceptor

Interceptor.prototype._constructor = function () {
  this._ended = false
  this._hooks = {}
  this._queue = new Queue
}

Interceptor.prototype._forward = function (event) {
  return function (chunk) {
    if (chunk === true) return
    nativeEmit.call(this, event, chunk)
  }.bind(this)
}

Interceptor.prototype.emit = function (event, data) {
  var hook = this._hooks[event]

  if (!hook) {
    return nativeEmit.call(this, event, data)
  }

  hook.run(data, this._forward(event))
  return this
}

Interceptor.prototype.push = function (chunk, encoding) {
  var self = this
  var hook = this._hooks.data

  if (chunk === null && !this._ended && hook) {
    this._ended = true
    hook.queue.end(function () {
      ReadableProto.push.call(self, null)
    })
    return false
  }

  if (!this._ended && hook && chunk) {
    hook.queue.inc()
  }

  return ReadableProto.push.call(this, chunk, encoding)
}

Interceptor.prototype.isIntercepting = function () {
  return this.push === Interceptor.prototype.push
}

Interceptor.prototype.stop = function () {
  this.push = ReadableProto.push
  this.emit = ReadableProto.emit
  return this
}

Interceptor.prototype.intercept = function () {
  this.push = Interceptor.prototype.push
  this.emit = Interceptor.prototype.emit
  return this
}

Interceptor.prototype.capture = function (fn) {
  return this.captureEvent('data', fn)
}

Interceptor.prototype.captureEvent = function (event, fn) {
  var hook = this._hooks[event]

  if (!hook) {
    hook = this._hooks[event] = new Hook()
  }

  hook.push(fn)
  return this
}
