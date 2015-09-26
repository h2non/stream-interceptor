const stream = require('stream')
const assert = require('assert')
const intercept = require('..')

suite('intercept', function () {
  test('basic interceptor', function (done) {
    var read = new stream.Readable
    read._read = function () {}

    intercept(read)

    read.capture(function (chunk, next) {
      next(chunk + chunk)
    })

    read.push('Foo')
    read.push('Bar')
    read.push(null)

    var buf = []
    read.on('data', function (chunk) {
      buf.push(chunk)
    })

    read.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BarBar')
      done()
    })
  })

  test('async', function (done) {
    var read = new stream.Readable
    read._read = function () {}

    intercept(read)

    read.capture(function (chunk, next) {
      if (chunk.toString() === 'Foo')
        setTimeout(function () { next(chunk + chunk) }, 10)
      else if (chunk.toString() === 'Boo')
        setTimeout(function () { next(chunk + chunk) }, 30)
      else
        next(chunk + chunk)
    })

    read.push('Foo')
    read.push('Bar')
    read.push('Boo')
    read.push(null)

    var buf = []
    read.on('data', function (chunk) {
      buf.push(chunk)
    })

    read.on('end', function () {
      assert.equal(buf.length, 3)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BarBar')
      assert.equal(buf.shift(), 'BooBoo')
      done()
    })
  })

  test('ignore chunk', function (done) {
    var read = new stream.Readable
    read._read = function () {}

    intercept(read)

    read.capture(function (chunk, next) {
      if (chunk.toString() === 'Bar') next(true)
      else next(chunk + chunk)
    })

    read.push('Foo')
    read.push('Bar')
    read.push('Boo')
    read.push(null)

    var buf = []
    read.on('data', function (chunk) {
      buf.push(chunk)
    })

    read.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'FooFoo')
      assert.equal(buf.shift(), 'BooBoo')
      done()
    })
  })

  test('capture event', function () {
    var read = new stream.Readable
    read._read = function () {}

    intercept(read)

    read.captureEvent('end', function (_, next) {
      setTimeout(next, 10)
    })

    read.push('Foo')
    read.push('Bar')
    read.push(null)

    read.on('end', function () {
      assert.equal(buf.length, 2)
      assert.equal(buf.shift(), 'Foo')
      assert.equal(buf.shift(), 'Boo')
      done()
    })
  })
})
