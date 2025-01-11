import { render, screen } from '@testing-library/react'
import { assert, expect, vi } from 'vitest'
import NewBlogForm from './NewBlogForm'
import userEvent from '@testing-library/user-event'

test('blog form calls handler with correct blog object', async ()=>{
  const addBlog = vi.fn()
  const { container } = render(<NewBlogForm addBlog={addBlog}/>)
  const titleInput = container.querySelector('input[name="title"]')
  const authorInput = container.querySelector('input[name="author"]')
  const urlInput = container.querySelector('input[name="url"]')
  expect(container).toBeDefined()
  expect(titleInput).toBeDefined()
  expect(authorInput).toBeDefined()
  expect(urlInput).toBeDefined()
  const user = userEvent.setup()
  const blogToBeAdded = {
    title: "Avoid Nesting when you're Testing",
    author: "Kent C. Dodds",
    url: 'https://kentcdodds.com/blog/avoid-nesting-when-youre-testing',
  }
  await user.type(titleInput, blogToBeAdded.title)
  await user.type(authorInput, blogToBeAdded.author)
  await user.type(urlInput, blogToBeAdded.url)
  const button=screen.getByRole('button', {name: 'create'})
  await user.click(button)
  expect(addBlog.mock.calls.length === 1)
  const calledBlogObj = addBlog.mock.calls[0][0]
  console.log(blogToBeAdded,calledBlogObj)
  assert.deepStrictEqual(blogToBeAdded, calledBlogObj)
})