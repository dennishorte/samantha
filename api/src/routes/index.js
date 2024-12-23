import context from '../util/context.js'
import db from '../models/db.js'
import util from '../util/util.js'

import messageRoute from './message.js'
import topicRoutes from './topic_routes.js'

export default {
  login,
  message: messageRoute,
  threads,
  topics: topicRoutes,
}

async function _createFirstUserIfNone(email, password) {
  if (await db.user.isEmpty()) {
    console.log('User db is empty. Creating first user.')
    const user = await db.user.create({
      email,
      password,
      slack: null,
    })
  }
}

async function login(req, res) {
  await _createFirstUserIfNone(req.body.user.email, req.body.user.password)
  const user = await db.user.checkPassword(req.body.user.email, req.body.user.password)

  if (!user) {
    res.json({
      status: 'error',
      message: 'User not found',
    })
  }
  else if (user.deactivated) {
    res.json({
      status: 'error',
      message: `User (${req.body.email}) has been deactivated`,
    })
  }
  else {
    res.json({
      status: 'success',
      user: {
        _id: user._id,
        email: user.email,
        token: user.token,
      },
    })
  }
}

async function threads(req, res) {
  util.assert(req.user._id.equals(req.body.userId), 'Access denied')

  const latest = await context.latest(req.body.userId)

  res.json({
    status: 'success',
    threads: latest.map(t => t.data)
  })
}
