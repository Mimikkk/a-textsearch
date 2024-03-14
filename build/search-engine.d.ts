import type { TextSearch } from './a-textsearch.js';
/**
 * Represents the result of a search operation on a collection of items.
 *
 * @template T The type of the items in the collection.
 *
 * @property item The item that was matched.
 * @property index The index of the item in the collection.
 *
 * @property score The score of the match.
 * */
export type SearchEngine = (query: string) => SearchEngine.Match;
export declare namespace SearchEngine {
    /**
     * Create a search engine from a query and a configuration.
     *
     * @param query The query to search for.
     * @param configuration The configuration for the search.
     *
     * @returns The search engine.
     * */
    const create: <T>(query: string, configuration: TextSearch.Configuration<T>) => SearchEngine;
    /**
     * Represents the match of a search operation on a collection of items.
     *
     * @property isMatch Indicates whether the search was a match.
     * @property score The score of the match.
     * @property indices The indices of the match.
     *
     * @remarks
     * The indices are represented as a tuple of two numbers, where the first number is the start index and the second number is the end index.
     * */
    type Match = {
        isMatch: false;
        score: undefined;
        indices: undefined;
    } | {
        isMatch: true;
        score: number;
        indices: [number, number][];
    };
}
