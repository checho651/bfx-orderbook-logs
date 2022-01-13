'use strict'

// Local dependencies.
const {
  pair,
  precision,
  obLength,
  logArrayLength
} = require('./config/input-parameters.json')

// Third party dependencies.
const bfxapi = require('bitfinex-api-node')

let obArrToLog = []

function logObArr (ob) {
  obArrToLog.push([
    Date.now(),
    ob,
    '-'
  ])
  if (obArrToLog.length > logArrayLength) {
    console.log('OB:', JSON.stringify(obArrToLog))
    obArrToLog = []
  }
}

async function main () {
  const ws = new bfxapi.WSv2({ transform: false, manageOrderBooks: true })

  await ws.open()
  console.log(Date.now(), 'OPEN WS CONNECTION.')

  await ws.subscribeOrderBook(pair, precision, obLength)
  console.log(Date.now(), 'SUBSCRIBED TO OB.')

  ws.on('error', async (e) => {
    console.error(Date.now(), `WSv2 error: ${e.message || e}`)
    if (ws.isOpen()) await ws.close()
  })

  ws.on('close', () => {
    console.log(Date.now(), 'WS CLOSED')
    setTimeout(() => main(), 5000)
  })

  ws.onOrderBook({ symbol: pair }, async (ob) => {
    if (!ob) return false
    logObArr(ob)
  })
}

if (require.main === module) main()
