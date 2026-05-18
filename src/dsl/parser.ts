export type EnglishStep = {
  text: string;
  line: number;
  sourceFile: string;
};

export function parseEnglishFeature(source: string, sourceFile = 'inline'): EnglishStep[] {
  const normalizedSource = normalizeSource(source);
  const steps: EnglishStep[] = [];
  let buffer = '';
  let line = 1;
  let stepLine = 1;
  let inQuote = false;
  let isEscaped = false;
  let isComment = false;

  for (let index = 0; index < normalizedSource.length; index += 1) {
    const char = normalizedSource[index];
    const nextChar = normalizedSource[index + 1];

    if (isComment) {
      if (char === '\n') {
        pushStep(steps, buffer, stepLine, sourceFile);
        buffer = '';
        isComment = false;
        line += 1;
      }
      continue;
    }

    if (!inQuote && char === '#') {
      isComment = true;
      continue;
    }

    if (buffer.trim().length === 0 && !/\s/.test(char)) {
      stepLine = line;
    }

    if (char === '"' && !isEscaped) {
      inQuote = !inQuote;
    }

    if (!inQuote && isStepTerminator(char, nextChar)) {
      pushStep(steps, buffer, stepLine, sourceFile);
      buffer = '';
      if (char === '\n') {
        line += 1;
      }
      continue;
    }

    buffer += char;
    isEscaped = char === '\\' && !isEscaped;

    if (char !== '\\') {
      isEscaped = false;
    }

    if (char === '\n') {
      line += 1;
    }
  }

  if (inQuote) {
    throw new Error(`Unclosed quote in ${sourceFile}`);
  }

  pushStep(steps, buffer, stepLine, sourceFile);

  return steps;
}

export function quotedValues(stepText: string): string[] {
  const values: string[] = [];
  const matches = stepText.matchAll(/"((?:\\"|[^"])*)"/g);

  for (const match of matches) {
    values.push(match[1].replace(/\\"/g, '"'));
  }

  return values;
}

function normalizeSource(source: string): string {
  return source
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2028\u2029]/g, '\n');
}

function isStepTerminator(char: string, nextChar: string | undefined): boolean {
  if (char === ';' || char === '\n') {
    return true;
  }

  return char === '.' && (nextChar === undefined || /\s/.test(nextChar));
}

function pushStep(steps: EnglishStep[], rawText: string, line: number, sourceFile: string): void {
  const text = rawText.trim();

  if (text.length === 0 || /^Test Case\b/i.test(text)) {
    return;
  }

  steps.push({ text, line, sourceFile });
}
