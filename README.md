# Automation Test Cases

This project runs Playwright automation from plain-English test suite files. Each `.english` file is discovered automatically and becomes its own Playwright test.

## Quick Commands

Run all test cases:

```bash
npm test
```

Watch all test cases run in a visible browser:

```bash
npm run test:visible
```

Example suite file:

```text
Login to Demo App;
Navigate to "Web Application";
Verify "Implement user authentication" is in the "To Do" column;
Confirm tags: "Feature" "High Priority";
Exit;
```

## How it works

- `features/*.english` contains one English test case per file.
- `src/dsl/parser.ts` splits each file into English commands.
- `src/dsl/runner.ts` matches each command to a TypeScript step definition.
- `src/steps/demoAppSteps.ts` contains the Playwright actions and assertions.
- `tests/english-suites.spec.ts` discovers all English files and creates one Playwright test per file.

The parser is forgiving. Steps can end with semicolons, periods, or line breaks. Tag lists can use spaces, `&`, or `and`:

```text
Confirm tags: "Feature" & "High Priority";
```

## Test suites

- `features/test-case-1.english`
- `features/test-case-2.english`
- `features/test-case-3.english`
- `features/test-case-4.english`
- `features/test-case-5.english`
- `features/test-case-6.english`

## Run it

Install dependencies and Playwright's browser once:

```bash
npm install
npx playwright install chromium
```

**Run all test cases:**

```bash
npm test
```

(Or use the explicit command: `npm run test:all`)

Run one English test case at a time:

| Test case | English file | Command |
| --- | --- | --- |
| Test Case 1 | `features/test-case-1.english` | `npm run test:case-1` |
| Test Case 2 | `features/test-case-2.english` | `npm run test:case-2` |
| Test Case 3 | `features/test-case-3.english` | `npm run test:case-3` |
| Test Case 4 | `features/test-case-4.english` | `npm run test:case-4` |
| Test Case 5 | `features/test-case-5.english` | `npm run test:case-5` |
| Test Case 6 | `features/test-case-6.english` | `npm run test:case-6` |

The environment-variable filter still works if you prefer it:

```bash
ENGLISH_SUITE=test-case-3 npm test
```

You can also run by Playwright title:

```bash
npm test -- --grep "Test Case 3"
```

Run several suites:

```bash
ENGLISH_SUITE=test-case-1,test-case-5 npm test
```

Type-check the framework code without opening the browser:

```bash
npm run typecheck
```

## Watch The Automation

For demos or local debugging, use the visible mode. It opens an English/US Chromium browser and adds a pause after every English step so the automation is easy to follow:

```bash
npm run test:visible
```

Run one test case in visible mode:

```bash
npm run test:visible:case-3
```

The visible mode uses:

- `PLAYWRIGHT_SLOW_MO_MS=750` to slow each browser action.
- `STEP_DELAY_MS=1000` to pause after each English step.

Visible one-by-one commands:

| Test case | Command |
| --- | --- |
| Test Case 1 | `npm run test:visible:case-1` |
| Test Case 2 | `npm run test:visible:case-2` |
| Test Case 3 | `npm run test:visible:case-3` |
| Test Case 4 | `npm run test:visible:case-4` |
| Test Case 5 | `npm run test:visible:case-5` |
| Test Case 6 | `npm run test:visible:case-6` |

You can adjust the delays when needed:

```bash
PLAYWRIGHT_SLOW_MO_MS=1000 STEP_DELAY_MS=1000 npm run test:visible
```

The headed command is kept for running all the tests at once:

```bash
npm run test:headed
```

Run with Playwright Inspector for step-by-step debugging:

```bash
npm run test:debug
```
