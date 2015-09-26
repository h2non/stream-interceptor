# stream-intercept

Tiny [node.js](https://nodejs.org) module to intercept, modify and/or handle the control flow of chunks of `data` (or any other events) events emitted by any [readable compatible stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) without creating a new stream.

## Installation

```bash
npm install stream-intercept
```

## Example

Data chunks interceptor
```js
var Readable = require('stream').Readable
var interceptor = require('stream-interceptor')

var stream = new Readable
interceptor(someStream)
stream.push()

stream.pipe()
```

HTTP response interceptor
```js
// to do
```

## API

#### streamIntercept(stream) => intercetorStream

## License

MIT - Tomas Aparicio
