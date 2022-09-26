import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'

import Book from '../models/Book'
import User from '../models/User'
import UserService from '../services/user'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'

// POST /users
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    })

    const respone = {
      status: 'Created user successfully',
      firstName,
      lastName,
      email,
    }

    await UserService.create(user)
    res.json(respone)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// POST /login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body
    const response = await UserService.login(email, password)
    const { userInfo, token } = response
    res.json({
      status: 'Login successfully',
      userInfo,
      token,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// PUT /users/:userId
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const userId = req.params.userId
    const updatedUser = await UserService.update(userId, update)
    res.json(updatedUser)
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId

    const { password } = req.body
    const hashedPassword = await bcrypt.hash(password, 12)

    const update = { password: hashedPassword }

    const updatedUser = await UserService.update(userId, update)
    res.json({
      status: 'Updated password successfully',
    })
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

// PUT /users/requestPassword
export const requestPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email
    const userRequest = await UserService.findByEmail(email)
    const userID = userRequest?._id
    res.json({
      status: 'Request new password successfully',
      userID,
    })
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

// DELETE /users/:userId
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.userId
    await Book.updateMany(
      { borrowerID: userID },
      { $set: { borrowerID: undefined, status: 'avaialable' } }
    )

    await UserService.deleteUser(userID)
    res
      .status(200)
      .send({
        status: 'Deleted successfully',
        message: 'The user information is not accessible anymore',
      })
      .end()
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

// GET /users/:userId
export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await UserService.findById(req.params.userId))
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

// GET /users
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await UserService.findAll())
  } catch (error) {
    next(new NotFoundError('Users not found', error))
  }
}
