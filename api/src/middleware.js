const { ObjectId } = require('mongodb')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('./models/db.js')

const Middleware = {
  authenticate,
}
module.exports = Middleware


// Configure the Bearer strategy for use by Passport.
//
// The Bearer strategy requires a `verify` function which receives the
// credentials (`token`) contained in the request.  The function must invoke
// `cb` with a user object, which will be set at `req.user` in route handlers
// after authentication.
var jwtOpts = {}
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOpts.secretOrKey = process.env.SECRET_KEY
passport.use(new JwtStrategy(
  jwtOpts,
  async function(tokenData, cb) {
    const id = new ObjectId(tokenData.user_id)
    const user = await db.user.findById(id)

    if (!user) { return cb(null, false) }
    return cb(null, user)
  }
))

/*
   By default, all routes require authentication.
   Routes that start with '/api/guest/' do not require authentication.
 */
function authenticate(req, res, next) {
  if (req.path.startsWith('/api/guest/')) {
    next()
  }
  else {
    passport.authenticate('jwt', { session: false })(req, res, next)
  }
}
