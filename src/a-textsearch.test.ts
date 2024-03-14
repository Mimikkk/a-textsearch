import { describe, expect, expectTypeOf, it } from 'vitest';
import { TextSearch } from './a-textsearch.js';

describe('TextSearch', () => {
  describe('Typing', () => {
    it('should allow for selecting deep string keys only', () => {
      type Item = { a: unknown, b: string, c: { a: string } };

      expectTypeOf<TextSearch.Options.Key<Item>>().toMatchTypeOf<'b' | 'c.a' | { path: 'b' | 'c.a' }>();
    });

    it('should allow for selecting children recursively', () => {
      type Item = { a: unknown, b: string, c: { a: Item[] } };

      expectTypeOf<TextSearch.Options<Item>['recursiveBy']>().toMatchTypeOf<'c.a' | undefined>();
      expectTypeOf<TextSearch.Options<Item>['recursiveBy']>().not.toMatchTypeOf<'a' | 'b'>();
    });
  });

  it('should search for a string within an array', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];

    const search = TextSearch.create(items);

    expect(search('a')).toEqual([
      {
        item: 'a',
        index: 0,
        matches: [{ score: 0, item: 'a', norm: 1, indices: [[0, 0]] }],
        score: 0,
        depth: 0,
      },
    ] satisfies TextSearch.Result<string>[]);
  });

  it('should search for a string within a shallow object', () => {
    type Item = { name: string };
    const items: Item[] = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }, { name: 'f' }];

    const search = TextSearch.create(items, { keys: ['name'] });

    expect(search('a')).toEqual([
      {
        item: { name: 'a' },
        index: 0,
        matches: [{ score: 0, key: { path: 'name', weight: 1 }, item: 'a', norm: 1, indices: [[0, 0]] }],
        score: 0,
        depth: 0,
      },
    ] satisfies TextSearch.Result<Item>[]);
  });

  it('should search for a string within a deep object', () => {
    type Item = { name: { name: string } };
    const items: Item[] = [
      { name: { name: 'a' } },
      { name: { name: 'b' } },
      { name: { name: 'c' } },
      { name: { name: 'd' } },
      { name: { name: 'e' } },
      { name: { name: 'f' } },
    ];

    const search = TextSearch.create(items, { keys: ['name.name'] });

    expect(search('a')).toEqual([
      {
        item: { name: { name: 'a' } },
        index: 0,
        matches: [{ score: 0, key: { path: 'name.name', weight: 1 }, item: 'a', norm: 1, indices: [[0, 0]] }],
        score: 0,
        depth: 0,
      },
    ] satisfies TextSearch.Result<Item>[]);
  });

  it('should search for a string within array of a deep object', () => {
    type Item = { name: { name: string[] } };
    const items: Item[] = [{ name: { name: ['a', 'b'] } }, { name: { name: ['c', 'd'] } }];

    const search = TextSearch.create(items, { keys: ['name.name'] });

    expect(search('a')).toEqual([
      {
        item: { name: { name: ['a', 'b'] } },
        index: 0,
        matches: [
          {
            score: 0,
            key: { path: 'name.name', weight: 1 },
            index: 0,
            item: 'a',
            norm: 1,
            indices: [[0, 0]],
          },
        ],
        score: 0,
        depth: 0,
      },
    ] satisfies TextSearch.Result<Item>[]);
  });

  it('should search for a string within an array of recursive object', () => {
    type Item = { name: { name: string[] }; children?: Item[] };
    const items: Item[] = [
      { name: { name: ['a', 'b'] }, children: [{ name: { name: ['c', 'd'] } }] },
      { name: { name: ['e', 'f'] }, children: [{ name: { name: ['g', 'h'] } }] },
    ];

    const search = TextSearch.create(items, { keys: ['name.name'], recursiveBy: 'children' });

    expect(search('a')).toEqual([
      {
        item: { name: { name: ['a', 'b'] }, children: [{ name: { name: ['c', 'd'] } }] },
        index: 0,
        matches: [
          {
            score: 0,
            key: { path: 'name.name', weight: 1 },
            index: 0,
            item: 'a',
            norm: 1,
            indices: [[0, 0]],
          },
        ],
        score: 0,
        depth: 0,
      },
    ] satisfies TextSearch.Result<Item>[]);

    expect(search('c')).toEqual([
      {
        item: { name: { name: ['c', 'd'] } },
        index: 0,
        matches: [
          {
            score: 0,
            key: { path: 'name.name', weight: 1 },
            index: 0,
            item: 'c',
            norm: 1,
            indices: [[0, 0]],
          },
        ],
        score: 0,
        depth: 1,
      },
    ] satisfies TextSearch.Result<Item>[]);
  });
});
