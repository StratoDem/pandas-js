
import Immutable from 'immutable';

import DataFrame, { mergeDataFrame } from '../../core/frame';
import Series from '../../core/series';


describe('frame', () => {
  describe('DataFrame', () => {
    it('initializes a DataFrame', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);

      expect(df1.get('x')).toBeInstanceOf(Series);
      expect(df1.get('x').values.toArray()).toEqual([1, 2]);
      expect(df1.get('y')).toBeInstanceOf(Series);
      expect(df1.get('y').values.toArray()).toEqual([2, 3]);
    });

    describe('toString', () => {
      it('logs the DataFrame properly', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        df1.columns = ['date', 'unemployment_rate_x'];
        const df2 = new DataFrame([{x: 1, y: 3}, {x: 2, y: 4}]);
        df2.columns = ['date', 'unemployment_rate_y'];

        df1.merge(df2, ['date']).toString();
      });
    });

    describe('columns', () => {
      it('columns are set properly', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        expect(df1.columns.toArray()).toEqual(['x', 'y']);
      });

      it('new columns of equal length can be set', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        df1.columns = ['a', 'b'];

        expect(df1.columns.toArray()).toEqual(['a', 'b']);
        expect(df1.get('a')).toBeInstanceOf(Series);
        expect(df1.get('b')).toBeInstanceOf(Series);
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
        expect(row.get('x').iloc(0)).toEqual(vals[idx].x);
        expect(row.get('y').iloc(0)).toEqual(vals[idx].y);
      }
    });
  });

  describe('mergeDataFrame', () => {
    describe('innerMerge', () => {
      it('merges two DataFrames on a given key', () => {
        const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
        const df1 = new DataFrame(vals1);
        const vals2 = [{x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100}];
        const df2 = new DataFrame(vals2);

        const df3 = mergeDataFrame(df1, df2, ['x'], 'inner');
        expect(df3).toBeInstanceOf(DataFrame);
        expect(df3.length).toEqual(3);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
        expect(df3.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df3.get('z').values.toArray()).toEqual([1, 6, 100]);
      });

      it('replaces a common column with _x and _y', () => {
        const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
        const df1 = new DataFrame(vals1);
        const vals2 = [{x: 2, y: 6}, {x: 1, y: 1}, {x: 3, y: 100}];
        const df2 = new DataFrame(vals2);

        const df3 = mergeDataFrame(df1, df2, ['x'], 'inner');
        expect(df3).toBeInstanceOf(DataFrame);
        expect(df3.length).toEqual(3);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
        expect(df3.get('y_x').values.toArray()).toEqual([2, 3, 4]);
        expect(df3.get('y_y').values.toArray()).toEqual([1, 6, 100]);
      });
    });

    describe('outerMerge', () => {
      it('merges two DataFrames on a given key', () => {
        const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
        const df1 = new DataFrame(vals1);
        const vals2 = [{x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100}, {x: 5, z: 200}];
        const df2 = new DataFrame(vals2);

        const df3 = mergeDataFrame(df1, df2, ['x'], 'outer');
        expect(df3).toBeInstanceOf(DataFrame);
        expect(df3.length).toEqual(5);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 4, 5]);
        expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 10, null]);
        expect(df3.get('z').values.toArray()).toEqual([1, 6, 100, null, 200]);
      });
    });
  });

  describe('values', () => {
    it('values returns an Immutable.List of Immutable.Lists with [column][row] indexing', () => {
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
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(df3.get('z').values.toArray()).toEqual([1, 6, 100]);
    });
  });

  describe('to_csv', () => {
    it('converts a pandas.DataFrame to a properly formatted csv string', () => {
      const vals1 = [{x: 1, y: 2}, {x: 3, y: 3}, {x: 4, y: 8}];
      const df1 = new DataFrame(vals1);

      expect(df1.to_csv()).toEqual('x,y,\r\n1,2,\r\n3,3,\r\n4,8,\r\n');

      for (let [r, idx] of df1.iterrows()) {
        // console.log(r.values);
      }
    });
  });
});
