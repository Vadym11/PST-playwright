import { test as base } from '@playwright/test';
const connection = require('@utils/mysqldb');

type dbFixtures = {
  // adminLogin: APIResponse;
  getNewUserId: string;
};

export const test = base.extend<dbFixtures>({
  getNewUserId: async ({}, use) => {
    const [rows] = await connection.execute(
      'SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;',
    );
    const newUser = rows[0];

    await use(newUser.id);
  },
});
