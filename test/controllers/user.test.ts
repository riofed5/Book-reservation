import request from 'supertest'
import jwt from 'jsonwebtoken'

import app from '../../src/app'
import * as dbHelper from '../db-helper'
import { JWT_SECRET } from '../../src/util/secrets'
import { UserDocument } from '../../src/models/User'

const createToken = (email: string) => jwt.sign({ email }, JWT_SECRET)

const nonExistedUserID = '62333d658ab0292e0ceb7e48'

describe('User Controllers', () => {
  let defaultUser: UserDocument
  let defaultAdmin: UserDocument

  beforeAll(async () => {
    await dbHelper.connect()
  })

  beforeEach(async () => {
    await dbHelper.clearDatabase()

    const defaultData = await dbHelper.createDefault()

    defaultUser = defaultData.defaultUser
    defaultAdmin = defaultData.defaultAdmin
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('Admin should get all users', async () => {
    const token = createToken(defaultAdmin.email)
    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(2)
    expect(response.body[0]).toHaveProperty('_id')
    expect(response.body[0]).toHaveProperty('lastName', defaultAdmin.lastName)
    expect(response.body[0]).toHaveProperty('email', defaultAdmin.email)
    expect(response.body[0]).toHaveProperty('isAdmin', defaultAdmin.isAdmin)
  })

  it('Normal user should NOT get all users', async () => {
    const token = createToken(defaultUser.email)
    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('message', 'Admin required !')
  })

  it('should create a new user', async () => {
    const userForm = {
      firstName: 'new',
      lastName: 'user',
      email: 'example@gmail.com',
      password: 'abcdefg',
    }

    const response = await request(app).post('/api/v1/users').send(userForm)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('firstName', userForm.firstName)
    expect(response.body).toHaveProperty('email', userForm.email)
  })

  it('should login with existed user', async () => {
    const userForm = {
      email: 'user@gmail.com',
      password: 'password',
    }

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(userForm)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'Login successfully')
    expect(response.body).toHaveProperty('token')
  })

  it('Admin should allow to delete a user', async () => {
    const token = createToken(defaultAdmin.email)
    const response = await request(app)
      .delete(`/api/v1/users/${defaultUser._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
  })

  it('should get data with an existed user ID', async () => {
    const token = createToken(defaultUser.email)
    const response = await request(app)
      .get(`/api/v1/users/${defaultUser._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('firstName', defaultUser.firstName)
    expect(response.body).toHaveProperty('email', defaultUser.email)
  })

  it('should NOT get data with a non-existed user ID', async () => {
    const token = createToken(defaultUser.email)
    const response = await request(app)
      .get(`/api/v1/users/${nonExistedUserID}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'User not found')
  })

  it('should update data user', async () => {
    const userForm = {
      email: 'newone@gmail.com',
    }
    const token = createToken(defaultUser.email)
    const response = await request(app)
      .put(`/api/v1/users/${defaultUser._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(userForm)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('email', userForm.email)
  })
})
