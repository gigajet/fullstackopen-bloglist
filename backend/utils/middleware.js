const { JsonWebTokenError } = require("jsonwebtoken")
const User = require("../models/user")
const config=require('./config')
const jwt=require('jsonwebtoken')
const morgan=require('morgan')

const requestLogging=morgan('tiny')

const tokenExtractor=async (req, res, next)=>{
  const auth=req.header('Authorization')
  let token=null
  if (auth && auth.startsWith('Bearer ')) {
    token=auth.replace('Bearer ','')
  }
  req.token=token
  next()
}

const errorHandler=(err, req, res, next)=>{
  console.log('errorHandler',err.name,err.message)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      'error': err.message,
    })
  } else if (err.name === 'CastError') {
    return res.status(400).json({
      'error': 'malformatted id'
    })
  } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
    return res.status(400).json({
      'error': 'duplicated username. `username` should be unique'
    })
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      'error': 'token expired'
    })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      'error': 'invalid token'
    })
  }
  return next(err)
}

const unknownEndpoint=(req,res)=>{
  return res.status(404).json({
    'error': 'unknown endpoint',
  })
}

const userExtractor=async (req,res,next)=>{
  if (req.token) {
    const decodedToken=await jwt.verify(req.token, config.SECRET)
    if (!(decodedToken && decodedToken.id)) {
      throw new JsonWebTokenError('invalid token')
    }
    req.user=await User.findById(decodedToken.id)
    if (!req.user) {
      throw new JsonWebTokenError('user in jwt not exists')
    }
  }
  req.userOrThrow=()=>{
    if (!req.user) {
      throw new JsonWebTokenError('invalid token')
    }
    return req.user
  }
  next()
}

module.exports={
  tokenExtractor,
  errorHandler,
  unknownEndpoint,
  userExtractor,
  requestLogging,
}
