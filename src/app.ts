import express from 'express'
import lusca from 'lusca'
import dotenv from 'dotenv'
import passport from 'passport'
import cors from 'cors'

import authorRouter from './routers/author'
import userRouter from './routers/user'
import bookRouter from './routers/book'
import { googleStrategy, jwtStrategy } from './config/passport'

import apiErrorHandler from './middlewares/apiErrorHandler'
import apiContentType from './middlewares/apiContentType'
import compression from 'compression'

dotenv.config({ path: '.env' })
const app = express()

// Express configuration
app.set('port', process.env.PORT || 3000)
app.use(apiContentType)
app.use(cors())

// Use common 3rd-party middlewares
app.use(compression())
app.use(express.json())
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use(passport.initialize())

// passport strategies
passport.use(googleStrategy)
passport.use(jwtStrategy)

// Use user router
app.use('/api/v1/users', userRouter)

// Use author router
app.use('/api/v1/authors', authorRouter)

// Use book router
app.use('/api/v1/books', bookRouter)

// Custom API error handler
app.use(apiErrorHandler)

export default app
