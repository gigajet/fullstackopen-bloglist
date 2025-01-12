
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
}

module.exports={ loginWith, createBlog }
