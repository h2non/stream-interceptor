# stream-interceptor [![Build Status](https://api.travis-ci.org/h2non/stream-interceptor.svg?branch=master&style=flat)](https://travis-ci.org/h2non/stream-interceptor) [![NPM](https://img.shields.io/npm/v/stream-interceptor.svg)](https://www.npmjs.org/package/stream-interceptor)

Tiny [node.js](https://nodejs.org) module to **intercept**, **modify** and/or **ignore** chunks of data and events in any [readable compatible stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) before it's processed by other stream consumers (e.g: via `pipe()`).

It becomes particularly useful when dealing with net/http/fs streams.

## Installation

```bash
npm install stream-interceptor
```

## Examples

##### Existent stream

```js
var Readable = require('stream').Readable
var interceptor = require('stream-interceptor')

// Create a new Readable stream
var stream = new Readable
stream._read = function () { /* ... */ }

// Make it interceptable
interceptor(stream)

// Prepare to capture chunks
stream.capture(function (chunk, next) {
  next(chunk + chunk)
})

// We gonna handle strings
stream.setEncoding('utf8')

// Push chunks to the stream
stream.push('Foo')
stream.push('Bar')
stream.push(null) // we're done!

// Listen for events like a stream consumer
stream.on('data', function (chunk) {
  console.log('Modified chunk:', chunk)
})

stream.on('end', function () {
  console.log('We are done!')
})
```

##### Capture HTTP response

```js
var http = require('http')
var interceptor = require('stream-interceptor')

// Test server
var server = http.createServer(function (req, res) {
  res.writeHead(200)
  res.write('Foo')
  res.write('Bar')
  res.end()
}).listen(3000)

http.get('http://localhost:3000', function (response) {
  // http.IncomingMessage implements a Readable stream
  var stream = interceptor(response)

  stream.capture(function (chunk, next) {
    next(chunk + chunk + '\n')
  })

  stream.on('end', function () {
    console.log('Response status:', response.statusCode)
    server.close()
  })

  stream.pipe(process.stdout)
})
```

##### Capture asynchronously

```js
var Readable = require('stream').Readable
var interceptor = require('stream-interceptor')

// Create a new Readable stream
var stream = new Readable
stream._read = function () { /* ... */ }

// Make it interceptable
interceptor(stream)

// Prepare to capture chunks asyncronously
// Chunks will be processed always as FIFO queue
stream.capture(function (chunk, next) {
  setTimeout(function () {
    next(chunk + chunk + '\n')
  }, Math.random() * 1000)
})

// We gonna handle strings
stream.setEncoding('utf8')

// Push chunks to the stream
stream.push('Slow Foo')
stream.push('Slow Bar')
stream.push(null) // we're done!

stream.pipe(process.stdout)
```

##### Ignore chunks

```js
var Readable = require('stream').Readable
var interceptor = require('stream-interceptor')

// Create a new Readable stream
var stream = new Readable
stream._read = function () { /* ... */ }

// Make it interceptable
interceptor(stream)

// Prepare to capture chunks
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
```

##### Interceptable stream

```js
var Interceptable = require('stream-interceptor').Interceptable

// Implements both Readable and Interceptable stream
var stream = new Interceptable
stream._read = function () { /* ... */ }

// Prepate to capture chunks
stream.capture(function (chunk, next) {
  next(chunk + chunk + '\n')
})

stream.pipe(process.stdout)
```

##### Event interceptor

```js
var Interceptable = require('stream-interceptor').Interceptable

// Implements both Readable and Interceptable stream
var stream = new Interceptable
stream._read = function () { /* ... */ }

// Prepate to capture events
stream.captureEvent('error', function (err, next) {
  next(true) // always ignore errors
})

// Prepate to capture chunks
stream.capture(function (chunk, next) {
  next(chunk + chunk + '\n')
})

stream.on('error', function (err) {
  console.error('Error:', err) // won't be called
})

// Push data in the stream
stream.push('Foo')
stream.push('Bar')
stream.push(null)

// Simulate an error
stream.emit('error', 'Damn!')

stream.pipe(process.stdout)
```

## API

### streamIntercept(readableStream) => Interceptable

Wraps any readable stream turning it an interceptable stream.
`Interceptable` stream implements the same interface as `Readable`.

### Interceptable([ options ])
Alias: `Interceptor`

Creates a new `Interceptable` stream. Inherits from `Readable` stream.

#### Interceptable#interceptable => `boolean`

Property to determine if the stream is interceptable.

#### Interceptable#capture(fn) => `Interceptable`

Subscribe to capture chunks of data emitted by the stream.

#### Interceptable#captureEvent(event, fn) => `Interceptable`

Capture data emitted by a specific event.
`fn` argument expects two arguments: `chunk, callback`.

When you're done, **you must call the callback** passing the new argument: `callback(chunk)`

You can optionally ignore chunks passing `true` to the callback: `callback(true)`.

### isInterceptor(stream) => `boolean`

### Hook()

Hook layer internally used capture and handle events of the stream.

### Queue()

FIFO queue implementation internally used.

### Chunk()

Internal chunk event structure.

## License

MIT - Tomas Aparicio
