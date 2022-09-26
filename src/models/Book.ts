/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from 'mongoose'

export type BookDocument = Document & {
  title: string
  ISBN: string
  status: string
  description: string
  publisher: string
  publishedDate: string
  authorID: string
  borrowerID: string
  borrowDate: string
  returnDate: string
}

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    index: true,
    required: true,
  },
  ISBN: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['borrowed', 'available'],
    require: true,
    default: 'available',
  },
  description: {
    type: String,
    required: true,
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
    default: null,
  },
  publishedDate: {
    type: String,
    required: true,
    default: new Date().toISOString(),
  },
  authorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    require: true,
    default: null,
  },
  borrowerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
    default: null,
  },
  borrowDate: {
    type: String,
    require: true,
    default: null,
  },
  returnDate: {
    type: String,
    require: true,
    default: null,
  },
})

export default mongoose.model<BookDocument>('Book', bookSchema)
