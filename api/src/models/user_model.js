import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export default UserService

function UserService(client) {
  this._client = client
  this._db = this._client.db('sam')
  this._coll = this._db.collection('user')
}


UserService.prototype.checkPassword = async function(email, password) {
  const user = await this.findByEmail(email)

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

UserService.prototype.create = async function({ email, password }) {
  const existingUser = await this.findByEmail(email)
  if (!!existingUser) {
    throw `User with email (${email}) already exists`
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const insertResult = await this._coll.insertOne({
    email,
    passwordHash,
    createdTimestamp: Date.now(),
  })
  const { insertedId } = insertResult

  if (!insertedId) {
    throw new Error('User insert failed')
  }

  this._setTokenForUserById(insertedId)

  return await this.findById(insertedId)
}

UserService.prototype.findById = async function(id) {
  return await this._coll.findOne({ _id: id })
}

UserService.prototype.findByIds = async function(ids) {
  return await this._coll.find({ _id: { $in: ids } })
}

UserService.prototype.findByEmail = async function(email) {
  return await this._coll.findOne({ email })
}

// Used to test if there exist any users in the database.
// Should only be used when the app is first created to create an initial admin user.
UserService.prototype.isEmpty = async function() {
  try {
    const one = await this._coll.findOne({})
    return !one
  }
  catch (err) {
    console.log(err)
  }
}

UserService.prototype._setTokenForUserById = async function(object_id) {
  const filter = { _id: object_id }
  const updater = { $set: { token: _generateToken(object_id) } }
  return await this._coll.updateOne(filter, updater)
}

function _generateToken(id) {
  if (typeof id === 'object') {  // Probably a mongodb ObjectId
    id = id.toString()
  }

  return jwt.sign({ user_id: id }, process.env.SECRET_KEY)
}
