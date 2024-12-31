const usersRouter=require('express').Router()
const bcryptjs = require('bcryptjs')
const User=require('../models/user')

usersRouter.post('/', async (request, response)=>{
  const {username, name, password}=request.body
  if (!(password && password.length>=3)) {
    return response.status(400).json({error: 'password must be at least 3 characters long'})
  }
  const saltRounds=10
  const passwordHash = await bcryptjs.hash(password, saltRounds)

  const user=new User({username, name, passwordHash})
  const userDoc=await user.save()
  response.status(201).json(userDoc)
})

usersRouter.get('/', async (request, response)=>{
  const users=await User.find({}).populate('blogs', {url: 1, title: 1, author: 1})
  response.json(users)
})

module.exports=usersRouter
