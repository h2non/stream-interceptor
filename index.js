var Hook = require('./lib/hook')
var Chunk = require('./lib/chunk')
var Queue = require('./lib/queue')
var Interceptable = require('./lib/interceptable')

exports = module.exports = streamInterceptor

function streamInterceptor(stream) {
  if (isInterceptor(stream)) return stream

  Object
  .keys(Interceptable.prototype)
  .forEach(function (key) {
    stream[key] = Interceptable.prototype[key]
  })

  stream._constructor()
  return stream
}

exports.Hook = Hook
exports.Chunk = Chunk
exports.Queue = Queue
exports.Interceptor =
exports.Interceptable = Interceptable

function isInterceptor(stream) {
  return Interceptable.prototype.isIntercepting === stream.isIntercepting
}
