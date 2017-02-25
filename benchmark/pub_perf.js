'use strict'

const Hemera = require('./../packages/hemera')
const Nats = require('nats')

const PORT = 4222
const flags = ['--user', 'derek', '--pass', 'foobar']
const authUrl = 'nats://derek:foobar@localhost:' + PORT
const noAuthUrl = 'nats://localhost:' + PORT

const loop = 50000
const hash = 5000

console.log('Publish Performance Test')
console.log('Publish %d messages', loop)

const nats = Nats.connect(noAuthUrl)
const hemera = new Hemera(nats)

hemera.ready(() => {
  var start = new Date()

  for (var i = 0; i < loop; i++) {
    hemera.act({
      pubsub$: true,
      topic: 'math',
      cmd: 'add'
    })

    if (i % hash === 0) {
      process.stdout.write('+')
    }
  }

  nats.flush(function () {
    var stop = new Date()
    var mps = parseInt(loop / ((stop - start) / 1000))
    console.log('\nPublished at ' + mps + ' msgs/sec')
    process.exit()
  })
})
