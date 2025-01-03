import { Path } from '@nimir/a-path';
import { SearchEngine } from './search-engine.js';
import { SearchResult } from './search-result.js';
import { SearchRecord } from './search-record.js';

/**
 * A text search is a function that searches a collection of items for a query.
 *
 * @template T The type of the items in the collection.
 *
 * @param query The query to search for.
 * @param limit The maximum number of results to return.
 *
 * @returns The search results for the collection of items.
 * */
export type TextSearch<T> = (query: string, limit?: number) => SearchResult<T>[];

export namespace TextSearch {
  /**
   * The type of a search result withing a text search.
   * */
  export type Result<T> = SearchResult<T>;

  /**
   * Create a text search from a collection of items and a configuration.
   *
   * @param items The collection of items.
   * @param options The options for the search.
   *
   * @returns The text search.
   *
   * @remarks
   * The text search is a function that searches a collection of items for a query.
   * */
  export const create = <T>(items: T[], options?: Partial<Options<T>>): TextSearch<T> => {
    const configuration = Configuration.from(options);
    const records = SearchRecord.create<T>(items, configuration);

    return <TextSearch<T>>((query, limit) => {
      const results = SearchResult.find(SearchEngine.create(query, configuration), records);

      if (configuration.sortBy) results.sort(configuration.sortBy);
      if (limit) results.length = Math.min(results.length, limit);

      return results;
    });
  };

  /**
   * The options for a text search.
   * */
  export interface Options<T> {
    /**
     * The threshold value for the search operation to be considered a match.
     *
     * The value should be between 0 and 1, where 0 means a perfect match and 1 means no match at all.
     *
     * @default 0.6
     * */
    threshold: number;
    /**
     * The maximum distance between two characters for the search operation to be considered a match.
     *
     * @default 100
     * */
    distance: number;
    /**
     * The function to sort the search results.
     *
     * @default <T>(a, b) => a.score === b.score ? a.index - b.index : a.score - b.score;
     * */
    sortBy: Options.SortFn<T> | false;
    /**
     * Whether the search operation should be case sensitive.
     *
     * @default false
     * */
    sensitive: boolean;
    /**
     * The minimum number of matches for the search operation to be considered a match.
     *
     * @default 1
     * */
    minMatch: number;
    /**
     * The keys to search for in the collection of items.
     *
     * @remarks
     * The keys are the paths to the properties of the items to search for and should contain the text to search for.
     * When no weight is specified, the default weight is 1.
     * */
    keys: Options.Key<T>[];
    /**
     * The path to a property of the items to search for recursively.
     *
     * @remarks
     * Its the path to a property of the item within collection to perform the recursion on.
     * */
    recursiveBy?: Path.Of<T, T[] | undefined>;
  }

  export namespace Options {
    /**
     * Sorting function of the search results.
     *
     * @template T The type of the items in the collection.
     * */
    export type SortFn<T> = typeof sort<T>;

    type StringKey<T> = Path.Of<T, string | string[]>;
    type ObjectKey<T> = { path: StringKey<T>; weight?: number };
    /**
     * Key to search for in the collection of items.
     *
     * @template T The type of the items in the collection.
     *
     * @remarks
     * The key is the path to the property of the items to search for and should contain the text to search for.
     * */
    export type Key<T> = StringKey<T> | ObjectKey<T>;
  }

  /**
   * The configuration for a text search.
   *
   * @remarks
   * It is the internal configuration of the search based on the options.
   * */
  export interface Configuration<T> extends Omit<Options<T>, 'keys'> {
    keys: Configuration.Key<T>[];
  }

  export namespace Configuration {
    export const from = <T>(options?: Partial<Options<T>>): Configuration<T> => ({
      recursiveBy: options?.recursiveBy,
      sensitive: options?.sensitive ?? false,
      threshold: options?.threshold ?? 0.6,
      distance: options?.distance ?? 100,
      minMatch: options?.minMatch ?? 1,
      sortBy: options?.sortBy ?? sort,
      keys: options?.keys?.map(Key.from) ?? [],
    });
    /**
     * Internal structure of the key to search for in the collection of items.
     * */
    export type Key<T> = { path: Path.Of<T, string | string[]>; weight: number };

    namespace Key {
      export const from = <T>(key: Options.Key<T>): Configuration.Key<T> =>
        typeof key === 'string' ? { path: key, weight: 1 } : { path: key.path, weight: key.weight ?? 1 };
    }
  }

  const sort = <T>(a: Result<T>, b: Result<T>): number => (a.score === b.score ? a.index - b.index : a.score - b.score);
}

export const create = TextSearch.create;
