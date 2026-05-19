import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const playwrightCli = path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js');

const options = parseArgs(process.argv.slice(2));

if (!existsSync(playwrightCli)) {
  console.error('Playwright is not installed yet. Run `npm install` first.');
  process.exit(1);
}

const env = {
  ...process.env,
  ...(options.suite ? { ENGLISH_SUITE: options.suite } : {}),
  ...(options.visible
    ? {
        PLAYWRIGHT_SLOW_MO_MS: options.slowMoMs ?? process.env.PLAYWRIGHT_SLOW_MO_MS ?? '750',
        STEP_DELAY_MS: options.stepDelayMs ?? process.env.STEP_DELAY_MS ?? '1000'
      }
    : {}),
  ...(options.debug
    ? {
        PLAYWRIGHT_SLOW_MO_MS: options.slowMoMs ?? process.env.PLAYWRIGHT_SLOW_MO_MS ?? '300',
        STEP_DELAY_MS: options.stepDelayMs ?? process.env.STEP_DELAY_MS ?? '400'
      }
    : {})
};

if (options.browserChannel) {
  env.PLAYWRIGHT_BROWSER_CHANNEL = options.browserChannel;
}

const playwrightArgs = ['test'];

if (options.visible) {
  playwrightArgs.push('--headed', '--workers=1');
}

if (options.debug) {
  playwrightArgs.push('--debug', '--workers=1');
}

playwrightArgs.push(...options.passThroughArgs);

const result = spawnSync(process.execPath, [playwrightCli, ...playwrightArgs], {
  cwd: projectRoot,
  env,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);

function parseArgs(args) {
  const parsed = {
    suite: undefined,
    visible: false,
    debug: false,
    slowMoMs: undefined,
    stepDelayMs: undefined,
    browserChannel: undefined,
    passThroughArgs: []
  };

  for (const arg of args) {
    if (arg.startsWith('--suite=')) {
      parsed.suite = arg.slice('--suite='.length);
      continue;
    }

    if (arg === '--visible') {
      parsed.visible = true;
      continue;
    }

    if (arg === '--debug') {
      parsed.debug = true;
      continue;
    }

    if (arg.startsWith('--slow-mo=')) {
      parsed.slowMoMs = arg.slice('--slow-mo='.length);
      continue;
    }

    if (arg.startsWith('--step-delay=')) {
      parsed.stepDelayMs = arg.slice('--step-delay='.length);
      continue;
    }

    if (arg.startsWith('--browser-channel=')) {
      parsed.browserChannel = arg.slice('--browser-channel='.length);
      continue;
    }

    parsed.passThroughArgs.push(arg);
  }

  return parsed;
}
