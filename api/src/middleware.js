import { ObjectId } from 'mongodb'
import { Strategy as JwtStrategy } from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import passport from 'passport'
import db from './models/db.js'

const Middleware = {
  authenticate,
  coerceIds,
}
export default Middleware


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


function _coerceIdsRecurse(obj) {
  if (obj === undefined || obj === null) {
    return
  }

  for (const [key, value] of Object.entries(obj)) {
    const lowKey = key.toLowerCase()

    if (value === undefined || value === null) {
      continue
    }

    else if (typeof value === 'object' && !Array.isArray(value)) {
      _coerceIdsRecurse(value)
    }

    else if (lowKey.endsWith('id') || lowKey.endsWith('ids')) {
      if (Array.isArray(value)) {
        // Modify in place
        for (let i = 0; i < value.length; i++) {
          value[i] = _tryConvertToObjectId(key, value[i])
        }
      }
      else {
        obj[key] = _tryConvertToObjectId(key, value)
      }
    }

    else if (Array.isArray(value)) {
      for (const elem of value) {
        if (typeof elem === 'object') {
          _coerceIdsRecurse(elem)
        }
      }
    }
  }
}


function _tryConvertToObjectId(key, value) {
  if (
    typeof value === 'string'
    && value.length === 24
    && /^[0-9a-f]*$/.test(value)
  ) {
    return new ObjectId(value)
  }
  else {
    return value
  }
}

/*
   By coercing all ids into ObjectId, we make sure that they are all handled the same inside
   the app, regardless of whether or not they came from the database or the user.
 */
function coerceIds(req, res, next) {
  _coerceIdsRecurse(req.body)
  next()
}
