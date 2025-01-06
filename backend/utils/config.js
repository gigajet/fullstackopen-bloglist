require('dotenv').config()

const MONGODB_URI=process.env.NODE_ENV==='test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI
const PORT=process.env.PORT
const SECRET=process.env.NODE_ENV==='test' ? process.env.SECRET_TEST : process.env.SECRET

module.exports={
    MONGODB_URI,
    PORT,
    SECRET,
}
