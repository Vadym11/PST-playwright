import { test as baseTest } from '@playwright/test';

const test = baseTest.extend<{ comment: string }, { comment2: string }>({
  comment: async ({}, use) => {
    const textToPrint = 'This is printed from a test';
    console.log('Variable has been assigned');
    await use(textToPrint);
    console.log('Text has been printed');
  },

  comment2: [
    async ({}, use) => {
      const textToPrint = 'This is printed from a test';
      console.log('Variable has been assigned');
      await use(textToPrint);
      console.log('Text has been printed');
    },
    { scope: 'worker' },
  ],
});

export { test };
