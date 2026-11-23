import { test, expect } from '@playwright/test';
import { TEST_USERS, PB_URL } from '../fixtures/test-data';

test.describe('Suite 8: Database & Backend Direct Verification Suite', () => {
  let adminToken: string = '';

  test.beforeAll(async () => {
    try {
      const adminRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: TEST_USERS.admin.email, password: TEST_USERS.admin.password }),
      });
      if (adminRes.ok) {
        const d = await adminRes.json();
        adminToken = d.token;
      }
    } catch (_e) {}
  });

  test('TC-DB-001: Direct verification of PocketBase records across collections', async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: adminToken,
    };

    const collections = [
      'users',
      'companies',
      'shipping_defaults',
      'booking_requests',
      'booking_containers',
      'schedule_change_requests',
      'schedule_change_items',
      'transport_progress',
      'notifications',
    ];

    for (const coll of collections) {
      const res = await fetch(`${PB_URL}/api/collections/${coll}/records?perPage=5`, {
        headers,
      });

      // Assert collection endpoint exists and responds with 200 OK
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.totalItems).toBeGreaterThanOrEqual(0);
    }
  });
});
