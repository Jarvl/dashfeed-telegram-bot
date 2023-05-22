'use strict'

import https from 'https'

export const get = (url) => (
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