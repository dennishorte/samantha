const db = require('../models/db.js')


module.exports = {
  login,
  message,
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

async function message(req, res) {
  const threadId = req.body.threadId
  const message = req.body.message

  const user = await db.user.findById(req.body.userId)

  let thread
  if (req.body.threadId === null) {
    thread = new db.thread.Thread(user._id)
  }
  else {
    thread = await db.thread.findById(req.body.threadId)
  }

  if (!thread.canAccess(user)) {
    console.log(thread, user)
    res.json({
      status: 'error',
      message: 'not authorized',
    })
    return
  }

  thread.addMessage(user, message)

  res.json({
    status: 'success',
    thread,
  })
}
