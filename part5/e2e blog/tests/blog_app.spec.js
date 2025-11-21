const { test, expect, beforeEach, describe } = require('@playwright/test')
const { createBlog, loginWith } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'testUser',
        username: 'testUser',
        password: 'testPass'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const username = page.getByRole('textbox', { name: 'username' })
    const password = page.getByRole('textbox', { name: 'password' })
    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {

      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, 'mluukkai', 'salainen')

      })

      describe('Create Blog', () => {
        beforeEach(async ({ page }) => {
          await createBlog(page, { title: 'first note', author: 'tester', url: 'http://example.com' })

        })

        test('a new blog can be created', async ({ page }) => {
          await expect(page.locator('label').filter({ hasText: 'first note' })).toBeVisible()
        })

        test('can be liked', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          await page.getByRole('button', { name: 'like' }).click()
          await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('can be deleted', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()

          page.once('dialog', dialog => dialog.accept())

          await page.getByRole('button', { name: 'delete' }).click()
          await expect(page.getByText('first note')).toHaveCount(0)
        })

        test('only user created can see', async ({ page }) => {
          await page.getByRole('button', { name: 'logout' }).click()
          await loginWith(page, 'testUser', 'testPass')
          await page.getByRole('button', { name: 'view' }).click()
          await expect(page.getByRole('button', { name: 'delete' })).not.toBeVisible()
        })

      })

      describe('Create Blogs', () => {
        beforeEach(async ({ page }) => {
          await createBlog(page, { title: 'first note', author: 'tester', url: 'http://example.com' })
          await createBlog(page, { title: 'second note', author: 'tester', url: 'http://example.com' })
          await createBlog(page, { title: 'third note', author: 'tester', url: 'http://example.com' })

        })

        test('check if is ordered by likes', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).nth(2).click()
          await page.getByRole('button', { name: 'like' }).click()
          await page.getByRole('button', { name: 'like' }).click()
          await page.getByRole('button', { name: 'like' }).click()
          await page.getByRole('button', { name: 'view' }).nth(0).click()
          await page.getByRole('button', { name: 'like' }).click()
          await expect(page.getByText('likes 1')).toBeVisible()
        })


      })


    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'sala')
      await expect(page.getByRole('heading', { name: 'wrong credentials' })).toBeVisible()
    })


  })
})