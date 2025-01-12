require('dotenv').config()

const NODE_ENV=process.env.NODE_ENV || 'development'
const MONGODB_URI=NODE_ENV==='test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI
const PORT=process.env.PORT
const SECRET=NODE_ENV==='test' ? process.env.SECRET_TEST : process.env.SECRET

module.exports={
    MONGODB_URI,
    PORT,
    SECRET,
    NODE_ENV,
}
