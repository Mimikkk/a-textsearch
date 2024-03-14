const countTokens = (string: string): number => {
  let count = 0;

  for (let i = 0, len = string.length; i < len; ++i) if (string[i] !== ' ') ++count;

  return count;
};

/**
 * Normalize a string value by counting the number of tokens and returning the inverse square root of the count.
 * */
export const normalize = (value: string): number => Math.round((1 / Math.sqrt(countTokens(value))) * 1000) / 1000;

/**
 * Whether the given values are an array of strings.
 * */
export const isStringArray = (values: unknown[]): values is string[] => typeof values[0] === 'string';

/**
 * Whether the given value is not null.
 * */
export const isSome = <T>(value: T | null): value is T => value !== null;
