import request from 'supertest'
import jwt from 'jsonwebtoken'

import app from '../../src/app'
import * as dbHelper from '../db-helper'
import { JWT_SECRET } from '../../src/util/secrets'
import { UserDocument } from '../../src/models/User'
import { AuthorDocument } from '../../src/models/Author'
import { BookDocument } from '../../src/models/Book'

const createToken = (email: string) => jwt.sign({ email }, JWT_SECRET)

const nonExistedBookID = '62333d658ab0292e0ceb7e48'

describe('Book Controllers', () => {
  let defaultBook: BookDocument
  let defaultAuthor: AuthorDocument
  let defaultUser: UserDocument
  let defaultAdmin: UserDocument

  beforeAll(async () => {
    await dbHelper.connect()
  })

  beforeEach(async () => {
    await dbHelper.clearDatabase()

    const defaultData = await dbHelper.createDefault()

    defaultAuthor = defaultData.defaultAuthor
    defaultUser = defaultData.defaultUser
    defaultAdmin = defaultData.defaultAdmin

    const token = createToken(defaultAdmin.email)

    const bookForm = {
      title: 'Example',
      ISBN: '978-3-16-148410-0',
      description: 'this is another description',
      authorID: defaultAuthor._id,
    }

    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    defaultBook = response.body
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should get all books', async () => {
    const response = await request(app).get('/api/v1/books')

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0]).toHaveProperty('_id')
    expect(response.body[0]).toHaveProperty('title', defaultBook.title)
    expect(response.body[0]).toHaveProperty('ISBN', defaultBook.ISBN)
    expect(response.body[0]).toHaveProperty('status', defaultBook.status)
  })

  it('should get data with an existed book ID', async () => {
    const response = await request(app).get(`/api/v1/books/${defaultBook._id}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('title', defaultBook.title)
    expect(response.body).toHaveProperty('ISBN', defaultBook.ISBN)
    expect(response.body).toHaveProperty('status', defaultBook.status)
  })

  it('should NOT get data with a non-existed user ID', async () => {
    const response = await request(app).get(`/api/v1/books/${nonExistedBookID}`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Book not found')
  })

  it('should update data book', async () => {
    const token = createToken(defaultAdmin.email)
    const bookForm = {
      title: 'new One',
    }
    const response = await request(app)
      .put(`/api/v1/books/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('title', bookForm.title)
  })

  it('should create a new book', async () => {
    const token = createToken(defaultAdmin.email)

    const bookForm = {
      title: 'Testing',
      ISBN: 'aiousjdj8918230',
      description: 'this is another description',
      authorID: defaultAuthor._id,
    }

    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    const authorOfBook = await request(app).get(
      `/api/v1/authors/${defaultAuthor._id}`
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('title', bookForm.title)
  })

  it('should book a existed book', async () => {
    const token = createToken(defaultUser.email)

    const bookForm = {
      status: 'borrowed',
      borrowerID: defaultUser._id,
    }

    const response = await request(app)
      .put(`/api/v1/books/booking/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    const userBorrow = await request(app)
      .get(`/api/v1/users/${defaultUser._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', bookForm.status)
  })

  it('should cancel a booked book', async () => {
    const token = createToken(defaultUser.email)

    const bookForm = {
      status: 'borrowed',
      borrowerID: defaultUser._id,
    }

    await request(app)
      .put(`/api/v1/books/booking/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    const cancelForm = {
      status: 'available',
      borrowerID: defaultUser._id,
    }

    const cancelResponse = await request(app)
      .put(`/api/v1/books/cancel/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(cancelForm)

    expect(cancelResponse.status).toBe(200)
    expect(cancelResponse.body).toHaveProperty('status', cancelForm.status)
  })

  it('should delete an avaialable book', async () => {
    const token = createToken(defaultAdmin.email)

    const deleteResponse = await request(app)
      .delete(`/api/v1/books/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)

    const authorOfBook = await request(app).get(
      `/api/v1/authors/${defaultAuthor._id}`
    )

    expect(deleteResponse.status).toBe(200)
    expect(authorOfBook.body.writtings).not.toEqual(
      expect.arrayContaining([`${defaultBook._id}`])
    )
  })

  it('should delete an borrowed book', async () => {
    const token = createToken(defaultAdmin.email)

    const bookForm = {
      status: 'borrowed',
      borrowerID: defaultUser._id,
    }

    await request(app)
      .put(`/api/v1/books/booking/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(bookForm)

    const deleteResponse = await request(app)
      .delete(`/api/v1/books/${defaultBook._id}`)
      .set('Authorization', `Bearer ${token}`)

    const authorOfBook = await request(app).get(
      `/api/v1/authors/${defaultAuthor._id}`
    )

    const userBorrow = await request(app)
      .get(`/api/v1/users/${defaultUser._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteResponse.status).toBe(200)
    expect(authorOfBook.body.writtings).not.toEqual(
      expect.arrayContaining([`${defaultBook._id}`])
    )
    expect(userBorrow.body.bookingEvents).not.toEqual(
      expect.arrayContaining([`${defaultBook._id}`])
    )
  })
})
