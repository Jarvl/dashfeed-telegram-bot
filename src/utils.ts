import 'dotenv/config'
import fetch from 'node-fetch'

const environment = process.env.ENV || 'production'

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch (err) {
    return false;
  }
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

const post = async (url: string, body: object, signal?: AbortSignal) => (
  new Promise<object>((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
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

const contentsUrl = `${process.env.DASHFEED_API_URL}/contents`

interface Content {
  id: string,
  summary: string
}

const createContent = async (body: object, signal?: AbortSignal) => {
  const res = await post(contentsUrl, body, signal)
  return res as Content
}

const getContent = async (contentId: Content['id'], signal?: AbortSignal) => {
  const res = await get(`${contentsUrl}/${contentId}`, signal)
  return res as Content
}

export { environment, isValidUrl, Content, createContent, getContent }