import { expect, type Locator, type Page } from '@playwright/test';
import { quotedValues } from '../dsl/parser.js';
import type { StepHandler } from '../dsl/runner.js';

export type DemoAppContext = {
  page: Page;
  credentials: {
    username: string;
    password: string;
  };
  lastTaskCard?: Locator;
  lastTaskTitle?: string;
};

export const demoAppSteps: StepHandler<DemoAppContext>[] = [
  {
    pattern: /^Login to Demo App$/i,
    example: 'Login to Demo App',
    async run({ page, credentials }) {
      await page.goto('/');
      await page.getByLabel('Username').fill(credentials.username);
      await page.getByLabel('Password').fill(credentials.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    }
  },
  {
    pattern: /^Navigate to "([^"]+)"$/i,
    example: 'Navigate to "Web Application"',
    async run({ page }, match) {
      const projectName = cleanQuotedValue(match[1]);

      await page
        .getByRole('button', { name: new RegExp(`^${escapeRegExp(projectName)}\\b`) })
        .click();

      await expect(page.locator('header').getByRole('heading', { name: projectName })).toBeVisible();
    }
  },
  {
    pattern: /^Verify "([^"]+)" is in the "([^"]+)" column$/i,
    example: 'Verify "Implement user authentication" is in the "To Do" column',
    async run(context, match) {
      const taskTitle = cleanQuotedValue(match[1]);
      const columnTitle = cleanQuotedValue(match[2]);
      const column = findColumn(context.page, columnTitle);
      const taskHeading = column.getByRole('heading', { name: taskTitle, exact: true });
      const taskCard = findTaskCard(taskHeading);

      await expect(column).toBeVisible();
      await expect(taskHeading).toBeVisible();
      await expect(taskCard).toBeVisible();

      context.lastTaskCard = taskCard;
      context.lastTaskTitle = taskTitle;
    }
  },
  {
    pattern: /^Confirm tags:\s*"[^"]+"(?:\s*(?:&|and)?\s*"[^"]+")*$/i,
    example: 'Confirm tags: "Feature" "High Priority"',
    async run(context, _match, step) {
      if (!context.lastTaskCard) {
        throw new Error(`Confirm tags must come after a task verification step. Failed at ${step.sourceFile}:${step.line}`);
      }

      for (const tag of quotedValues(step.text)) {
        await expect(context.lastTaskCard.getByText(cleanQuotedValue(tag), { exact: true })).toBeVisible();
      }
    }
  },
  {
    pattern: /^Exit$/i,
    example: 'Exit',
    async run({ page }) {
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('heading', { name: 'Project Board Login' })).toBeVisible();
    }
  }
];

function findColumn(page: Page, columnTitle: string): Locator {
  return page
    .locator('main')
    .getByRole('heading', { name: new RegExp(`^${escapeRegExp(columnTitle)}\\s*\\(`) })
    .locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " w-80 ")][1]');
}

function findTaskCard(taskHeading: Locator): Locator {
  return taskHeading.locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " border-gray-200 ")][1]'
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanQuotedValue(value: string): string {
  return value.trim().replace(/[.;]+$/g, '').trim();
}
