export type EnglishStep = {
  text: string;
  line: number;
  sourceFile: string;
};

export function parseEnglishFeature(source: string, sourceFile = 'inline'): EnglishStep[] {
  const steps: EnglishStep[] = [];
  let buffer = '';
  let line = 1;
  let stepLine = 1;
  let inQuote = false;
  let isEscaped = false;
  let isComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (isComment) {
      if (char === '\n') {
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

    if (char === ';' && !inQuote) {
      const text = buffer.trim();
      if (text.length > 0) {
        steps.push({ text, line: stepLine, sourceFile });
      }
      buffer = '';
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

  const unfinishedStep = buffer.trim();
  if (unfinishedStep.length > 0) {
    throw new Error(`Missing semicolon after step at ${sourceFile}:${stepLine}: ${unfinishedStep}`);
  }

  if (inQuote) {
    throw new Error(`Unclosed quote in ${sourceFile}`);
  }

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
