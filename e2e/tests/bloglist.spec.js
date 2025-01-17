// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith, createBlog, setUpBlogs } = require('./helper')

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

    test('user can delete a blog they created', async ({ page }) => {
      await createBlog(page, {
        title: 'Cartesian tree',
        author: 'Mario Ynocente Castro',
        url: 'https://codeforces.com/blog/entry/3767',
      })
      await expect(page.locator('.blog').getByText('Cartesian tree')).toBeVisible()
      await page.locator('.blog').getByText('view').click()
      await expect(page.getByRole('button').getByText('remove')).toBeVisible()
      page.on('dialog', dialog=>dialog.accept())
      await page.getByRole('button').getByText('remove').click()
      await expect(page.locator('.blog').getByText('Cartesian tree')).not.toBeVisible()
    })

    test('user cannot delete a blog they did not create', async ({ page, request }) => {
      await request.post('/api/users', {
        data: {
          username: 'another',
          name: 'Another User',
          password: '123456789'
        }
      })
      const blog = {
        title: 'Lòng yêu nước: Truyền thống ngàn đời hay truyền thống tân tạo?',
        author: 'Nguyễn Tuấn Linh',
        url: 'https://spiderum.com/bai-dang/Long-yeu-nuoc-Truyen-thong-ngan-doi-hay-truyen-thong-tan-tao-iEZ2Lm0feZxv',
      }
      await createBlog(page, blog)
      await page.getByRole('button').getByText('logout').click()
      await loginWith(page, 'another', '123456789')
      await expect(page.locator('.blog').getByText(blog.title)).toBeVisible()
      await page.locator('.blog').getByText('view').click()
      await expect(page.getByRole('button').getByText('remove')).not.toBeVisible()
    })

    test('blogs are arranged in the decreasing order of likes', async ({ page })=>{
      const blogs=[
        {
          title: 'Tutorial on FFT/NTT — The tough made simple',
          author: 'Sidhant Bansal',
          url: 'https://codeforces.com/blog/entry/43499',
          likes: 3,
        },
        {
          title: 'Z Algorithm',
          author: 'Jeffrey Wang',
          url: 'https://codeforces.com/blog/entry/3107',
          likes: 4,
        },
        {
          title: 'Cartesian tree',
          author: 'Mario Ynocente Castro',
          url: 'https://codeforces.com/blog/entry/3767',
          likes: 9,
        },
        {
          title: 'Lòng yêu nước: Truyền thống ngàn đời hay truyền thống tân tạo?',
          author: 'Nguyễn Tuấn Linh',
          url: 'https://spiderum.com/bai-dang/Long-yeu-nuoc-Truyen-thong-ngan-doi-hay-truyen-thong-tan-tao-iEZ2Lm0feZxv',
          likes: 5,
        },
      ]
      await setUpBlogs(page, blogs)
      const blogLocators=await page.locator('.blog').all()
      const blogLikes=[]
      for (const loc of blogLocators) {
        await loc.getByRole('button').getByText('view').click()
        const likesDiv=loc.getByText('likes', {exact:false})
        const text = await likesDiv.evaluate(elem=>{
          return elem.childNodes.item(1).textContent
        })
        blogLikes.push(Number(text))
        await loc.getByRole('button').getByText('hide').click()
      }
      await expect(blogLikes.length).toStrictEqual(blogs.length)
      for (let i=1; i<blogLikes.length; i+=1) {
        await expect(blogLikes[i-1]).toBeGreaterThanOrEqual(blogLikes[i])
      }
    })
  })
})