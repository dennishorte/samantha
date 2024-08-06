module.exports = {
}

async function _createFirstUserIfNone(name, password) {
  if (await db.user.isEmpty()) {
    console.log('User db is empty. Creating first user.')
    const user = await db.user.create({
      name,
      password,
      slack: null,
    })
  }
}

module.exports.login = async function(req, res) {
  await _createFirstUserIfNone(req.body.user.name, req.body.user.password)
  const user = await db.user.checkPassword(req.body.user.name, req.body.user.password)

  if (!user) {
    res.json({
      status: 'error',
      message: 'User not found',
    })
  }
  else if (user.deactivated) {
    res.json({
      status: 'error',
      message: `User (${req.body.name}) has been deactivated`,
    })
  }
  else {
    res.json({
      status: 'success',
      user: {
        _id: user._id,
        name: user.name,
        token: user.token,
      },
    })
  }
}
