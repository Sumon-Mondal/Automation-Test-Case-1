import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';
import { parseEnglishFeature } from '../src/dsl/parser.js';
import { runEnglishSteps } from '../src/dsl/runner.js';
import { demoAppSteps, type DemoAppContext } from '../src/steps/demoAppSteps.js';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const featurePath = path.join(projectRoot, 'features', 'demo-app.english');
const stepDelayMs = numberFromEnv('STEP_DELAY_MS', 0);

test('runs the demo app scenario from English steps', async ({ page }) => {
  const source = await readFile(featurePath, 'utf8');
  const steps = parseEnglishFeature(source, featurePath);
  const context: DemoAppContext = {
    page,
    credentials: {
      username: process.env.DEMO_APP_EMAIL ?? 'admin',
      password: process.env.DEMO_APP_PASSWORD ?? 'password123'
    }
  };

  await runEnglishSteps(context, steps, demoAppSteps, {
    afterStep:
      stepDelayMs > 0
        ? async () => {
            await page.waitForTimeout(stepDelayMs);
          }
        : undefined
  });
});

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}
