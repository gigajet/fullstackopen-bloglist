import { useState } from 'react'

const NewBlogForm=({ addBlog }) => {
  const [title, setTitle]=useState('')
  const [author,setAuthor]=useState('')
  const [url,setUrl]=useState('')

  const newBlog=async (ev) => {
    ev.preventDefault()
    const blogObj={
      title,
      author,
      url
    }
    await addBlog(blogObj)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={newBlog}>
        <div>title: <input type='text' name='title' value={title} onChange={({ target }) => setTitle(target.value)}/></div>
        <div>author: <input type='text' name='author' value={author} onChange={({ target }) => setAuthor(target.value)}/></div>
        <div>url: <input type='url' name='url' value={url} onChange={({ target }) => setUrl(target.value)}/></div>
        <button type='submit'>create</button>
      </form>
    </>
  )
}

export default NewBlogForm
