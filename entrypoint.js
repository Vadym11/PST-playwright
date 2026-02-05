#!/usr/bin/env node
import fs from 'fs';

import { spawn }  from 'child_process';
import axios from 'axios';

// --- Config from env ---
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const TEST_NAME = process.env.TEST_NAME || 'Playwright test run';

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

async function sendSlackNotification({ exitCode, durationMs }) {
  if (!SLACK_WEBHOOK) {
    console.log('SLACK_WEBHOOK not set, skipping Slack notification.');
    return;
  }

  const durationHHMMSS = formatDuration(durationMs);
  const success = exitCode === 0;

  const descriptors = success
    ? { icon: ':tada:', text: 'passed' }
    : { icon: ':red_circle:', text: 'failed' };

  const messageLines = [
    `*Test run:* ${TEST_NAME}`,
    `*Status:* ${success ? 'PASSED' : 'FAILED'}`,
    `*Exit code:* ${exitCode}`,
    `*Duration:* ${durationHHMMSS}`,
  ];

  let resultString = messageLines.join('\n');
  if (resultString.length > 3000) {
    resultString = `${resultString.substring(0, 2997)}...`;
  }

  try {
    await axios.post(
      SLACK_WEBHOOK,
      {
        blocks: [
          {
            type: 'section',
            text: {
              text: `${descriptors.icon} ${TEST_NAME} has *${descriptors.text}*.`,
              type: 'mrkdwn',
            },
          },
          {
            type: 'section',
            text: {
              text: resultString,
              type: 'mrkdwn',
            },
          },
        ],
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
    console.log('Slack notification sent.');
  } catch (err) {
    console.error('Failed to send Slack notification:', err.message || err);
    // I wouldn’t fail the whole run just because Slack is down.
  }
}

(async () => {
  console.log('Starting Playwright test run...');
  console.log('TEST_NAME:', TEST_NAME);
  console.log('SLACK_WEBHOOK set:', !!SLACK_WEBHOOK);

  const start = Date.now();

  // Run: npx playwright test
  const proc = spawn('npx', ['playwright', 'test'], {
    stdio: 'inherit', // stream test output directly to container logs
  });

  proc.on('close', async (code) => {
    const durationMs = Date.now() - start;
    console.log(
      `Playwright finished with exit code ${code}, duration ${durationMs}ms`
    );

    await sendSlackNotification({ exitCode: code, durationMs });

    fs.writeFileSync('/tests/tests_finished.txt', code.toString());

    const delayMinutes = 3;
    console.log(`Waiting ${delayMinutes} minutes for artifact collection before exiting...`);
    
    setTimeout(() => {
      console.log('Exiting now.');
      process.exit(code);
    }, delayMinutes * 60 * 1000); 
  });

  proc.on('error', (err) => {
    console.error('Failed to start Playwright process:', err);
    process.exit(1);
  });
})();