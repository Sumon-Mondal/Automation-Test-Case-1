import { readFileSync, readdirSync, type Dirent } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';
import { parseEnglishFeature } from '../src/dsl/parser.js';
import { runEnglishSteps } from '../src/dsl/runner.js';
import { demoAppSteps, type DemoAppContext } from '../src/steps/demoAppSteps.js';

type EnglishSuite = {
  title: string;
  filePath: string;
  relativePath: string;
};

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const featuresRoot = path.join(projectRoot, 'features');
const stepDelayMs = numberFromEnv('STEP_DELAY_MS', 0);
const suites = filterSuites(findEnglishSuites(featuresRoot), process.env.ENGLISH_SUITE);

if (suites.length === 0) {
  throw new Error(
    `No English test suites matched ENGLISH_SUITE="${process.env.ENGLISH_SUITE}". ` +
      'Try a value like test-case-1, Test Case 1, or features/test-case-1.english.'
  );
}

test.describe('English demo app suites', () => {
  for (const suite of suites) {
    test(`${suite.title} (${suite.relativePath})`, async ({ page }) => {
      const source = readFileSync(suite.filePath, 'utf8');
      const steps = parseEnglishFeature(source, suite.filePath);
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
  }
});

function findEnglishSuites(directory: string): EnglishSuite[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry: Dirent) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findEnglishSuites(entryPath);
      }

      if (!entry.isFile() || !entry.name.endsWith('.english')) {
        return [];
      }

      return [
        {
          title: titleFromFile(entry.name),
          filePath: entryPath,
          relativePath: path.relative(projectRoot, entryPath)
        }
      ];
    })
    .sort((first, second) => first.relativePath.localeCompare(second.relativePath));
}

function filterSuites(suitesToFilter: EnglishSuite[], selector: string | undefined): EnglishSuite[] {
  if (!selector) {
    return suitesToFilter;
  }

  const selectedNames = selector
    .split(',')
    .map((value) => normalizeName(value))
    .filter(Boolean);

  return suitesToFilter.filter((suite) => {
    const suiteNames = [suite.title, suite.relativePath, path.basename(suite.filePath, '.english')].map(normalizeName);

    return selectedNames.some((selectedName) =>
      suiteNames.some((suiteName) => suiteName.includes(selectedName) || selectedName.includes(suiteName))
    );
  });
}

function titleFromFile(fileName: string): string {
  return path
    .basename(fileName, '.english')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/\.english$/i, '').replace(/[^a-z0-9]+/g, '');
}

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}
