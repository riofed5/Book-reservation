import express, { Response, Request } from 'express'

import {
  createUser,
  findById,
  deleteUser,
  findAll,
  updateUser,
  login,
  requestPassword,
  updatePassword,
} from '../controllers/user'
import passport from 'passport'
import { middlewareAdmin } from '../middlewares/isAdmin'

const router = express.Router()

// Every path we define here will get /api/v1/users prefix
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  findAll
)
router.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  findById
)
router.put(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  updateUser
)

router.put('/updatePassword/:userId', updatePassword)

router.delete(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  deleteUser
)
router.post('/', createUser)
router.post('/login', login)
router.post('/requestPassword', requestPassword)

router.post(
  '/login/google',
  passport.authenticate('google-id-token', { session: false }),
  (req: Request, res: Response) => {
    /**
     * req.user= { user: foundUser, token }
     * */
    res.json(req.user)
  }
)

export default router
