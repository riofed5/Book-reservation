import express from 'express'

import {
  createBook,
  findById,
  deleteBook,
  findAll,
  updateBook,
  bookingBook,
  cancelBookingBook,
} from '../controllers/book'
import passport from 'passport'
import { middlewareAdmin } from '../middlewares/isAdmin'
const router = express.Router()

// Every path we define here will get /api/v1/movies prefix
router.get('/', findAll)
router.get('/:bookId', findById)
router.put(
  '/:bookId',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  updateBook
)

router.put(
  '/booking/:bookId',
  passport.authenticate('jwt', { session: false }),
  bookingBook
)

router.put(
  '/cancel/:bookId',
  passport.authenticate('jwt', { session: false }),
  cancelBookingBook
)

router.delete(
  '/:bookId',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  deleteBook
)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  middlewareAdmin,
  createBook
)

export default router
