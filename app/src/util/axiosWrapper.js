import axios from 'axios'

export default {
  post,
}


async function post(path, body) {
  if (body === undefined) {
    body = {}
  }

  if (!(body instanceof Object)) {
    throw new Error('Please send only objects as the body of post requests')
  }

  const response = await axios.post(path, body)

  if (response.data.status === 'success') {
    return response.data
  }

  else if (response.data.status === 'error') {
    alert('Received error from server. See console for details.')
    console.log(response.data)
    throw new Error('Recieved error from server')
  }

  else {
    alert('Unknown response status: ' + response.data.status)
    console.log(response.data)
    throw new Error('Invalid response from server')
  }
}
