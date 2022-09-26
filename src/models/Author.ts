/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from 'mongoose'

export type AuthorDocument = Document & {
  nameOfAuthor: string
  writtings: string[]
}

const authorSchema = new mongoose.Schema({
  nameOfAuthor: {
    type: String,
    index: true,
    required: true,
  },
  writtings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
})

export default mongoose.model<AuthorDocument>('Author', authorSchema)
