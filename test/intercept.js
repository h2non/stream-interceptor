const assert = require('assert')
const stream = require('stream')
const Writable = stream.Writable
const Readable = stream.Readable
const http = require('http')
const intercept = require('..')

suite('intercept', function () {
  test('basic interceptor', function (done) {
    var stream = newInterceptableStream()

    stream.capture(function (chunk, next) {
      next(chunk + chunk)
    })

    stream.push('Foo')
    stream.push('Bar')
    stream.push(null)

    var buf = []
    stream.on('data', function (chunk) {
      buf.push(chunk)
    })

    stream.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BarBar')
      done()
    })
  })

  test('async', function (done) {
    var stream = newInterceptableStream()

    stream.capture(function (chunk, next) {
      if (chunk.toString() === 'Foo')
        setTimeout(function () { next(chunk + chunk) }, 10)
      else if (chunk.toString() === 'Boo')
        setTimeout(function () { next(chunk + chunk) }, 30)
      else
        next(chunk + chunk)
    })

    stream.push('Foo')
    stream.push('Bar')
    stream.push('Boo')
    stream.push(null)

    var buf = []
    stream.on('data', function (chunk) {
      buf.push(chunk)
    })

    stream.on('end', function () {
      assert.equal(buf.length, 3)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BarBar')
      assert.equal(buf.shift(), 'BooBoo')
      done()
    })
  })

  test('ignore chunk', function (done) {
    var stream = newInterceptableStream()

    stream.capture(function (chunk, next) {
      if (chunk.toString() === 'Bar') next(true)
      else next(chunk + chunk)
    })

    stream.push('Foo')
    stream.push('Bar')
    stream.push('Boo')
    stream.push(null)

    var buf = []
    stream.on('data', function (chunk) {
      buf.push(chunk)
    })

    stream.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BooBoo')
      done()
    })
  })

  test('capture event', function () {
    var stream = newInterceptableStream()

    var delay = 10
    var now = Date.now()
    stream.captureEvent('end', function (next) {
      setTimeout(next, 10)
    })

    stream.push('Foo')
    stream.push('Bar')
    stream.push(null)

    stream.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'Foo')
      assert.equal(buf.shift(), 'Boo')
      assert.equal(Date.now() - now >= delay, true)
      done()
    })
  })

  test('pipe', function (done) {
    var stream = newInterceptableStream()
    var writable = new Writable

    var buf = []
    writable._write = function (chunk, encoding, next) {
      buf.push(chunk)
      next()
    }

    stream.capture(function (chunk, next) {
      setTimeout(function () {
        next(chunk + chunk)
      }, Math.random() * 5)
    })

    stream.push('Foo')
    stream.push('Bar')
    stream.push('Boo')
    stream.push(null)

    writable.on('finish', function () {
      assert.equal(buf.length, 3)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BarBar')
      assert.equal(buf.shift(), 'BooBoo')
      done()
    })

    stream.pipe(writable)
  })

  test('http response', function (done) {
    var server = http.createServer(function (req, res) {
      res.writeHead(200)
      res.write('foo')

      setTimeout(function () {
        res.write('bar')
      }, 25)

      setTimeout(function () {
        res.write('boo')
        res.end()
      }, 50)
    })
    server.listen(8989)

    http.get('http://localhost:8989/index.html', function (res) {
      var stream = intercept(res)
      stream.capture(function (chunk, next) {
        next(chunk + chunk)
      })

      var buf = []
      stream.on('data', function (chunk) {
        buf.push(chunk)
      })

      stream.on('end', function () {
        assert.equal(buf.length, 3)
        assert.equal(buf.shift(), 'foofoo')
        assert.equal(buf.shift(), 'barbar')
        assert.equal(buf.shift(), 'booboo')
        server.close(done)
      })
    }).on('error', done)
  })
})

function newInterceptableStream() {
  var stream = intercept(new Readable)
  stream._read = function () {}
  return stream
}
