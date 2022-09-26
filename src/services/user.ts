import User, { UserDocument } from '../models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWT_SECRET } from '../util/secrets'
import Book from '../models/Book'

import { NotFoundError } from '../helpers/apiError'

const create = (user: UserDocument): Promise<UserDocument> => {
  return user.save()
}

const findByEmail = async (email: string) => {
  // query for the user in the database using email
  return User.findOne({ email }).exec()
}

const findById = (userId: string): Promise<UserDocument> => {
  return User.findById(userId)
    .populate({ path: 'bookingEvents', model: Book })
    .exec() // .exec() will return a true Promise
    .then((user) => {
      if (!user) {
        throw new Error(`User ${userId} not found`)
      }
      return user
    })
}

const findAll = (): Promise<UserDocument[]> => {
  return User.find().sort({ firstName: 1 }).exec() // Return a Promise
}

const login = async (email: string, password: string) => {
  const userLogin = await User.findOne({ email })

  if (!userLogin) {
    throw new NotFoundError('User not found')
  }

  const isEqual = await bcrypt.compare(password, userLogin.password)

  if (!isEqual) {
    throw new NotFoundError('Password is not correct!')
  }

  const { _id, firstName, lastName, bookingEvents, isAdmin } = userLogin
  const token = jwt.sign({ email: userLogin.email }, JWT_SECRET)

  return {
    userInfo: {
      _id,
      firstName,
      lastName,
      bookingEvents,
      isAdmin,
      email,
    },
    token,
  }
}

const update = (
  userId: string,
  update: Partial<UserDocument>
): Promise<UserDocument | null> => {
  return User.findByIdAndUpdate(userId, update, { new: true })
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error(`User ${userId} not found`)
      }
      return user
    })
}

const deleteUser = (userId: string): Promise<UserDocument | null> => {
  return User.findByIdAndDelete(userId).exec()
}

const findOrCreate = async (parsedToken: any) => {
  //find user by email
  const foundUser = await findByEmail(parsedToken.payload.email)

  // if no user, create new one with parsedToken data
  if (!foundUser) {
    const { given_name, family_name, email } = parsedToken.payload
    const newUser = new User({
      firstName: given_name || 'N/A',
      lastName: family_name || 'N/A',
      email,
    })
    return create(newUser)
  }
  //if there is user, return that user
  return foundUser
}

export default {
  create,
  findById,
  findAll,
  update,
  deleteUser,
  findOrCreate,
  findByEmail,
  login,
}
