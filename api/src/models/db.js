import ThreadService from './thread_model.js'
import TopicService from './topic_model.js'
import UserService from './user_model.js'

const Services = {
  thread: null,
  topic: null,
  user: null,
}

export default Services

let client

export async function initialize(client) {
  client = client

  Services.thread = new ThreadService(client)
  Services.topic = new TopicService(client)
  Services.user = new UserService(client)
}
