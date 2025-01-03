import type { TextSearch } from './a-textsearch.js';
import { isStringArray, normalize } from './utils.js';
import { Path } from '@nimir/a-path';

/**
 * A search record is a representation of an item in a collection that is optimized for searching.
 *
 * @template T The type of the item in the collection.
 *
 * @notes
 * It is ArrayString if the collection is a string array, and Object if the collection is an object array.
 * */
export type SearchRecord<T> = SearchRecord.ArrayString | SearchRecord.Object<T>;

export namespace SearchRecord {
  /**
   * Create a search record from a collection of items.
   *
   * @param values The collection of items.
   * @param configuration The configuration for the search.
   *
   * @returns The search records.
   * */
  export const create = <T>(values: T[], configuration: TextSearch.Configuration<T>): SearchRecord<T>[] =>
    isStringArray(values)
      ? values.map(ArrayString.create)
      : values.map((item, index) => Object.create(item, index, configuration, 0));

  /**
   * A SearchRecord.KeyEntry is a representation of a configuration key within a search record.
   *
   * @template T The type of the item in the collection.
   *
   * @remarks
   * A key entry is a tuple of a configuration key and a key's normalized value.
   * */
  export type KeyEntry<T> = [TextSearch.Configuration.Key<T>, String | ArrayString[]];

  /**
   * A SearchRecord.String is a representation of a string within a search record.
   * */
  export interface String {
    /**
    * The string value.
    * */
    item: string;
    /**
     * The normalized value of the string.
     */
    norm: number;
  }

  /**
   * A SearchRecord.ArrayString is a representation of an array of strings within a search record.
   * */
  export interface ArrayString {
    /**
     * The string value.
     * */
    item: string;
    /**
     * The index of the string within the array.
     * */
    index: number;
    /**
     * The normalized value of the string.
     */
    norm: number;
  }

  /**
   * A SearchRecord.Object is a representation of an object within a search record.
   *
   * @notes
   * Can be a nested object if the object has children and the search is recursive.
   * */
  export interface Object<T> {
    /**
     * The object value.
     * */
    item: T;
    /**
     * The index of the object within the array.
     * */
    index: number;
    /**
     * The depth of the object within the array.
     * */
    depth: number;
    /**
     * The key entries of the object.
     * */
    entries: KeyEntry<T>[];
    /**
     * The children of the object if it has any.
     * */
    children?: Object<T>[];
  }

  namespace String {
    export const create = (item: string): String => ({ item, norm: normalize(item) });
  }

  namespace ArrayString {
    export const create = (item: string, index: number): ArrayString => ({ item, index, norm: normalize(item) });

    export const array = (value: string[]): ArrayString[] => {
      const records: ArrayString[] = [];
      type Item = [string | string[], number];
      const stack: Item[] = [[value, 0]];

      while (stack.length) {
        const [value, index] = stack.pop()!;

        if (typeof value === 'string') {
          records.unshift(ArrayString.create(value, index));
        } else {
          stack.push(...value.map((value, index) => [value, index] as Item));
        }
      }

      return records;
    };
  }

  namespace Object {
    export const create = <T>(
      item: T,
      index: number,
      configuration: TextSearch.Configuration<T>,
      depth: number,
    ): Object<T> => {
      const children: T[] | undefined = Path.get(item!, configuration.recursiveBy as never);

      return {
        item,
        index,
        depth,
        entries: KeyEntry.create(item, configuration.keys),
        children: children?.map((item, index) => create(item, index, configuration, depth + 1)),
      };
    };
  }

  namespace KeyEntry {
    export const create = <T>(item: T, keys: TextSearch.Configuration.Key<T>[]): KeyEntry<T>[] =>
      keys.map(key => {
        const value = Path.get(item as never, key.path as never);

        const records = Array.isArray(value) ? ArrayString.array(value) : String.create(value);

        return [key, records];
      });
  }
}
