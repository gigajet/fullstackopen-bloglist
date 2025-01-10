import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import style from './app.module.css'
import Toggleable from './components/Toggleable'
import NewBlogForm from './components/NewBlogForm'

const ErrorMsg=({errorMsg, statusMsg})=>{
  if (statusMsg) {
    return (
      <>
        <p className={style.status}>{statusMsg}</p>
      </>
    )
  } else if (errorMsg) {
    return (
      <>
        <p className={style.error}>{errorMsg}</p>
      </>
    )
  }
}

const LoginForm=({username, password, setUsername, setPassword, setError, handleLogin})=>{
  return (
    <>
      <h2>login to the application</h2>
      <form onSubmit={async (ev)=>{
          ev.preventDefault()
          try {
            await handleLogin(username, password)
            setUsername('')
            setPassword('')
            setError(null)
          } catch (e) {
            setError('invalid credentials')
          }
        }}>
        <div>
        username: <input type='text' name='username' onChange={({target})=>{setUsername(target.value)}} />
        </div>
        <div>
        password: <input type='password' name='password' onChange={({target})=>{setPassword(target.value)}} />
        </div>
        <button type='submit'>login</button>
      </form>
    </>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername]=useState('')
  const [password, setPassword]=useState('')
  const [errorMsg, setErrorMsg]=useState(null)
  const [statusMsg, setStatusMsg]=useState(null)
  const [title, setTitle]=useState('')
  const [author, setAuthor]=useState('')
  const [url, setUrl]=useState('')

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])
  useEffect(()=>{
    const u=window.localStorage.getItem('bloglistLoggedUser')
    if (u) {
      const user=JSON.parse(u)
      setUser(u)
      blogService.setToken(user.token)
    }
  }, [])

  const setError=(errorMsg)=>{
    setStatusMsg(null)
    setErrorMsg(errorMsg)
    if (errorMsg) {
      setTimeout(()=>{
        setErrorMsg(null)
      },5000)
      console.log('Error', errorMsg)
    }
  }

  const setStatus=(statusMsg)=>{
    setErrorMsg(null)
    setStatusMsg(statusMsg)
    if (statusMsg) {
      setTimeout(()=>{
        setStatusMsg(null)
      },5000)
      console.log('Status', statusMsg)
    }
  }

  const handleLogin=async (username, password) => {
    console.log('handleLogin',username,password)
    const user=await loginService.login({username, password})
    console.log('user', user)
    setUser(user)
    blogService.setToken(user.token)
    window.localStorage.setItem('bloglistLoggedUser', JSON.stringify(user))
  }

  const handleLogout=()=>{
    window.localStorage.removeItem('bloglistLoggedUser')
    setUser(null)
    setStatus('Logged out')
  }

  const newBlogRef=useRef()

  const addBlog=async (blogObj)=>{
    newBlogRef.current.setVisibility(false)
    console.log('addBlog',blogObj)
    const blog = await blogService.create(blogObj)
    setBlogs(blogs.concat(blog))
    setStatus(`New blog added: ${title} by ${author}`)
  }

  const handleLike=async (blogObj)=>{
    const reqObj={
      ...blogObj,
      likes: blogObj.likes+1,
      user: blogObj.user ? blogObj.user.id : blogObj.user,
    }
    console.log('reqObj',reqObj)
    if (blogObj.user && blogObj.user._id) {
      reqObj.user=blogObj.user._id.toString()
    }
    try {
      const blog=await blogService.update(reqObj)
      const newBlogs=blogs.map(b=>{
        if (b.id===blog.id) {
          return blog
        } else {
          return b
        }
      })
      setBlogs(newBlogs)
    } catch (e) {
      setError(`${e.name}: ${e.message}`)
    }
  }

  const Blogs=()=>{
    return (
      <>
        <h2>blogs</h2>
        <div>Welcome, {user.name} <button onClick={handleLogout}>logout</button></div>
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} handleLike={handleLike} />
        )}
        <Toggleable buttonLabel='new note' ref={newBlogRef}>
          <NewBlogForm addBlog={addBlog} />
        </Toggleable>
      </>
    )
  }

  return (
    <div>
      <ErrorMsg errorMsg={errorMsg} statusMsg={statusMsg} />
      {user===null && LoginForm({username, setUsername, password, setPassword, setError, handleLogin})}
      {user!==null && Blogs()}
    </div>
  )
}

export default App