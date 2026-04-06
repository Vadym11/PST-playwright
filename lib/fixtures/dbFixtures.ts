import { test as base } from '@playwright/test';
import connection from '@utils/mysql-db';
import { RowDataPacket } from 'mysql2';

type DbFixtures = {
  getNewUserId: string;
};

export const test = base.extend<DbFixtures>({
  getNewUserId: async ({}, use) => {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;',
    );
    const newUser = rows[0];

    await use(newUser.id);
  },
});
