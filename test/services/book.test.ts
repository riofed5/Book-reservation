import Book from '../../src/models/Book'
import BookService from '../../src/services/book'
import * as dbHelper from '../db-helper'
import { createUser } from './user.test'

const nonExistingBookId = '5e57b77b5744fa0b461c7906'

async function createBook() {
  const book = new Book({
    title: 'Testing',
    ISBN: 'aiousjdj8918230',
    description: 'this is description',
  })
  return await BookService.create(book)
}

describe('book service', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a book', async () => {
    const book = await createBook()
    expect(book).toHaveProperty('_id')
    expect(book).toHaveProperty('title', 'Testing')
  })

  it('should get a book with id', async () => {
    const book = await createBook()
    const found = await BookService.findById(book._id)
    expect(found.title).toEqual(book.title)
    expect(found._id).toEqual(book._id)
  })

  //   // Check https://jestjs.io/docs/en/asynchronous for more info about
  //   // how to test async code, especially with error
  it('should not get a non-existing book', async () => {
    expect.assertions(1)
    return BookService.findById(nonExistingBookId).catch((e) => {
      expect(e.message).toMatch(`Book ${nonExistingBookId} not found`)
    })
  })

  it('should update an existing book', async () => {
    const book = await createBook()
    const update = {
      title: 'Updating',
    }
    const updated = await BookService.update(book._id, update)
    expect(updated).toHaveProperty('_id', book._id)
    expect(updated).toHaveProperty('title', 'Updating')
  })

  it('should not update a non-existing book', async () => {
    expect.assertions(1)
    const update = {
      title: 'Updating',
    }
    return BookService.update(nonExistingBookId, update).catch((e) => {
      expect(e.message).toMatch(`Book ${nonExistingBookId} not found`)
    })
  })

  it('should book an existing book', async () => {
    const book = await createBook()
    const borrowUser = await createUser()

    const update = {
      status: 'borrowed',
      borrowerID: borrowUser._id,
    }
    const updated = await BookService.booking(book._id, update, borrowUser._id)
    expect(updated).toHaveProperty('status', 'borrowed')
    expect(updated).toHaveProperty('borrowerID', borrowUser._id)
  })

  it('should cancel a borrowed book', async () => {
    const book = await createBook()

    const borrowUser = await createUser()

    const bookingForm = {
      status: 'borrowed',
      borrowerID: borrowUser._id,
    }
    const booked = await BookService.booking(
      book._id,
      bookingForm,
      borrowUser._id
    )

    const cancel = {
      status: 'available',
      borrowerID: undefined,
    }
    const canceled = await BookService.cancelBooking(
      book._id,
      cancel,
      borrowUser._id
    )

    expect(canceled).toHaveProperty('status', 'available')
    expect(canceled).toHaveProperty('borrowerID', null)
  })

  it('should delete an existing book', async () => {
    expect.assertions(1)
    const book = await createBook()
    await BookService.deleteBook(book._id)
    return BookService.findById(book._id).catch((e) => {
      expect(e.message).toBe(`Book ${book._id} not found`)
    })
  })
})
