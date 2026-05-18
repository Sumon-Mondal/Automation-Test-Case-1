# English Playwright Automation

This project runs Playwright tests from plain-English commands.

Sample scenario:

```text
Login to Demo App;
Navigate to "Web Application";
Verify "Implement user authentication" is in the "To Do" column;
Confirm tags: "Feature" "High Priority";
Exit;
```

## How it works

- `features/demo-app.english` contains the English scenario.
- `src/dsl/parser.ts` splits the file into semicolon-ended commands.
- `src/dsl/runner.ts` matches each command to a TypeScript step definition.
- `src/steps/demoAppSteps.ts` contains the Playwright actions and assertions.
- `tests/demo-app.english.spec.ts` connects the English file to Playwright.

## Run it

```bash
npm install
npx playwright install chromium
npm test
```

Type-check the framework code:

```bash
npm run typecheck
```

## Watch the test run

Run the browser visibly with a demo-friendly pace:

```bash
npm run test:headed
```

Run with Playwright Inspector for step-by-step debugging:

```bash
npm run test:debug
```

The slower visual mode is controlled by:

- `PLAYWRIGHT_SLOW_MO_MS`: slows each Playwright action.
- `STEP_DELAY_MS`: pauses briefly after each English step.

Example:

```bash
PLAYWRIGHT_SLOW_MO_MS=1000 STEP_DELAY_MS=1000 npm run test:headed
```

Optional overrides:

```bash
DEMO_APP_URL=https://animated-gingersnap-8cf7f2.netlify.app/ \
DEMO_APP_EMAIL=admin \
DEMO_APP_PASSWORD=password123 \
npm test
```
