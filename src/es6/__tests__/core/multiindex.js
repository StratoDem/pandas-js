/**
 * Created by michael on 3/22/17.
 */

import Immutable from 'immutable';

import { Index, MultiIndex } from '../../core/multiindex';


describe('multiindex', () => {
  describe('Index', () => {
    it('initializes with an Array or List', () => {
      const index = new Index([1, 2, 3, 4]);
      expect(index.values).toBeInstanceOf(Immutable.List);
      expect(index.values.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('throws a TypeError otherwise', () => {
      expect(() => new Index('hi')).toThrow(TypeError);
    })
  });

  describe('MultiIndex', () => {
    it('initializes with an Immutable.OrderedMap', () => {
      const multiindex = new MultiIndex(
        Immutable.OrderedMap({1: Immutable.OrderedMap({2: new Index([1, 2, 3])})}));

      expect(multiindex.values).toBeInstanceOf(Immutable.OrderedMap);
      expect(multiindex.values.size).toEqual(1);
      expect(multiindex.values.get('1')).toBeInstanceOf(Immutable.OrderedMap);
      expect(multiindex.values.get('1').size).toEqual(1);
      expect(multiindex.values.get('1').get('2')).toBeInstanceOf(Immutable.List);
      expect(multiindex.values.get('1').get('2').toArray()).toEqual([1, 2, 3]);
    });

    it('throws a TypeError otherwise', () => {
      expect(() => new MultiIndex('1')).toThrow(TypeError);
    });

    it('get returns the Index or MultiIndex at the key', () => {
      const multiindex = new MultiIndex(
        Immutable.OrderedMap({1: Immutable.OrderedMap({2: new Index([1, 2, 3])})}));

      const multiindex1 = multiindex.get('1');
      expect(multiindex1).toBeInstanceOf(MultiIndex);

      const multiindex2 = multiindex1.get('2');
      expect(multiindex2).toBeInstanceOf(Index);
      expect(multiindex2.values.toArray()).toEqual([1, 2, 3]);

      const index = multiindex2.get(1);
      expect(index).toEqual(2);
    });
  });
});
