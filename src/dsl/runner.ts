import { test } from '@playwright/test';
import type { EnglishStep } from './parser.js';

export type StepHandler<TContext> = {
  pattern: RegExp;
  example: string;
  run: (context: TContext, match: RegExpMatchArray, step: EnglishStep) => Promise<void>;
};

export type RunEnglishStepsOptions<TContext> = {
  afterStep?: (context: TContext, step: EnglishStep) => Promise<void>;
};

export async function runEnglishSteps<TContext>(
  context: TContext,
  steps: EnglishStep[],
  handlers: StepHandler<TContext>[],
  options: RunEnglishStepsOptions<TContext> = {}
): Promise<void> {
  for (const step of steps) {
    const handlerMatch = findHandler(step, handlers);

    await test.step(step.text, async () => {
      if (!handlerMatch) {
        const supportedSteps = handlers.map((handler) => `- ${handler.example}`).join('\n');
        throw new Error(
          `No step definition matched ${step.sourceFile}:${step.line}\n\n` +
            `Step: ${step.text}\n\n` +
            `Supported steps:\n${supportedSteps}`
        );
      }

      await handlerMatch.handler.run(context, handlerMatch.match, step);
      await options.afterStep?.(context, step);
    });
  }
}

function findHandler<TContext>(
  step: EnglishStep,
  handlers: StepHandler<TContext>[]
): { handler: StepHandler<TContext>; match: RegExpMatchArray } | undefined {
  for (const handler of handlers) {
    const match = step.text.match(handler.pattern);
    if (match) {
      return { handler, match };
    }
  }

  return undefined;
}
