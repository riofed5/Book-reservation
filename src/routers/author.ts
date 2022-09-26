import express from 'express'

import {
  createAuthor,
  findById,
  deleteAuthor,
  findAll,
  updateAuthor,
} from '../controllers/author'

import passport from 'passport'
import { middlewareAdmin } from '../middlewares/isAdmin'

const router = express.Router()

// Every path we define here will get /api/v1/authors prefix
router.get('/', findAll)
router.get('/:authorId', findById)
router.put(
  '/:authorId',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  updateAuthor
)
router.delete(
  '/:authorId',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  deleteAuthor
)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  createAuthor
)

export default router
