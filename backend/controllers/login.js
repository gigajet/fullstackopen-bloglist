const loginRouter=require('express').Router()
const bcryptjs = require('bcryptjs')
const User=require('../models/user')
const jwt=require('jsonwebtoken')
const config=require('../utils/config')

loginRouter.post('/', async (request,response)=>{
  const {username, password} = request.body
  const user=await User.findOne({username})
  if (!(user && password && (await bcryptjs.compare(password, user.passwordHash)))) {
    return response.status(401).json({error: 'invalid username or password'})
  }
  const payload={
    username: user.username,
    id: user._id,
  }
  const token=await jwt.sign(payload,config.SECRET,{expiresIn: 60*60})
  response
    .status(200)
    .json({token, username: user.username, name: user.name})
})


module.exports=loginRouter
