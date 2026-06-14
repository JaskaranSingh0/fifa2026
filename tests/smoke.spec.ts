import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Cinematic Portals Smoke Tests', () => {
  
  test('Homepage particle universe loads without 500 error', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/`);
    expect(response?.status()).toBe(200);
    // Verify the massive navigation portals exist
    await expect(page.locator('text=MATCHES').first()).toBeVisible();
    await expect(page.locator('text=TEAMS').first()).toBeVisible();
  });

  test('Matches archive page loads cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/matches`);
    expect(response?.status()).toBe(200);
    // Verify editorial header
    await expect(page.locator('h1:has-text("Matches")')).toBeVisible();
  });

  test('Teams 3D Globe page loads cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/teams`);
    expect(response?.status()).toBe(200);
  });

  test('Stadiums host geography page loads cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/stadiums`);
    expect(response?.status()).toBe(200);
  });

  test('Groups structure page loads cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/groups`);
    expect(response?.status()).toBe(200);
  });

  test('Bracket page loads cleanly', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/bracket`);
    expect(response?.status()).toBe(200);
  });
  
});

test.describe('API Endpoint Security', () => {
  test('Sync endpoint denies unauthorized requests', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/matches/sync`);
    expect(response.status()).toBe(401);
  });
});
