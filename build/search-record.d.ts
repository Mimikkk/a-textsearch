import type { TextSearch } from './a-textsearch.js';
/**
 * A search record is a representation of an item in a collection that is optimized for searching.
 *
 * @template T The type of the item in the collection.
 *
 * @notes
 * It is ArrayString if the collection is a string array, and Object if the collection is an object array.
 * */
export type SearchRecord<T> = SearchRecord.ArrayString | SearchRecord.Object<T>;
export declare namespace SearchRecord {
    /**
     * Create a search record from a collection of items.
     *
     * @param values The collection of items.
     * @param configuration The configuration for the search.
     *
     * @returns The search records.
     * */
    const create: <T>(values: T[], configuration: TextSearch.Configuration<T>) => SearchRecord<T>[];
    /**
     * A SearchRecord.KeyEntry is a representation of a configuration key within a search record.
     *
     * @template T The type of the item in the collection.
     *
     * @remarks
     * A key entry is a tuple of a configuration key and a key's normalized value.
     * */
    type KeyEntry<T> = [TextSearch.Configuration.Key<T>, String | ArrayString[]];
    /**
     * A SearchRecord.String is a representation of a string within a search record.
     * */
    interface String {
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
    interface ArrayString {
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
    interface Object<T> {
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
}
