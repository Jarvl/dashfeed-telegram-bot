import 'dotenv/config'
import fetch from 'node-fetch'

const environment = process.env.ENV || 'production'

const setBackoffInterval = (callback: (done: () => void) => Promise<void>, maxRetries: number = 20, backoffMs: number = 1000, maxBackoffMs: number = 10000): Promise<void> => {
  let timeoutId: NodeJS.Timeout | undefined
  let delay = backoffMs
  let retries = 0

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return new Promise((resolve, reject) => {
    const done = () => {
      clear()
      resolve()
    }

    const timeoutCallback = () => {
      if (retries >= maxRetries) {
        clear()
        reject()
      } else {
        callback(done).then(() => {
          if (timeoutId) {
            delay = Math.min(backoffMs, maxBackoffMs) + (1000 * Math.random())
            backoffMs *= 1.5
            retries++
            timeoutId = setTimeout(timeoutCallback, delay)
          }
        })
      }
    }

    timeoutId = setTimeout(timeoutCallback, delay)
  })
}

const get = (url: string, signal?: AbortSignal) => (
  new Promise((resolve, reject) => {
    fetch(url, { signal })
      .then(res => resolve(res.json()))
      .catch(err => {
        console.log('HTTP GET Error: ', err.message)
        reject(err)
      })
  })
)

type RequestMethod = 'POST' | 'PUT'

const request = async (method: RequestMethod, url: string, body?: object, signal?: AbortSignal) => (
  new Promise<object>((resolve, reject) => {
    fetch(url, {
      method: method,
      body: body && JSON.stringify(body) || undefined,
      headers: { 'Content-Type': 'application/json' },
      signal
    })
      .then(res => res.json().then((data) => resolve(data)))
      .catch(err => {
        console.log('HTTP POST Error: ', err.message)
        reject(err)
      })
  })
)

const post = async (url: string, body?: object, signal?: AbortSignal) => (
  await request('POST', url, body, signal)
)

const put = async (url: string, body?: object, signal?: AbortSignal) => (
  await request('PUT', url, body, signal)
)

const contentsUrl = `${process.env.DASHFEED_API_URL}/contents`

interface Content {
  id: string,
  summary: string
}

const createContent = async (body: object, signal?: AbortSignal) => {
  return (await post(contentsUrl, body, signal) as Content)
}

const getContent = async (contentId: Content['id'], signal?: AbortSignal) => {
  return (await get(`${contentsUrl}/${contentId}`, signal) as Content)
}

const submitContentVote = async (contentId: Content['id'], vote: string) => {
  return (await put(`${contentsUrl}/${contentId}/${vote}`) as Content)
}

export {
  environment,
  setBackoffInterval,
  Content,
  createContent,
  getContent,
  submitContentVote
}