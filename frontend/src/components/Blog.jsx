import { useState } from 'react'

const Blog = ({ blog, handleLike, handleRemove, user }) => {
  const [showDetail, setShowDetail]=useState(false)
  const blogStyle={
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }
  let blogUser = ''
  if (blog.user && blog.user.name) {
    blogUser=blog.user.name
  }
  const removeButton=() => {
    return (
      <div>
        <button onClick={async () => {await handleRemove(blog)}}>remove</button>
      </div>
    )
  }
  const blogCreator=blog.user ? blog.user.username : ''
  const loggedInUser=user ? user.username : null
  if (showDetail) {
    return (
      <div>
        <div style={blogStyle}>
          <div>
            {blog.title} - {blog.author}
            <button onClick={() => setShowDetail(false)}>hide</button>
          </div>
          <div>
            {blog.url}
          </div>
          <div>
            likes {blog.likes}
            <button onClick={async () => {await handleLike(blog)}}>like</button>
          </div>
          <div>
            {blogUser}
          </div>
          {blogCreator===loggedInUser && removeButton()}
        </div>
      </div>
    )
  } else {
    return (
      <div style={blogStyle}>
        {blog.title} - {blog.author}
        <button onClick={() => setShowDetail(true)}>view</button>
      </div>
    )
  }
}

export default Blog