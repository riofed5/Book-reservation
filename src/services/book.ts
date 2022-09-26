import Book, { BookDocument } from '../models/Book'
import User, { UserDocument } from '../models/User'
import Author, { AuthorDocument } from '../models/Author'

import { NotFoundError } from '../helpers/apiError'

const create = async (
  book: BookDocument,
  authorID: string | undefined = undefined
): Promise<BookDocument> => {
  if (authorID) {
    const foundAuthor = await Author.findById(authorID)
    if (!foundAuthor) {
      throw new NotFoundError('Author not found')
    }

    foundAuthor.writtings.push(book.id)
    await foundAuthor.save()
  }

  return await book.save()
}

const findById = (bookId: string): Promise<BookDocument> => {
  return Book.findById(bookId)
    .populate('authorID')
    .exec() // .exec() will return a true Promise
    .then((book) => {
      if (!book) {
        throw new Error(`Book ${bookId} not found`)
      }
      return book
    })
}

const findAll = (): Promise<BookDocument[]> => {
  return Book.find().sort({ title: 1 }).exec() // Return a Promise
}

const booking = async (
  bookId: string,
  update: Partial<BookDocument>,
  userId: string
) => {
  const foundUser = await User.findById(userId)
  if (!foundUser) {
    throw new NotFoundError('User not found')
  }

  foundUser.bookingEvents.push(bookId)
  await foundUser.save()

  return Book.findByIdAndUpdate(bookId, update, { new: true })
    .exec()
    .then((book) => {
      if (!book) {
        throw new Error(`Book ${bookId} not found`)
      }
      return book
    })
}

const cancelBooking = async (
  bookId: string,
  update: Partial<BookDocument>,
  userId: string
) => {
  const foundUser = await User.findById(userId)
  if (!foundUser) {
    throw new NotFoundError('User not found')
  }

  const index = foundUser.bookingEvents.findIndex((el) => el == bookId)

  foundUser.bookingEvents.splice(index, 1)
  await foundUser.save()

  return Book.findByIdAndUpdate(bookId, update, { new: true }).exec()
}

const update = (
  bookId: string,
  update: Partial<BookDocument>
): Promise<BookDocument | null> => {
  return Book.findByIdAndUpdate(bookId, update, { new: true })
    .exec()
    .then((book) => {
      if (!book) {
        throw new Error(`Book ${bookId} not found`)
      }
      return book
    })
}

const deleteBook = async (bookId: string): Promise<BookDocument | null> => {
  // const selectedBook = findById(bookId)
  // return Book.findByIdAndDelete(bookId).exec()
  return Book.findById(bookId)
    .exec() // .exec() will return a true Promise
    .then(async (book) => {
      if (!book) {
        throw new Error(`Book ${bookId} not found`)
      }

      if (book.borrowerID) {
        const foundUser = await User.findById(book.borrowerID)
        if (!foundUser) {
          throw new NotFoundError('User not found')
        }
        const idx = foundUser.bookingEvents.findIndex((el) => el == bookId)
        foundUser.bookingEvents.splice(idx, 1)
        await foundUser.save()
      }

      if (book.authorID) {
        const foundAuthor = await Author.findById(book.authorID)
        if (!foundAuthor) {
          throw new NotFoundError('Author not found')
        }

        const index = foundAuthor.writtings.findIndex((el) => el == bookId)

        foundAuthor.writtings.splice(index, 1)
        await foundAuthor.save()
      }

      // return book
      return Book.findByIdAndDelete(bookId)
    })
}

export default {
  create,
  findById,
  findAll,
  update,
  deleteBook,
  booking,
  cancelBooking,
}
