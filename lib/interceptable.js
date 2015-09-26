var Readable = require('stream').Readable
var ReadablePush = Readable.prototype.push
var Emitter = require('events').EventEmitter
var EmitterEmit = Emitter.prototype.emit
var Hook = require('./hook')

module.exports = Interceptable

function Interceptable(opts) {
  if (!(this instanceof Interceptable))
    return new Interceptable(opts)

  this._constructor()
  Readable.call(this, opts)
}

Interceptable.prototype = Object.create(Readable.prototype)

Interceptable.prototype.constructor = Interceptable

Interceptable.prototype._constructor = function () {
  this._hooks = {}
  this._ended = false
}

Interceptable.prototype.interceptable = true

Interceptable.prototype._forward = function (event) {
  return function (chunk) {
    EmitterEmit.call(this, event, chunk)
  }.bind(this)
}

Interceptable.prototype.isIntercepting = function () {
  return this.push === Interceptable.prototype.push
}

Interceptable.prototype.capture = function (fn) {
  return this.captureEvent('data', fn)
}

Interceptable.prototype.captureEvent = function (event, fn) {
  var hook = this._hooks[event]

  if (!hook) {
    hook = this._hooks[event] = new Hook()
  }

  hook.push(fn)
  return this
}

Interceptable.prototype.emit = function (event, data) {
  var hook = this._hooks[event]

  if (!hook) {
    return EmitterEmit.call(this, event, data)
  }

  hook.run(data, this._forward(event))
  return this
}

Interceptable.prototype.push = function (chunk, encoding) {
  if (this._ended) return false

  var self = this
  var hook = this._hooks.data

  if (chunk === null && !this._ended && hook) {
    this._ended = true
    hook.queue.end(function () {
      ReadablePush.call(self, null)
    })
    return false
  }

  if (!this._ended && hook && chunk) {
    hook.queue.inc() // Increment queue counter
  }

  return ReadablePush.call(this, chunk, encoding)
}
