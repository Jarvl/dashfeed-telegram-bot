'use strict'

import https from 'https'

const transportOpts = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  }
}

const envLoggerConfig = {
  development: transportOpts,
  production: {
    level: 'warn',
    ...transportOpts
  }
}


const get = (url) => (
  new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = []

      res.on('data', chunk => {
        data.push(chunk)
      })
    
      res.on('end', () => {
        resolve(JSON.parse(Buffer.concat(data).toString()))
      })
    }).on('error', err => {
      console.log('HTTP GET Error: ', err.message)
      reject(err)
    })
  })
)

export { envLoggerConfig, get }