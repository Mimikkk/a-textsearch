/**
 * Normalize a string value by counting the number of tokens and returning the inverse square root of the count.
 * */
export declare const normalize: (value: string) => number;
/**
 * Whether the given values are an array of strings.
 * */
export declare const isStringArray: (values: unknown[]) => values is string[];
/**
 * Whether the given value is not null.
 * */
export declare const isSome: <T>(value: T | null) => value is T;
