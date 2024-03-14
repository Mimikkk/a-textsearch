# a-textsearch - Typescript friendly textsearch path resolve

<a href="https://www.npmjs.com/package/a-textsearch">
  <img alt="npm version" src="https://img.shields.io/npm/v/a-textsearch.svg?style=flat-square" />
</a>
<a href="https://www.npmjs.com/package/a-textsearch">
  <img alt="npm downloads" src="https://img.shields.io/npm/dm/a-textsearch.svg?style=flat-square" />
</a>

A blazingly-fast, type-safe TypeScript package for performing text searches within collections with support for nested
searches, and
self referencing objects.

## Install

```bash
pnpm install a-textsearch
```

```bash
npm install a-textsearch
```

```bash
yarn add a-textsearch
```

## Features

- `TextSearch.create<T>` - Create a text-search instance for given item collection.
- `create<T>` - Alias for `TextSearch.create<T>`.
- Supports string arrays, object arrays, and self referencing objects arrays.
- [Customizable options](#options) for text-searching.

## Options

Options for text-searching.

- `threshold` - The threshold value for the search operation to be considered a match.
    - The value should be between 0 and 1, where 0 means a perfect match and 1 means no match at all.
    - The default value is 0.6.
- `distance` - The maximum distance between two characters for the search operation to be considered a match.
    - The default value is 100.
- `sortBy` - The function to sort the search results.
    - The default value is a function that sorts the search results by score and index.
- `sensitive` - Whether the search operation should be case sensitive.
    - The default value is false.
- `minMatch` - The minimum number of matches for the search operation to be considered a match.
    - The default value is 1.
- `keys` - The keys to search for in the collection of items.
    - The keys are the paths to the properties of the items to search for and should contain the text to search for.
    - When no weight is specified, the default weight is 1.
    - It is type-safe and will throw a TypeScript error if the path is invalid.
- `recursiveBy` - The path to a property of the items to search for recursively.
    - Its the path to a property of the item within collection to perform the recursion on.
    - It is type-safe and will throw a TypeScript error if the path is invalid.

## Usage

### Usage with an array of strings

```ts
import { Path } from 'a-textsearch';

const items = ['a', 'b', 'c', 'd'];

const search = create(items);

search.search('a').map(({ item }) => item);
// ^? ["a"]
```

### Usage with an array of objects

#### No configuration

```ts
import { create } from 'a-textsearch';

type Item = { a: string; b: number; c: string };

const items: Item[] = [
  { a: 'a', b: 1, c: 'c' },
  { a: 'b', b: 2, c: 'd' },
  { a: 'c', b: 3, c: 'e' },
  { a: 'd', b: 4, c: 'f' },
];

const search = create(items);

search.search('a').map(({ item }) => item);
// ^? [{ a: 'a', b: 1, c: 'c' }]
```

#### With specified keys

```ts
import { create } from 'a-textsearch';

type Item = { a: string; b: number; c: string };

const items: Item[] = [
  { a: 'a', b: 1, c: 'c' },
  { a: 'b', b: 2, c: 'd' },
  { a: 'c', b: 3, c: 'e' },
  { a: 'd', b: 4, c: 'f' },
];

const search = create(items, { keys: ['a', 'c'] });
// Valid keys are verified hence the following is invalid and throws a TypeScript error
// const textSearch = create(items, { keys: ['b'] });

search.search('a').map(({ item }) => item);
// ^? [{ a: 'a', b: 1, c: 'c' }]
```

#### With nested keys

```ts
import { create } from 'a-textsearch';

type Item = {
  a: { b: { c: string } };
  b: number;
  c: string;
};

const items: Item[] = [
  { a: { b: { c: 'a' } }, b: 1, c: 'c' },
  { a: { b: { c: 'b' } }, b: 2, c: 'd' },
  { a: { b: { c: 'c' } }, b: 3, c: 'e' },
  { a: { b: { c: 'd' } }, b: 4, c: 'f' },
];

const search = create(items, { keys: ['a.b.c'] });
// Valid keys are verified hence the following is invalid and throws a TypeScript error
// const textSearch = create(items, { keys: ['a.b'] });

search.search('a').map(({ item }) => item);
// ^? [{ a: { b: { c: 'a' } }, b: 1, c: 'c' }]
```

### Usage with an array of self referencing objects

```ts
import { create } from 'a-textsearch';

type Item = {
  a: { b: { c: string } };
  b: number;
  c: Item;
};

const item: Item = { a: { b: { c: 'a' } }, b: 1, c: 'c' };

const items: Item[] = [item, item];

const search = create(items, { keys: ['a.b.c'], recursiveBy: 'c' });

search.search('a').map(({ item }) => item);
// ^? [{ a: { b: { c: 'a' } }, b: 1, c: 'c' }]
```
