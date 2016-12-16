
import Immutable from 'immutable';

import DataFrame, { mergeDataFrame } from '../../core/frame';
import Series from '../../core/series';


describe('frame', () => {
  describe('DataFrame', () => {
    it('initializes a DataFrame', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);

      expect(df1.x).toBeInstanceOf(Series);
      expect(df1.x.values.toArray()).toEqual([1, 2]);
      expect(df1.y).toBeInstanceOf(Series);
      expect(df1.y.values.toArray()).toEqual([2, 3]);
    });

    describe('columns', () => {
      it('columns are set properly', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        expect(df1.columns).toEqual(['x', 'y']);
      });

      it('new columns of equal length can be set', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        df1.columns = ['a', 'b'];

        expect(df1.columns).toEqual(['a', 'b']);
        expect(df1.a).toBeInstanceOf(Series);
        expect(df1.b).toBeInstanceOf(Series);
      });
    });

    it('measures length properly', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
      expect(df1.length).toEqual(3);
    });

    it('Is iterable via iterrows', () => {
      const vals = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}];
      const df1 = new DataFrame(vals);

      for (const [row, idx] of df1.iterrows()) {
        expect(row).toBeInstanceOf(DataFrame);
        expect(row.x.iloc(0)).toEqual(vals[idx].x);
        expect(row.y.iloc(0)).toEqual(vals[idx].y);
      }
    });
  });

  describe('mergeDataFrame', () => {
    it('merges two DataFrames on a given key', () => {
      const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
      const df1 = new DataFrame(vals1);
      const vals2 = [{x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100}];
      const df2 = new DataFrame(vals2);

      const df3 = mergeDataFrame(df1, df2, ['x']);
      expect(df3).toBeInstanceOf(DataFrame);
      expect(df3.length).toEqual(3);
      expect(df3.x.values.toArray()).toEqual([1, 2, 3]);
      expect(df3.y.values.toArray()).toEqual([2, 3, 4]);
      expect(df3.z.values.toArray()).toEqual([1, 6, 100]);
    });
  });

  describe('values', () => {
    it('values returns an Immutable.List of Immutable.Lists with [row][column] indexing', () => {
      const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
      const df1 = new DataFrame(vals1);

      expect(df1.values).toBeInstanceOf(Immutable.List);
      df1.values.forEach((r, idx) => {
        expect(r).toBeInstanceOf(Immutable.List);
        expect(r.get(0)).toEqual(vals1[idx].x);
        expect(r.get(1)).toEqual(vals1[idx].y);
      });
    });

    it('values equality check is true if data is unchanged', () => {
      const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
      const df1 = new DataFrame(vals1);

      expect(df1.values === df1.values).toEqual(true);
    });
  });

  describe('merge', () => {
    it('merges a second DataFrame to this instance on a given key', () => {
      const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
      const df1 = new DataFrame(vals1);
      const vals2 = [{x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100}];
      const df2 = new DataFrame(vals2);

      const df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(DataFrame);
      expect(df3.length).toEqual(3);
      expect(df3.x.values.toArray()).toEqual([1, 2, 3]);
      expect(df3.y.values.toArray()).toEqual([2, 3, 4]);
      expect(df3.z.values.toArray()).toEqual([1, 6, 100]);
    });
  });
});
