import { render, screen } from "@testing-library/react";
import Blog from "./Blog";
import { expect, vi } from "vitest";
import { string } from "prop-types";
import userEvent from '@testing-library/user-event'

test('blog is displaying only title and author initially', async ()=>{
  const blog={
    title: 'Từ thế ca',
    author: 'a',
    url: 'https://gokuraku-shujo.blogspot.com/2018/01/tu-ca.html',
    likes: 2,
  }
  const { container } = render(<Blog blog={blog}/>)
  const elem = screen.getByText(blog.title, {exact: false})
  expect(elem).toBeDefined()
  const elemByUrl = screen.queryByText(blog.url, {exact: false})
  expect(elemByUrl).toBeNull()
  const elemByLikes = screen.queryByText(blog.likes.toString(), {exact: false})
  expect(elemByLikes).toBeNull()
})

test('blog displays url and like after clicking button', async ()=>{
  const blog={
    title: 'Từ thế ca',
    author: 'anh a từ gokuraku',
    url: 'https://gokuraku-shujo.blogspot.com/2018/01/tu-ca.html',
    likes: 2,
  }
  const { container } = render(<Blog blog={blog}/>)
  const elem = screen.getByText(blog.title, {exact: false})
  expect(elem).toBeDefined()
  const button = screen.getByText('view')
  const user = userEvent.setup()
  await user.click(button)
  const elemByName = screen.queryByText(blog.author, {exact: false})
  expect(elemByName).toBeDefined()
  const elemByAuthor = screen.queryByText(blog.title, {exact: false})
  expect(elemByAuthor).toBeDefined()
  const elemByUrl = screen.queryByText(blog.url, {exact: false})
  expect(elemByUrl).toBeDefined()
  const elemByLikes = screen.queryByText(`likes ${blog.likes}`, {exact: true})
  expect(elemByLikes).toBeDefined()
})

test('like handler is called with right number of times', async ()=>{
  const blog={
    title: 'Từ thế ca',
    author: 'anh a từ gokuraku',
    url: 'https://gokuraku-shujo.blogspot.com/2018/01/tu-ca.html',
    likes: 2,
  }
  const handleLike=vi.fn()
  const { container } = render(<Blog blog={blog} handleLike={handleLike}/>)
  const user=userEvent.setup()
  const viewButton = screen.getByText('view')
  await user.click(viewButton)
  const likeButton=screen.getByText('like')
  await likeButton.click()
  await likeButton.click()
  expect(handleLike.mock.calls.length === 2)
})

