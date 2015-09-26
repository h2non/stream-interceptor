var Readable = require('stream').Readable
var interceptor = require('.')

// Create a new Readable stream
var stream = new Readable
stream._read = function () { /* ... */ }

// Make it interceptable
interceptor(stream)

// Prepare to capture chunks asyncronously
stream.capture(function (chunk, next) {
  if (chunk === 'Bad') {
    return next(true) // Ignore chunk
  }
  next(chunk + '\n')
})

// We gonna handle strings
stream.setEncoding('utf8')

// Push chunks to the stream
stream.push('Bad')
stream.push('Ugly')
stream.push('Good')
stream.push(null) // we're done!

stream.pipe(process.stdout)
