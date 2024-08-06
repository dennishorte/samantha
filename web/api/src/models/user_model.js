const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


const User = {}
module.exports = User


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
    throw 'User insert failed'
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
