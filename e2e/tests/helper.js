
const loginWith=async (page, username, password)=>{
  const usernameInput=await page.getByTestId('username')
  const passwordInput=await page.getByTestId('password')
  await usernameInput.fill(username)
  await passwordInput.fill(password)
  const loginButton=await page.getByRole('button', {name: 'login'})
  await loginButton.click()
}

const createBlog=async (page, {title, author, url})=>{
  await page.getByRole('button', {name: 'new blog'}).click()
  await page.locator('input[name="title"]').fill(title)
  await page.locator('input[name="author"]').fill(author)
  await page.locator('input[name="url"]').fill(url)
  await page.getByRole('button', {name: 'create'}).click()
  await page.locator('.blog').getByText(`${title} - `, {exact: false}).waitFor()
}

const setUpBlogs=async (page, blogs)=>{
  for (const blog of blogs) {
    const blogObj={...blog}
    delete blogObj.likes
    await createBlog(page,blog)
    await page.getByText(`${blog.title} - ${blog.author}`).getByText('view').click()
    for (let i=0; i<blog.likes; i+=1) {
      // Wait for backend to process the like
      await page.getByRole('button').getByText('like').click()
      await page.getByText('likes').last().getByText(`likes ${i+1}`,{exact:false}).waitFor()
    }
    await page.locator('.blog').getByRole('button').getByText('hide').click()
  }
}

module.exports={ loginWith, createBlog, setUpBlogs }
