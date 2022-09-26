import request from 'supertest'
import jwt from 'jsonwebtoken'

import app from '../../src/app'
import * as dbHelper from '../db-helper'
import { JWT_SECRET } from '../../src/util/secrets'
import { AuthorDocument } from '../../src/models/Author'
import { UserDocument } from '../../src/models/User'

const createToken = (email: string) => jwt.sign({ email }, JWT_SECRET)

const nonExistedAuthorID = '62333d658ab0292e0ceb7e48'

describe('User Controllers', () => {
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
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should get all authors', async () => {
    const response = await request(app).get('/api/v1/authors')

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0]).toHaveProperty('_id')
    expect(response.body[0]).toHaveProperty(
      'nameOfAuthor',
      defaultAuthor.nameOfAuthor
    )
  })

  it('should get data with an existed author ID', async () => {
    const response = await request(app).get(
      `/api/v1/authors/${defaultAuthor._id}`
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      'nameOfAuthor',
      defaultAuthor.nameOfAuthor
    )
  })

  it('should NOT get data with a non-existed author ID', async () => {
    const token = createToken(defaultUser.email)
    const response = await request(app).get(
      `/api/v1/authors/${nonExistedAuthorID}`
    )

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Author not found')
  })

  it('should update data author', async () => {
    const authorForm = {
      nameOfAuthor: 'New change',
    }
    const token = createToken(defaultAdmin.email)
    const response = await request(app)
      .put(`/api/v1/authors/${defaultAuthor._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(authorForm)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      'nameOfAuthor',
      authorForm.nameOfAuthor
    )
  })

  it('Admin should create a new author', async () => {
    const token = createToken(defaultAdmin.email)

    const authorForm = {
      nameOfAuthor: 'testing Author',
    }

    const response = await request(app)
      .post('/api/v1/authors')
      .send(authorForm)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      'nameOfAuthor',
      authorForm.nameOfAuthor
    )
  })

  it('Normal user should NOT allow to create a new author', async () => {
    const token = createToken(defaultUser.email)

    const authorForm = {
      nameOfAuthor: 'testing Author',
    }

    const response = await request(app)
      .post('/api/v1/authors')
      .send(authorForm)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('message', 'Admin required !')
  })
})
