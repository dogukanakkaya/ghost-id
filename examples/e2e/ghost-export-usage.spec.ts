import { test, expect, Page } from '@playwright/test';
import { GHOST_IDS, getGhostSelector, getGhostSelectorPartial } from './ghost-ids';

test.describe('Using Exported Ghost IDs', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should use exact ghost selectors from export', async ({ page }) => {
        const usernameSelector = getGhostSelector('LoginForm-username');
        const passwordSelector = getGhostSelector('LoginForm-password');

        await page.fill(usernameSelector, 'testuser');
        await page.fill(passwordSelector, 'password123');

        await expect(page.locator(usernameSelector)).toHaveValue('testuser');
        await expect(page.locator(passwordSelector)).toHaveValue('password123');
    });

    test('should use partial ghost selectors (recommended)', async ({ page }) => {
        const usernameSelector = getGhostSelectorPartial('LoginForm-username');
        const passwordSelector = getGhostSelectorPartial('LoginForm-password');
        const submitSelector = getGhostSelectorPartial('LoginForm-submit');
        
        await page.fill(usernameSelector, 'testuser');
        await page.fill(passwordSelector, 'password123');

        page.on('dialog', async dialog => {
            expect(dialog.message()).toBe('Logging in as: testuser');
            await dialog.accept();
        });

        await page.click(submitSelector);
    });

    test('should work with Page Object Model', async ({ page }) => {
        class LoginPage {
            constructor(private page: Page) { }

            get usernameInput() {
                return this.page.locator(getGhostSelector('LoginForm-username'));
            }

            get passwordInput() {
                return this.page.locator(getGhostSelector('LoginForm-password'));
            }

            get submitButton() {
                return this.page.locator(getGhostSelector('LoginForm-submit'));
            }

            get cancelButton() {
                return this.page.locator(getGhostSelector('LoginForm-cancel'));
            }

            async login(username: string, password: string) {
                await this.usernameInput.fill(username);
                await this.passwordInput.fill(password);
                await this.submitButton.click();
            }

            async clearForm() {
                await this.cancelButton.click();
            }
        }

        const loginPage = new LoginPage(page);
        await loginPage.login('testuser', 'password123');
        await expect(loginPage.usernameInput).toHaveValue('testuser');
    });

    test('should access raw ghost IDs', async ({ page }) => {
        const loginButtonId = GHOST_IDS['LoginButton'];
        expect(loginButtonId).toMatch(/^gh-LoginButton-[a-z0-9]+$/);

        await page.click(`[data-gh="${loginButtonId}"]`);
    });

    test('should iterate over all ghost IDs', async ({ page }) => {
        const allIds = Object.entries(GHOST_IDS);

        console.log(`Total ghost IDs: ${allIds.length}`);

        for (const [key, id] of allIds) {
            console.log(`${key} -> ${id}`);

            // Verify each element exists (some might not be visible)
            const element = page.locator(`[data-gh="${id}"]`);
            const count = await element.count();

            if (count > 0) {
                console.log(`  ✅ Found ${count} element(s) with ID: ${id}`);
            }
        }
    });
});

test.describe('Data-driven tests', () => {
    const testCases = [
        { username: 'user1', password: 'pass1' },
        { username: 'user2', password: 'pass2' },
        { username: 'admin', password: 'admin123' },
    ];

    for (const testCase of testCases) {
        test(`should login with ${testCase.username}`, async ({ page }) => {
            await page.goto('/');

            await page.fill(
                getGhostSelector('LoginForm-username'),
                testCase.username
            );
            await page.fill(
                getGhostSelector('LoginForm-password'),
                testCase.password
            );

            page.on('dialog', dialog => dialog.accept());
            await page.click(getGhostSelector('LoginForm-submit'));
        });
    }
});
