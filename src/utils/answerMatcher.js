const EPSILON = 1e-9;

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/(?<=\d),(?=\d)/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

const compactText = (value) => normalizeText(value).replace(/\s+/g, '');

const splitSetItems = (value) =>
  value
    .slice(1, -1)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseSet = (value) => {
  const normalized = normalizeText(value);
  if (!normalized.startsWith('{') || !normalized.endsWith('}')) return null;
  return splitSetItems(normalized);
};

const parseChoices = (value) => {
  const normalized = normalizeText(value);
  const parts = normalized.split(/\s+(?:sau|or)\s+/).map((item) => item.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
};

const parseAssignments = (value) => {
  const normalized = normalizeText(value);
  if (normalized.includes('<=') || normalized.includes('>=') || normalized.includes('!=')) return null;

  const parts = normalized.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  if (!parts.length) return null;

  const assignments = {};
  for (const part of parts) {
    const match = part.match(/^([a-z]+)\s*=\s*(.+)$/);
    if (!match) return null;
    assignments[match[1]] = match[2].trim();
  }

  return assignments;
};

const tokenizeExpression = (value) => {
  const compact = compactText(value);
  if (!compact) return null;

  const tokens = [];
  let index = 0;

  while (index < compact.length) {
    const char = compact[index];

    if (/\d|\./.test(char)) {
      let number = char;
      index += 1;
      while (index < compact.length && /[\d.]/.test(compact[index])) {
        number += compact[index];
        index += 1;
      }
      if (!/^\d*\.?\d+$/.test(number)) return null;
      tokens.push({ type: 'number', value: Number(number) });
      continue;
    }

    if (compact.startsWith('sqrt', index)) {
      tokens.push({ type: 'sqrt' });
      index += 4;
      continue;
    }

    if (compact.startsWith('pi', index)) {
      tokens.push({ type: 'pi', value: Math.PI });
      index += 2;
      continue;
    }

    if ('+-*/()'.includes(char)) {
      tokens.push({ type: char });
      index += 1;
      continue;
    }

    return null;
  }

  const withImplicitMultiplication = [];

  const canEndValue = (token) => token && ['number', 'pi', ')'].includes(token.type);
  const canStartValue = (token) => token && ['number', 'pi', 'sqrt', '('].includes(token.type);

  tokens.forEach((token, idx) => {
    const previous = withImplicitMultiplication[withImplicitMultiplication.length - 1];
    if (canEndValue(previous) && canStartValue(token)) {
      withImplicitMultiplication.push({ type: '*' });
    }
    withImplicitMultiplication.push(token);
    if (token.type === 'sqrt') {
      const next = tokens[idx + 1];
      if (!canStartValue(next)) {
        withImplicitMultiplication.length = 0;
      }
    }
  });

  return withImplicitMultiplication.length ? withImplicitMultiplication : null;
};

const evaluateNumericExpression = (value) => {
  const tokens = tokenizeExpression(value);
  if (!tokens) return null;

  let index = 0;

  const peek = () => tokens[index];
  const consume = (type) => {
    if (peek()?.type !== type) return null;
    index += 1;
    return tokens[index - 1];
  };

  const parseExpression = () => {
    let result = parseTerm();
    if (result == null) return null;

    while (peek()?.type === '+' || peek()?.type === '-') {
      const operator = consume(peek().type)?.type;
      const next = parseTerm();
      if (next == null) return null;
      result = operator === '+' ? result + next : result - next;
    }

    return result;
  };

  const parseTerm = () => {
    let result = parseFactor();
    if (result == null) return null;

    while (peek()?.type === '*' || peek()?.type === '/') {
      const operator = consume(peek().type)?.type;
      const next = parseFactor();
      if (next == null) return null;
      if (operator === '*') result *= next;
      else result /= next;
    }

    return result;
  };

  const parseFactor = () => {
    const token = peek();
    if (!token) return null;

    if (token.type === '+') {
      consume('+');
      return parseFactor();
    }

    if (token.type === '-') {
      consume('-');
      const result = parseFactor();
      return result == null ? null : -result;
    }

    if (token.type === 'number') {
      consume('number');
      return token.value;
    }

    if (token.type === 'pi') {
      consume('pi');
      return token.value;
    }

    if (token.type === 'sqrt') {
      consume('sqrt');
      const result = parseFactor();
      return result == null ? null : Math.sqrt(result);
    }

    if (token.type === '(') {
      consume('(');
      const result = parseExpression();
      if (result == null || !consume(')')) return null;
      return result;
    }

    return null;
  };

  const result = parseExpression();
  if (result == null || index !== tokens.length || Number.isNaN(result)) return null;
  return result;
};

const isNearlyEqual = (left, right) => Math.abs(left - right) <= EPSILON;

const matchSimpleValue = (expected, actual) => {
  const normalizedExpected = compactText(expected);
  const normalizedActual = compactText(actual);

  if (normalizedExpected === normalizedActual) return true;

  const expectedValue = evaluateNumericExpression(expected);
  const actualValue = evaluateNumericExpression(actual);

  if (expectedValue != null && actualValue != null) {
    return isNearlyEqual(expectedValue, actualValue);
  }

  return false;
};

const matchAssignments = (expected, actual) => {
  const expectedAssignments = parseAssignments(expected);
  const actualAssignments = parseAssignments(actual);
  if (!expectedAssignments || !actualAssignments) return false;

  const expectedKeys = Object.keys(expectedAssignments).sort();
  const actualKeys = Object.keys(actualAssignments).sort();
  if (expectedKeys.length !== actualKeys.length) return false;
  if (expectedKeys.some((key, index) => key !== actualKeys[index])) return false;

  return expectedKeys.every((key) => matchSimpleValue(expectedAssignments[key], actualAssignments[key]));
};

const matchUnorderedValues = (expectedValues, actualValues, matcher) => {
  if (expectedValues.length !== actualValues.length) return false;

  const used = new Set();
  return expectedValues.every((expectedValue) => {
    const matchIndex = actualValues.findIndex((actualValue, index) => !used.has(index) && matcher(expectedValue, actualValue));
    if (matchIndex === -1) return false;
    used.add(matchIndex);
    return true;
  });
};

const matchStructuredValue = (expected, actual) => {
  const expectedSet = parseSet(expected);
  const actualSet = parseSet(actual);
  if (expectedSet || actualSet) {
    if (!expectedSet || !actualSet) return false;
    return matchUnorderedValues(expectedSet, actualSet, matchSimpleValue);
  }

  const expectedChoices = parseChoices(expected);
  const actualChoices = parseChoices(actual);
  if (expectedChoices || actualChoices) {
    if (!expectedChoices || !actualChoices) return false;
    return matchUnorderedValues(expectedChoices, actualChoices, matchStructuredValue);
  }

  if (parseAssignments(expected) || parseAssignments(actual)) {
    return matchAssignments(expected, actual);
  }

  return matchSimpleValue(expected, actual);
};

export const matchAnswer = (expected, actual) => {
  if (Array.isArray(expected)) {
    return expected.some((variant) => matchStructuredValue(variant, actual));
  }

  return matchStructuredValue(expected, actual);
};
