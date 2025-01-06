const {test, after, beforeEach, describe}=require('node:test')
const assert=require('node:assert')
const mongoose=require('mongoose')
const supertest=require('supertest')
const app=require('../app')
const Blog=require('../models/blog')
const helper=require('./testHelper')
const User = require('../models/user')
const api=supertest(app)

describe('when there are some blogs initially', ()=>{
  beforeEach(async ()=> {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  test('all notes are returned and in json', async ()=>{
    const blogs=await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(blogs.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property of the posts is named *id*', async ()=>{
    const promises=helper.initialBlogs.map(blog=>async ()=>{
      assert.strictEqual(blog._id.toString(), blog.toJSON().id)
    })
    await Promise.all(promises)
  })

  describe('addition of new blog', ()=>{
    let token=null
    beforeEach(async ()=>{
      token=await helper.validToken()
    })
    test('suceed with valid data', async ()=>{
      const blog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blog)
        .expect(201)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length+1)
      const titles=blogs.map(blog=>blog.title)
      assert(titles.includes('Program Construction by Stepwise Refinement'))
    })

    test('suceed with default likes of 0 if missing likes', async ()=>{
      const newBlog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length+1)
      const b=blogs.find(blog=>blog.title === newBlog.title)
      assert(b)
      assert.strictEqual(b.likes, 0);
    })


    test('fails 400 if missing title', async ()=>{
      const newBlog={
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    test('fails 400 if missing url', async ()=>{
      const newBlog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    test('suceeds with a user assigned to it', async ()=> {
      const newBlog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      const response=await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length+1)
      const b=blogs.find(blog=>blog.title===newBlog.title)
      assert(b && b.user)
      const users=await helper.usersInDb()
      const user=users.find(u=>u.id === b.user.toString())
      assert(user)
      const blogIds=user.blogs.map(id=>id.toString())
      assert(blogIds.includes(b.id))
    })

    test('fails 401 if missing authorization token', async ()=>{
      const blog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .send(blog)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if malformatted token', async ()=>{
      const blog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer invalid-token`)
        .send(blog)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if expired token', async ()=>{
      const blog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${helper.expiredToken()}`)
        .send(blog)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if invalid token with wrong secret', async ()=>{
      const blog={
        title: 'Program Construction by Stepwise Refinement',
        author: 'Niklaus Wirth',
        url: 'http://sunnyday.mit.edu/16.355/wirth-refinement.html',
        likes: 10,
      }
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${helper.invalidToken()}`)
        .send(blog)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', async ()=>{
    const token=await helper.validToken()
    test('suceeds with valid id', async()=>{
      await api.delete(`/api/blogs/5a422aa71b54a676234d17f8`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length-1)
      assert(!(blogs.find(blog=>blog.title==='Go To Statement Considered Harmful')))
    })

    test('fails 400 with malformatted id', async()=>{
      const token=await helper.validToken()
      await api.delete(`/api/blogs/malformattedId`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('makes no side effect with nonexistent id', async()=>{
      const token=await helper.validToken()
      const id=await helper.nonexistentId()
      await api.delete(`/api/blogs/${id}`)
        .set('Authorization', `Bearer ${token}`)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if missing token', async()=>{
      await api.delete(`/api/blogs/5a422aa71b54a676234d17f8`)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if malformatted token', async()=>{
      await api.delete(`/api/blogs/5a422aa71b54a676234d17f8`)
        .set('Authorization', `Bearer malformatted`)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if token expired', async()=>{
      const token=await helper.expiredToken()
      await api.delete(`/api/blogs/5a422aa71b54a676234d17f8`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 401 if wrong user', async()=>{
      const token=await helper.invalidToken()
      await api.delete(`/api/blogs/5a422bc61b54a676234d17fc`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })
  })

  describe('updating of a blog',()=>{
    test('suceeds with valid id', async()=>{
      await api.put(`/api/blogs/5a422ba71b54a676234d17fb`).send({likes: 15}).expect(200)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
      const blog=blogs.find(blog=>blog.id === '5a422ba71b54a676234d17fb')
      assert.strictEqual(blog.likes, 15)
    })

    test('fails 400 with malformatted id', async()=>{
      await api.put(`/api/blogs/malformedId`).send({likes: 15}).expect(400)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails 404 with nonexistent id', async()=>{
      const id=await helper.nonexistentId()
      await api.put(`/api/blogs/${id}`).send({likes: 15}).expect(404)
      const blogs=await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })
  })
})

after(async ()=>{
  await mongoose.connection.close()
})
