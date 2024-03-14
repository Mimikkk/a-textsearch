import type { SearchRecord } from './search-record.js';
import type { SearchEngine } from './search-engine.js';
import type { TextSearch } from './a-textsearch.js';
import { isSome } from './utils.js';

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

export namespace SearchResult {
  /**
   * Finds the search results for a collection of items.
   *
   * @param engine The search engine to use.
   * @param records The collection of items to search.
   *
   * @returns The search results for the collection of items.
   * */
  export const find = <T>(engine: SearchEngine, records: SearchRecord<T>[]): SearchResult<T>[] =>
    records.flatMap(record => searchRecord(record, engine)).filter(isSome);

  /**
   * The type of a match in a search result.
   *
   * @template T The type of the items in the collection.
   *
   * @remarks
   * A match can be a string, an array, or a value.
   */
  export type Match<T> = Match.String | Match.Array<T> | Match.Value<T>;

  export namespace Match {
    /**
     * Represents a match of a string in a search result.
     * */
    export interface String {
      item: string;
      norm: number;
      indices: [number, number][];
      score: number;
    }

    /**
    * Represents a match of an array of strings in a search result.
    * */
    export interface Array<T> {
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
    export interface Value<T> {
      item: string;
      norm: number;
      indices: [number, number][];
      score: number;
      key: TextSearch.Configuration.Key<T>;
    }

    /**
     * Represents a match of an object in a search result.
     * */
    export type Object<T> = Value<T> | Array<T>;
  }


  const searchRecord = <T>(record: SearchRecord<T>, engine: SearchEngine): SearchResult<T> | SearchResult<T>[] | null =>
    'norm' in record ? searchString<T>(record, engine) : searchObject(record, engine);

  const searchString = <T>(
    { item, index, norm }: SearchRecord.ArrayString,
    engine: SearchEngine,
  ): SearchResult<T> | null => {
    const { isMatch, score, indices } = engine(item);

    if (!isMatch) return null;
    const matches = [{ score, item, norm, indices }];
    return { item: item as T, index, matches, depth: 0, score: Math.pow(score, norm) };
  };

  const searchObject = <T>(record: SearchRecord.Object<T>, engine: SearchEngine): SearchResult<T>[] => {
    const flatten = (record: SearchRecord.Object<T>): SearchRecord.Object<T>[] => [
      record,
      ...(record.children?.flatMap(child => flatten(child)) ?? []),
    ];

    const results = [];

    const nested = flatten(record);
    for (const record of nested) {
      const matches = matchObject(record, engine);
      if (!matches.length) continue;

      const { item, index, depth } = record;
      const score = matches.reduce((acc, { key, norm, score }) => acc * Math.pow(score, key.weight * norm), 1);

      results.push({ item, index, matches, score, depth });
    }

    return results;
  };


  const matchObject = <T>({ entries }: SearchRecord.Object<T>, engine: SearchEngine): Match.Object<T>[] => {
    const matches: Match.Object<T>[] = [];

    for (const [key, records] of entries) {
      if (Array.isArray(records)) {
        for (const record of records) {
          const match = matchArray(record, key, engine);
          if (match) matches.push(match);
        }
      } else {
        const match = matchValue(records, key, engine);
        if (match) matches.push(match);
      }
    }

    return matches;
  };

  const matchValue = <T>(
    { item, norm }: SearchRecord.String,
    key: TextSearch.Configuration.Key<T>,
    engine: SearchEngine,
  ): Match.Value<T> | null => {
    const { isMatch, score, indices } = engine(item);

    if (!isMatch) return null;
    return { score, key, item, norm, indices };
  };

  const matchArray = <T>(
    { item, norm, index }: SearchRecord.ArrayString,
    key: TextSearch.Configuration.Key<T>,
    engine: SearchEngine,
  ): Match.Array<T> | null => {
    const { isMatch, score, indices } = engine(item);

    if (!isMatch) return null;
    return { score, key, index, item, norm, indices };
  };
}
