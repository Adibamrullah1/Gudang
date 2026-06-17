import { test, expect } from '@playwright/test';

test.describe('Order Form E2E', () => {
  test('should fill and submit a new order successfully', async ({ page }) => {
    // 1. Intercept the Google Sheets API route so we don't actually spam real sheets during testing
    // Since we don't want to actually write to the real Google Sheets during automated tests
    await page.route('/api/orders', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        // Validate that we received expected data structure
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('total_amount', 150000);
        
        // Mock successful response
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: body }),
        });
      } else {
        await route.continue();
      }
    });

    // 2. Navigate to form page
    await page.goto('/orders/new');

    // 3. Ensure the form is loaded
    await expect(page.getByRole('heading', { name: 'Buat Pesanan Baru' })).toBeVisible();

    // 4. Fill the form
    await page.getByTestId('input-status').selectOption('Pending');
    await page.getByTestId('input-total').fill('150000');
    await page.getByTestId('input-paid').fill('50000');

    // 5. Submit the form
    await page.getByTestId('submit-button').click();

    // 6. Verify successful submission message
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('success-message')).toContainText('Pesanan berhasil disimpan ke dalam sistem.');
  });
});
