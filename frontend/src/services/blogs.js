import axios from 'axios'
const baseUrl = '/api/blogs'

let authToken = null

const setToken = (newToken) => {
  authToken = newToken
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async (blog) => {
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

const update=async (blog) => {
  const url=`${baseUrl}/${blog.id}`
  const response = await axios.put(url, blog)
  return response.data
}

const remove=async (blog) => {
  let headers = {}
  if (authToken) {
    headers = {
      Authorization: `Bearer ${authToken}`
    }
  }
  const url=`${baseUrl}/${blog.id}`
  const response = await axios.delete(url, {
    headers: headers,
  })
  return response.data
}

export default { getAll, setToken, create, update, remove }