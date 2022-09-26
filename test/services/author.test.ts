import Author from '../../src/models/Author'
import AuthorService from '../../src/services/author'
import * as dbHelper from '../db-helper'

const nonExistingAuthorId = '5e57b77b5744fa0b461c7906'

async function createAuthor() {
  const author = new Author({
    nameOfAuthor: 'Alex',
  })
  return await AuthorService.create(author)
}

describe('author service', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a author', async () => {
    const author = await createAuthor()
    expect(author).toHaveProperty('_id')
    expect(author).toHaveProperty('nameOfAuthor', 'Alex')
  })

  it('should get a author with id', async () => {
    const author = await createAuthor()
    const found = await AuthorService.findById(author._id)
    expect(found.nameOfAuthor).toEqual(author.nameOfAuthor)
    expect(found._id).toEqual(author._id)
  })

  //   // Check https://jestjs.io/docs/en/asynchronous for more info about
  //   // how to test async code, especially with error
  it('should not get a non-existing movie', async () => {
    expect.assertions(1)
    return AuthorService.findById(nonExistingAuthorId).catch((e) => {
      expect(e.message).toMatch(`Author ${nonExistingAuthorId} not found`)
    })
  })

  it('should update an existing author', async () => {
    const author = await createAuthor()
    const update = {
      nameOfAuthor: 'Updating',
    }
    const updated = await AuthorService.update(author._id, update)
    expect(updated).toHaveProperty('_id', author._id)
    expect(updated).toHaveProperty('nameOfAuthor', update.nameOfAuthor)
  })

  it('should not update a non-existing author', async () => {
    expect.assertions(1)
    const update = {
      nameOfAuthor: 'Updating',
    }
    return AuthorService.update(nonExistingAuthorId, update).catch((e) => {
      expect(e.message).toMatch(`Author ${nonExistingAuthorId} not found`)
    })
  })

  it('should delete an existing author', async () => {
    expect.assertions(1)
    const author = await createAuthor()
    await AuthorService.deleteAuthor(author._id)
    return AuthorService.findById(author._id).catch((e) => {
      expect(e.message).toBe(`Author ${author._id} not found`)
    })
  })
})
