// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', ()=>{
  beforeEach(async ({ page })=> {
    await page.goto('/')
  })

  test('login form is shown', async ({ page })=>{
    const loginForm=await page.getByRole('form')
    await expect(loginForm).toBeDefined()
    const usernameInput=await page.getByTestId('username')
    const passwordInput=await page.getByTestId('password')
    await expect(usernameInput).toBeDefined()
    await expect(passwordInput).toBeDefined()
  })

  describe('Login', ()=>{
    beforeEach(async ({ page, request }) => {
      await request.post('/api/tests/reset')
      await request.post('/api/users', {
        data: {
          username: 'gigajet',
          name: 'Nguyen Le Minh',
          password: '123456789'
        }
      })
    })

    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'gigajet', '123456789')
      const welcomeText=await page.getByText('Welcome, Nguyen Le Minh', {exact: false})
      await expect(welcomeText).toBeVisible()
    })

    test('fails with wrong credentials with error message', async ({ page }) => {
      await loginWith(page, 'wronguser', '123123123')
      const errorText=await page.getByText('invalid credentials', {exact: false})
      await expect(errorText).toBeVisible()
    })
  })

  describe('When logged in', ()=>{
    beforeEach(async ({ page, request }) => {
      await request.post('/api/tests/reset')
      await request.post('/api/users', {
        data: {
          username: 'gigajet',
          name: 'Nguyen Le Minh',
          password: '123456789'
        }
      })
      // Without this, we may have duplicate blogs, not sure why
      // Perhaps a reload here cause react state to reset, and there's something wrong...
      await page.reload()
      await loginWith(page, 'gigajet', '123456789')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'Tutorial on FFT/NTT — The tough made simple',
        author: 'Sidhant Bansal',
        url: 'https://codeforces.com/blog/entry/43499',
      })
      await expect(page.locator('.blog').getByText('Tutorial on FFT/NTT — The tough made simple')).toBeVisible()
    })

    test('created blog can be liked', async ({ page }) => {
      await createBlog(page, {
        title: 'Z Algorithm',
        author: 'Jeffrey Wang',
        url: 'https://codeforces.com/blog/entry/3107',
      })
      await expect(page.locator('.blog').getByText('Z Algorithm')).toBeVisible()
      await page.locator('.blog').getByText('view').click()
      await expect(page.getByText('likes 0', { exact: false })).toBeVisible()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1', { exact: false })).toBeVisible()
    })
  })
})