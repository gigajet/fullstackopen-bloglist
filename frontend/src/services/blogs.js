import axios from 'axios'
const baseUrl = '/api/blogs'

let authToken=null

const setToken=(newToken)=>{
  authToken=newToken
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async (blog)=> {
  let headers = {}
  if (authToken) {
    headers = {
      Authorization: `Bearer ${authToken}`
    }
  }
  const response = await axios.post(baseUrl, blog, {
    headers: headers,
  })
  return response.data
}

export default { getAll, setToken, create }