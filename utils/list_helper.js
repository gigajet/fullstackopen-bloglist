const _=require('lodash')

const dummy=(blogs)=>{
  return 1
}

const totalLikes=(blogs)=>{
  return blogs ? blogs.reduce((acc,blog)=>acc+blog.likes, 0) : 0
}

const favoriteBlog=(blogs)=>{
  if (!blogs || blogs.length==0) {
    return null
  }
  return _.reduce(blogs, (acc, value)=>{
    if (value.likes > acc.likes) {
      return value
    } else {
      return acc
    }
  })
}

const mostBlogs=(blogs)=>{
  if (!blogs || blogs.length==0) {
    return null
  }
  const countByAuthor=_.countBy(blogs,blog=>blog.author)
  const authorsByCount=_.map(countByAuthor, (value,index)=>{
    return {
      author: index,
      blogs: value
    }
  })
  return _.reduce(authorsByCount, (acc, value)=>{
    if (value.blogs > acc.blogs) {
      return value
    } else {
      return acc
    }
  })
}

const mostLikes=(blogs)=>{
  if (!blogs || blogs.length==0) {
    return null
  }
  const blogsByAuthor=_.groupBy(blogs,'author')
  const topAuthor=_.reduce(blogsByAuthor, (acc, authorBlogs, author)=>{
    const likes=_.reduce(authorBlogs, (acc, blog)=>acc+blog.likes, 0)
    if (likes > acc.likes) {
      return {author: author, likes: likes}
    } else {
      return acc
    }
  }, {author: "dummy", likes: -1})
  return topAuthor
}

module.exports={
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
