var Hook = require('./lib/hook')
var Chunk = require('./lib/chunk')
var Queue = require('./lib/queue')
var Interceptor = require('./lib/interceptor')

exports = module.exports = streamInterceptor

function streamInterceptor(stream) {
  Object
  .keys(Interceptor.prototype)
  .forEach(function (key) {
    stream[key] = Interceptor.prototype[key]
  })

  stream._constructor()
  return stream
}

exports.Hook = Hook
exports.Chunk = Chunk
exports.Queue = Queue
exports.Interceptor =
exports.Interceptable = Interceptor
