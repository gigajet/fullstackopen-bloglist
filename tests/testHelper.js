const Blog=require('../models/blog')
const User = require('../models/user')
const jwt=require('jsonwebtoken')
const config=require('../utils/config')

const initialBlogs=[
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
    user: "67712d85cba191a5c4fb89c2",
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
    user: "67712d85cba191a5c4fb89c2",
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
    user: "67712d85cba191a5c4fb89c2",
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
    user: "67712e15a5c1c53f8151c37b",
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
    user: "67712e15a5c1c53f8151c37b",
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
    user: "67712e15a5c1c53f8151c37b",
  }  
]

const initialUsers=[
  {
    username: "gigajet",
    name: "Nguyen Le Minh",
    _id: "67712d85cba191a5c4fb89c2",
    passwordHash: "$2a$10$uvx9AOaDY8TiZHynuuP0z.QncBGPaSZqs10RHxXuoxjtSUTwpTAly",
    __v: 0,
  },
  {
    username: "hnimel",
    name: "Minh Le Nguyen",
    _id: "67712e15a5c1c53f8151c37b",
    passwordHash: "$2a$10$14JARwv.5cKTfyhWNE/zH.iUfyw8TarYV7gvQWmiGj3XJ2.aOVnJa",
    __v: 0,
  }
]

const nonexistentId=async ()=>{
  const blog=new Blog({title: 'willdeletethissoon', author: 'willdelete', url:'http://example.com/willdelete', likes: 0})
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const blogsInDb=async ()=>{
  const blogs=await Blog.find({})
  return blogs.map(blog=>blog.toJSON())
}

const usersInDb=async ()=>{
  const users=await User.find({})
  return users.map(user=>user.toJSON())
}

const validToken=async ()=>{
  const user=await User.findById('67712d85cba191a5c4fb89c2')
  const tokenToEncode={
    username: user.username,
    id: user._id,
  }
  const token=await jwt.sign(tokenToEncode, config.SECRET)
  return token
}

const invalidToken=()=>{
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdpZ2FqZXQiLCJpZCI6IjY3NzEyZDg1Y2JhMTkxYTVjNGZiODljMiIsImlhdCI6MTczNTU2NTA1OCwiZXhwIjoxNzM1NTY4NjU4fQ.hg14zjGwR81DRJcqVpx7FZJyiWaq9U8AA2GVyE0GsBg'
}

const expiredToken=()=>{
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdpZ2FqZXQiLCJpZCI6IjY3NzEyZDg1Y2JhMTkxYTVjNGZiODljMiIsImlhdCI6MTczNTU3NjcwOSwiZXhwIjoxNzM1NTgwMzA5fQ.gAXGpJnouhvp9PD9o1MApjicRSC4iIq1bm6Jb2Cil2w'
}

module.exports={
  initialBlogs,
  nonexistentId,
  blogsInDb,
  initialUsers,
  usersInDb,
  validToken,
  expiredToken,
  invalidToken,
}
