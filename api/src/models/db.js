import ThreadService from './thread_model.js'
import TopicService from './topic_model.js'
import UserService from './user_model.js'

const Services = {
  thread: ThreadService,
  topic: null,
  user: UserService,
}

export default Services

let client

export async function initialize(client) {
  client = client

  Services.topic = new TopicService(client)
}
