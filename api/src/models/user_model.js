const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const databaseClient = require('../util/mongo.js').client
const database = databaseClient.db('sam')
const userCollection = database.collection('user')

const User = {}
module.exports = User


User.checkPassword = async function(email, password) {
  const user = await User.findByEmail(email)

  if (!user) {
    console.log(`User not found: ${user}`)
    return null
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    console.log(`Passwords do not match`)
    return null
  }

  return user
}

User.create = async function({ email, password }) {
  const existingUser = await User.findByEmail(email)
  if (!!existingUser) {
    throw `User with email (${email}) already exists`
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const insertResult = await userCollection.insertOne({
    email,
    passwordHash,
    createdTimestamp: Date.now(),
  })
  const { insertedId } = insertResult

  if (!insertedId) {
    throw new Error('User insert failed')
  }

  _setTokenForUserById(insertedId)

  return await User.findById(insertedId)
}

User.findById = async function(id) {
  return await userCollection.findOne({ _id: id })
}

User.findByIds = async function(ids) {
  return await userCollection.find({ _id: { $in: ids } })
}

User.findByEmail = async function(email) {
  return await userCollection.findOne({ email })
}

// Used to test if there exist any users in the database.
// Should only be used when the app is first created to create an initial admin user.
User.isEmpty = async function() {
  try {
    const one = await userCollection.findOne({})
    return !one
  }
  catch (err) {
    console.log(err)
  }
}

async function _setTokenForUserById(object_id) {
  const filter = { _id: object_id }
  const updater = { $set: { token: _generateToken(object_id) } }
  return await userCollection.updateOne(filter, updater)
}

function _generateToken(id) {
  if (typeof id === 'object') {  // Probably a mongodb ObjectId
    id = id.toString()
  }

  return jwt.sign({ user_id: id }, process.env.SECRET_KEY)
}
