import type { SearchRecord } from './search-record.js';
import type { SearchEngine } from './search-engine.js';
import type { TextSearch } from './a-textsearch.js';
/**
 * Represents the result of a search operation on a collection of items.
 *
 * @template T The type of the items in the collection.
 *
 * @property item The item that was matched.
 * @property index The index of the item in the collection.
 * @property score The score of the match.
 * @property depth The depth of the match.
 * @property matches The matches that were found.
 *
 * */
export interface SearchResult<T> {
    /**
     * The reference to the item that was matched.
     * */
    item: T;
    /**
     * The index of the item in the collection.
     * */
    index: number;
    /**
     * The score of the match.
     *
     * The score is a number between 0 and 1 that represents the quality of the match.
     * Score of 0 means a perfect match, while a score of 1 means no match at all.
     * */
    score: number;
    /**
     * The depth of the match.
     *
     * The depth is a number that represents the depth of the match in the collection.
     *
     * @notes
     * Usually 0, unless the collection is a nested structure.
     * */
    depth: number;
    /**
     * The matches that were found.
     * */
    matches: SearchResult.Match<T>[];
}
export declare namespace SearchResult {
    /**
     * Finds the search results for a collection of items.
     *
     * @param engine The search engine to use.
     * @param records The collection of items to search.
     *
     * @returns The search results for the collection of items.
     * */
    const find: <T>(engine: SearchEngine, records: SearchRecord<T>[]) => SearchResult<T>[];
    /**
     * The type of a match in a search result.
     *
     * @template T The type of the items in the collection.
     *
     * @remarks
     * A match can be a string, an array, or a value.
     */
    type Match<T> = Match.String | Match.Array<T> | Match.Value<T>;
    namespace Match {
        /**
         * Represents a match of a string in a search result.
         * */
        interface String {
            item: string;
            norm: number;
            indices: [number, number][];
            score: number;
        }
        /**
        * Represents a match of an array of strings in a search result.
        * */
        interface Array<T> {
            item: string;
            norm: number;
            indices: [number, number][];
            score: number;
            key: TextSearch.Configuration.Key<T>;
            index: number;
        }
        /**
         * Represents a match of a value in a search result.
         * */
        interface Value<T> {
            item: string;
            norm: number;
            indices: [number, number][];
            score: number;
            key: TextSearch.Configuration.Key<T>;
        }
        /**
         * Represents a match of an object in a search result.
         * */
        type Object<T> = Value<T> | Array<T>;
    }
}
