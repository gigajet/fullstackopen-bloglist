const blogsRouter=require('express').Router()
const { JsonWebTokenError } = require('jsonwebtoken')
const Blog=require('../models/blog')
const User = require('../models/user')
const middleware=require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs=await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user=request.userOrThrow()
  const {title, author, url, like}=request.body
  const newBlog={
    title, author, url, like,
    user: user._id,
  }
  const blog = new Blog(newBlog)
  const result = await blog.save()
  user.blogs=user.blogs.concat(result._id)
  await user.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response)=> {
  const user=await request.userOrThrow()
  const blog=await Blog.findById(request.params.id)
  if (!blog || (blog.user.toString() !== user.id.toString())) {
    return response.status(401).json({error: 'invalid token'})
  }
  await blog.deleteOne()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response)=> {
  const blog=await Blog.findByIdAndUpdate(request.params.id, request.body, {
    runValidators: true,
    new: true,
  })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

module.exports=blogsRouter
