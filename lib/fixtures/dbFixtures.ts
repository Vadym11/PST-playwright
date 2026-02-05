import { test as base } from '@playwright/test';
import connection from '@utils/mysqldb';
import { RowDataPacket } from 'mysql2';

type dbFixtures = {
  getNewUserId: string;
};

export const test = base.extend<dbFixtures>({
  getNewUserId: async ({}, use) => {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;',
    );
    const newUser = rows[0];

    await use(newUser.id);
  },
});
