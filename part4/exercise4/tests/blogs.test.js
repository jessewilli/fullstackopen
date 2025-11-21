const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const listHelper = require('../utils/list_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('testPassword', 10)
  const user = new User({ username: 'testUser', passwordHash })
  const savedUser = await user.save()

  // associa user aos blogs iniciais
  const blogsWithUser = helper.initialBlogs.map(b => ({
    ...b,
    user: savedUser._id
  }))

  await Blog.insertMany(blogsWithUser)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

describe('total likes', () => {

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    console.log("response", response);
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('when list has only one blog, equals the likes of that', async () => {
    const response = await api.get('/api/blogs')
    const result = listHelper.totalLikes([response.body[0]])
    assert.strictEqual(result, 7)
  })

  test('of a bigger list is calculated right', async () => {
    const response = await api.get('/api/blogs')
    const result = listHelper.totalLikes(response.body)
    assert.strictEqual(result, 36)
  })

})

describe('favorite blog', () => {

  test('display the favorite blog', async () => {
    const response = await api.get('/api/blogs')
    const result = listHelper.favoriteBlog(response.body)
    assert.strictEqual(result, "Canonical string reduction")
  })

})

test('a valid blog can be added ', async () => {

  const token = await helper.loginAndGetToken(api)

  const newBlog = {
    title: "Type wars test",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)


  const contents = blogsAtEnd.map(n => n.title)
  assert(contents.includes('Type wars test'))
})

test('blog posts have unique identifier named id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  blogs.forEach(blog => {
    assert.ok(blog.id, 'blog should have an id property')
    assert.strictEqual(blog._id, undefined, 'blog should not have _id property')
  })
})

test('if likes property is missing, defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Mark',
    url: 'https://nolikes.com'
  }

  const token = await helper.loginAndGetToken(api)

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Someone',
    url: 'https://example.com',
    likes: 5
  }

  const token = await helper.loginAndGetToken(api)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Missing URL',
    author: 'Someone Else',
    likes: 5
  }

  const token = await helper.loginAndGetToken(api)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const token = await helper.loginAndGetToken(api)

    const blogsAtStart = await helper.blogsInDb()

    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(
      blogsAtEnd.length,
      blogsAtStart.length - 1
    )
  })
})

test('check if corretly update the like value', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedData = { likes: 25 }

  const token = await helper.loginAndGetToken(api)

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedData)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 25)
})


after(async () => {
  await mongoose.connection.close()
})