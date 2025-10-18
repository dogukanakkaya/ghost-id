import { test, expect } from '@playwright/test';

test.describe('Ghost - Auto Test ID Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have ghost IDs on LoginButton', async ({ page }) => {
    const loginButton = page.locator('[data-gh*="LoginButton"]');

    await expect(loginButton).toBeVisible();

    await expect(loginButton).toHaveText('Login');

    const ghostId = await loginButton.getAttribute('data-gh');
    expect(ghostId).toMatch(/^gh-LoginButton-[a-z0-9]+$/);
  });

  test('should interact with LoginButton using ghost selector', async ({ page }) => {
    await page.click('[data-gh*="LoginButton"]');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Login clicked!');
      await dialog.accept();
    });
  });

  test('should have unique ghost IDs for form inputs', async ({ page }) => {
    const usernameInput = page.locator('[data-gh*="username"]');
    const passwordInput = page.locator('[data-gh*="password"]');
    const submitButton = page.locator('[data-gh*="submit"]');
    const cancelButton = page.locator('[data-gh*="cancel"]');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    const usernameGhostId = await usernameInput.getAttribute('data-gh');
    const passwordGhostId = await passwordInput.getAttribute('data-gh');
    const submitGhostId = await submitButton.getAttribute('data-gh');
    const cancelGhostId = await cancelButton.getAttribute('data-gh');

    expect(usernameGhostId).not.toBe(passwordGhostId);
    expect(usernameGhostId).not.toBe(submitGhostId);
    expect(passwordGhostId).not.toBe(cancelGhostId);

    expect(usernameGhostId).toMatch(/^gh-LoginForm-username-[a-z0-9]+$/);
    expect(passwordGhostId).toMatch(/^gh-LoginForm-password-[a-z0-9]+$/);
  });

  test('should complete full login flow using ghost selectors', async ({ page }) => {
    await page.fill('[data-gh*="username"]', 'testuser');
    await page.fill('[data-gh*="password"]', 'password123');

    await expect(page.locator('[data-gh*="username"]')).toHaveValue('testuser');
    await expect(page.locator('[data-gh*="password"]')).toHaveValue('password123');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Logging in as: testuser');
      await dialog.accept();
    });

    await page.click('[data-gh*="submit"]');
  });

  test('should clear form using cancel button', async ({ page }) => {
    await page.fill('[data-gh*="username"]', 'testuser');
    await page.fill('[data-gh*="password"]', 'password123');

    await page.click('[data-gh*="cancel"]');

    await expect(page.locator('[data-gh*="username"]')).toHaveValue('');
    await expect(page.locator('[data-gh*="password"]')).toHaveValue('');
  });

  test('should have deterministic ghost IDs across page reloads', async ({ page }) => {
    const initialUsernameId = await page.locator('[data-gh*="username"]').getAttribute('data-gh');
    const initialSubmitId = await page.locator('[data-gh*="submit"]').getAttribute('data-gh');

    await page.reload();

    const reloadedUsernameId = await page.locator('[data-gh*="username"]').getAttribute('data-gh');
    const reloadedSubmitId = await page.locator('[data-gh*="submit"]').getAttribute('data-gh');

    expect(reloadedUsernameId).toBe(initialUsernameId);
    expect(reloadedSubmitId).toBe(initialSubmitId);
  });
});

test.describe('Ghost Selectors - Advanced Patterns', () => {
  test('should support partial matching for flexible selectors', async ({ page }) => {
    await page.goto('/');

    const anyLoginFormElement = page.locator('[data-gh*="LoginForm"]').first();
    await expect(anyLoginFormElement).toBeVisible();

    const specificInput = page.locator('[data-gh*="username"]');
    await expect(specificInput).toBeVisible();
  });

  test('should work with page object model pattern', async ({ page }) => {
    await page.goto('/');

    class LoginPage {
      constructor(private page: any) { }

      get usernameInput() {
        return this.page.locator('[data-gh*="username"]');
      }

      get passwordInput() {
        return this.page.locator('[data-gh*="password"]');
      }

      get submitButton() {
        return this.page.locator('[data-gh*="submit"]');
      }

      async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
      }
    }

    const loginPage = new LoginPage(page);
    await loginPage.login('testuser', 'password123');

    await expect(loginPage.usernameInput).toHaveValue('testuser');
  });
});
