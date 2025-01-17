const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter=require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware=require('./utils/middleware')

mongoose.connect(config.MONGODB_URI).then(
  console.log(`connected to mongodb ${config.MONGODB_URI}`)
)

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogging)
app.use(middleware.tokenExtractor)
app.use('/api/blogs',blogsRouter)
app.use('/api/users',usersRouter)
app.use('/api/login',loginRouter)
if (config.NODE_ENV === 'test') {
  app.use('/api/tests', require('./controllers/testing'))
}
app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports=app
