const {test, after, beforeEach, describe}=require('node:test')
const assert=require('node:assert')
const mongoose=require('mongoose')
const supertest=require('supertest')
const app=require('../app')
const Blog=require('../models/blog')
const helper=require('./testHelper')
const User = require('../models/user')
const api=supertest(app)

describe('when there are some users initially',()=>{
  beforeEach(async ()=>{
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  test('they are returned in json',async ()=>{
    await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async ()=>{
    const users=await api.get('/api/users').expect(200)
    const dbUsers=await helper.usersInDb()
    assert.strictEqual(users.body.length, dbUsers.length)
    assert.deepStrictEqual(users.body, dbUsers)
  })

  test('users have the blog field', async ()=>{
    const users=await api.get('/api/users').expect(200)
    users.body.forEach((user)=>{
      assert(user.blogs)
    })
  })

  describe('creating new user',()=>{
    test('sucess with valid data and unique username', async ()=>{
      const newUser={
        username: 'unique',
        password: 'seckret',
        name: 'Unique User',
      }
      await api.post('/api/users').send(newUser).expect(201)
      const users=await helper.usersInDb()
      assert.strictEqual(users.length, helper.initialUsers.length+1)
      assert(users.find(u=>u.username==='unique') !== null)
    })

    test('fails 400 with duplicated username', async ()=>{
      const newUser={
        username: 'gigajet',
        password: 'abcdef',
        name: 'Duplicated User',
      }
      await api.post('/api/users').send(newUser).expect(400)
      const users=await helper.usersInDb()
      assert.strictEqual(users.length, helper.initialUsers.length)
      assert(!(users.find(u=>u.name===newUser.name)))
    })

    test('fails 400 if username too short', async ()=>{
      const newUser={
        username: 'zz',
        password: 'abcdef',
        name: 'Invalid User',
      }
      await api.post('/api/users').send(newUser).expect(400)
      const users=await helper.usersInDb()
      assert.strictEqual(users.length, helper.initialUsers.length)
      assert(!(users.find(u=>u.name===newUser.name)))
    })

    test('fails 400 if password too short', async ()=>{
      const newUser={
        username: 'abc',
        password: 'ab',
        name: 'Invalid User',
      }
      await api.post('/api/users').send(newUser).expect(400)
      const users=await helper.usersInDb()
      assert.strictEqual(users.length, helper.initialUsers.length)
      assert(!(users.find(u=>u.name===newUser.name)))
    })

    test('fails 400 if username and password too short', async ()=>{
      const newUser={
        username: 'ab',
        password: 'ab',
        name: 'Invalid User',
      }
      await api.post('/api/users').send(newUser).expect(400)
      const users=await helper.usersInDb()
      assert.strictEqual(users.length, helper.initialUsers.length)
      assert(!(users.find(u=>u.name===newUser.name)))
    })
  })

  describe('login',()=>{
    test('suceeds with valid credential',async ()=>{
      const user={username: 'gigajet', password: '123456789'}
      const resp=await api.post('/api/login').send(user).expect(200)
      assert(resp.body && resp.body.token)
    })

    test('fails 401 if missing username',async ()=>{
      const user={password: '123456789'}
      await api.post('/api/login').send(user).expect(401)
    })

    test('fails 401 if missing password',async ()=>{
      const user={username: 'gigajet'}
      await api.post('/api/login').send(user).expect(401)
    })

    test('fails 401 if wrong credential',async ()=>{
      const user={username: 'gigajet', password: 'wrong-password'}
      await api.post('/api/login').send(user).expect(401)
    })
  })
})

after(async ()=>{
  await mongoose.connection.close()
})