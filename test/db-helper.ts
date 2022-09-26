import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../src/models/User'
import Author from '../src/models/Author'
import Book from '../src/models/Book'

const mongod = new MongoMemoryServer()

export const connect = async () => {
  const uri = await mongod.getUri()

  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }

  await mongoose.connect(uri, mongooseOpts)
}

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}

export const createDefault = async () => {
  const defaultAdmin = new User({
    firstName: 'testing',
    lastName: 'Admin',
    email: 'admin@gmail.com',
    password: '$2a$12$CQ2HcSr9oXa5431csjxuJu8JDLM5yTFjkjolhvkoFCpcMkrJeeBv2',
    isAdmin: true,
  })
  await defaultAdmin.save()

  const defaultUser = new User({
    firstName: 'testing',
    lastName: 'User',
    email: 'user@gmail.com',
    password: '$2a$12$CQ2HcSr9oXa5431csjxuJu8JDLM5yTFjkjolhvkoFCpcMkrJeeBv2',
  })
  await defaultUser.save()

  const defaultAuthor = new Author({
    nameOfAuthor: 'testing Author',
  })
  await defaultAuthor.save()


  return { defaultAdmin, defaultUser, defaultAuthor }
}
