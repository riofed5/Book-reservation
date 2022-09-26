import Author, { AuthorDocument } from '../models/Author'
import Book from '../models/Book'

const create = (author: AuthorDocument): Promise<AuthorDocument> => {
  return author.save()
}

const findById = (authorId: string): Promise<AuthorDocument> => {
  return (
    Author.findById(authorId)
      .populate({ path: 'writtings', model: Book })
      .exec()
      // .exec() will return a true Promise
      .then((author) => {
        if (!author) {
          throw new Error(`Author ${authorId} not found`)
        }
        return author
      })
  )
}

const findAll = (): Promise<AuthorDocument[]> => {
  return Author.find().sort({ nameOfAuthor: 1 }).exec() // Return a Promise
}

const update = (
  authorId: string,
  update: Partial<AuthorDocument>
): Promise<AuthorDocument | null> => {
  return Author.findByIdAndUpdate(authorId, update, { new: true })
    .exec()
    .then((author) => {
      if (!author) {
        throw new Error(`Author ${authorId} not found`)
      }
      return author
    })
}

const deleteAuthor = (authorId: string): Promise<AuthorDocument | null> => {
  return Author.findByIdAndDelete(authorId).exec()
}

export default {
  create,
  findById,
  findAll,
  update,
  deleteAuthor,
}
