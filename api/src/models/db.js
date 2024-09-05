import ThreadService from './thread_model.js'
import TopicService from './topic_model.js'
import UserService from './user_model.js'

const Services = {
  create,
  initialize,
  thread: null,
  topic: null,
  user: null,
}

export default Services

let client

// If this is the first time you are using the database, instead call create to set up the empty
// collections needed by this system.
async function initialize(client) {
  client = client

  Services.thread = new ThreadService(client)
  Services.topic = new TopicService(client)
  Services.user = new UserService(client)
}

// Creates all of the collections used by the various db services.
// When finished, calls initialize.
async function create(client) {
  const db = client.db('sam')
  await db.createCollection('thread')
  await db.createCollection('topic')
  await db.createCollection('user')

  initialize(client)
}
