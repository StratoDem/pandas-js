import Immutable from 'immutable';

import DataFrame, {mergeDataFrame} from '../../core/frame';
import Series from '../../core/series';
import {IndexMismatchError} from '../../core/exceptions';


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

    describe('index', () => {
      it('index is set properly as the [0, ..., length - 1] if not passed in constructor', () => {
        const df1 = new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}]);
        expect(df1.index.toArray()).toEqual([0, 1, 2]);
      });

      it('index is set properly as the index array passed in in constructor', () => {
        const df1 = new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}], {index: [1, 2, 3]});
        expect(df1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('index is set properly as the index List passed in in constructor', () => {
        const df1 = new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}],
          {index: Immutable.List([1, 2, 3])});
        expect(df1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('throws IndexMismatchError if the index does not match', () => {
        const f = () => new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}],
          {index: Immutable.List([1, 2, 3, 4])});
        expect(f).toThrowError(IndexMismatchError);
      });

      it('index setter updates the index if proper length array passed in', () => {
        const df1 = new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}],
          {index: Immutable.List([1, 2, 3])});
        df1.index = Immutable.List([2, 3, 4]);

        expect(df1.index.toArray()).toEqual([2, 3, 4]);
        expect(df1.get('x').index.toArray()).toEqual([2, 3, 4]);
      });

      it('throws IndexMismatchError in setter if index does not match', () => {
        const df1 = new DataFrame([{x: 1.5}, {x: 1.2}, {x: 1.3}],
          {index: Immutable.List([1, 2, 3])});
        const f = () => {
          df1.index = Immutable.List([2, 3, 4, 5]);
        };
        expect(f).toThrowError(IndexMismatchError);
      });
    });

    describe('columns', () => {
      it('columns are set properly', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        expect(df1.columns.toArray()).toEqual(['x', 'y']);
      });

      it('new columns of equal length can be set', () => {
        const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
        df1.columns = ['a', 'x'];

        expect(df1.columns.toArray()).toEqual(['a', 'x']);
        expect(df1.get('a')).toBeInstanceOf(Series);
        expect(df1.get('x')).toBeInstanceOf(Series);
        expect(df1.get('x').values.toArray()).toEqual([2, 3]);
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

    describe('sum', () => {
      it('sums along axis 0', () => {
        const df1 = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 10}]);
        const ds_sum = df1.sum();
        expect(ds_sum).toBeInstanceOf(Series);
        expect(ds_sum.values.toArray()).toEqual([3, 5, 13]);
        expect(ds_sum.index.toArray()).toEqual(['x', 'y', 'z']);
      });

      it('sums along axis 1', () => {
        const df1 = new DataFrame(
          [{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 10}],
          {index: [2, 3]});
        const ds_sum = df1.sum(1);
        expect(ds_sum).toBeInstanceOf(Series);
        expect(ds_sum.values.toArray()).toEqual([6, 15]);
        expect(ds_sum.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('mean', () => {
      it('takes mean along axis 0', () => {
        const df1 = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 10}]);
        const ds_sum = df1.mean();
        expect(ds_sum).toBeInstanceOf(Series);
        expect(ds_sum.values.toArray()).toEqual([1.5, 2.5, 6.5]);
        expect(ds_sum.index.toArray()).toEqual(['x', 'y', 'z']);
      });

      it('takes mean along axis 1', () => {
        const df1 = new DataFrame(
          [{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 10}],
          {index: [2, 3]});
        const ds_mean = df1.mean(1);
        expect(ds_mean).toBeInstanceOf(Series);
        expect(ds_mean.values.toArray()).toEqual([2, 5]);
        expect(ds_mean.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('variance', () => {
      it('takes variance along axis 0', () => {
        const df1 = new DataFrame([{x: 1, y: 1}, {x: 2, y: 3}, {x: 3, y: 5}]);
        const ds_var = df1.variance();
        expect(ds_var).toBeInstanceOf(Series);
        expect(ds_var.values.toArray()).toEqual([1, 4]);
        expect(ds_var.index.toArray()).toEqual(['x', 'y']);
      });

      it('takes variance along axis 1', () => {
        const df1 = new DataFrame(
          [{x: 1, y: 1, z: 1}, {x: 2, y: 3, z: 4}],
          {index: [2, 3]});
        const ds_var = df1.variance(1);
        expect(ds_var).toBeInstanceOf(Series);
        expect(ds_var.values.toArray()).toEqual([0, 1]);
        expect(ds_var.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('std', () => {
      it('takes standard deviation along axis 0', () => {
        const df1 = new DataFrame([{x: 1, y: 1}, {x: 2, y: 3}, {x: 3, y: 5}]);
        const ds_std = df1.std();
        expect(ds_std).toBeInstanceOf(Series);
        expect(ds_std.values.toArray()).toEqual([1, 2]);
        expect(ds_std.index.toArray()).toEqual(['x', 'y']);
      });

      it('takes standard deviation along axis 1', () => {
        const df1 = new DataFrame(
          [{x: 1, y: 1, z: 1}, {x: 2, y: 3, z: 4}],
          {index: [2, 3]});
        const ds_std = df1.std(1);
        expect(ds_std).toBeInstanceOf(Series);
        expect(ds_std.values.toArray()).toEqual([0, 1]);
        expect(ds_std.index.toArray()).toEqual([2, 3]);
      });
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

      it('merges on a date column', () => {
        const vals1 = [
          {date: '01-01-2010', unemployment_rate: 2},
          {date: '01-01-2011', unemployment_rate: 3},
          {date: '01-01-2012', unemployment_rate: 4},
          {date: '01-01-2013', unemployment_rate: 10}];
        const df1 = new DataFrame(vals1);
        const vals2 = [
          {date: '01-01-2010', unemployment_rate: 5},
          {date: '01-01-2011', unemployment_rate: 7},
          {date: '01-01-2012', unemployment_rate: 20},
          {date: '01-01-2013', unemployment_rate: 23}];
        const df2 = new DataFrame(vals2);

        const df3 = mergeDataFrame(df1, df2, ['date']);
        expect(df3).toBeInstanceOf(DataFrame);
        expect(df3.length).toEqual(4);
        expect(df3.get('date').values.toArray()).toEqual(["01-01-2010", "01-01-2011",
          "01-01-2012", "01-01-2013"]);
        expect(df3.get('unemployment_rate_x').values.toArray()).toEqual([2, 3, 4, 10]);
        expect(df3.get('unemployment_rate_y').values.toArray()).toEqual([5, 7, 20, 23]);
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

    it('merges a second DataFrame after columns are renamed', () => {
      const vals1 = [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 10}];
      const df1 = new DataFrame(vals1);
      df1.columns = ['x', 'a'];
      const vals2 = [{x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100}];
      const df2 = new DataFrame(vals2);
      df2.columns = ['x', 'b'];

      const df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(DataFrame);
      expect(df3.length).toEqual(3);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('a').values.toArray()).toEqual([2, 3, 4]);
      expect(df3.get('b').values.toArray()).toEqual([1, 6, 100]);
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

  describe('where', () => {
    it('checks for equality of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.where(1, (a, b) => a === b);

      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for equality of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.where(new Series([1, 3]), (a, b) => a === b);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for equality of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.where(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]), (a, b) => a === b);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('eq', () => {
    it('checks for equality of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.eq(1);

      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for equality of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.eq(new Series([1, 3]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for equality of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.eq(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('gt', () => {
    it('checks for greater than of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gt(1);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gt(new Series([1, 3]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });

    it('checks for greater than of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gt(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });
  });

  describe('gte', () => {
    it('checks for greater than or equal of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gte(1);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than or equal of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gte(new Series([1, 3]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than or equal of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.gte(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });
  });

  describe('lt', () => {
    it('checks for less than of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lt(1);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lt(new Series([1, 3]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lt(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });
  });

  describe('lte', () => {
    it('checks for less than or equal of a scalar and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lte(1);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than or equal of a Series and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lte(new Series([1, 3]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for less than or equal of a DataFrame and returns a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.lte(new DataFrame([{a: 2, b: 2}, {a: 2, b: 2}]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('filter', () => {
    it('takes a Series boolean and returns the subset of the DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.filter(df.get('x').gt(1));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });

    it('takes a Array boolean and returns the subset of the DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.filter([false, true]);

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });

    it('takes a List boolean and returns the subset of the DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
      const df2 = df.filter(Immutable.List([false, true]));

      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });
  });

  describe('pct_change', () => {
    it('calculates the pct_change along axis 0', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});

      const df2 = df1.pct_change();
      expect(df2.get('x').values.toArray()).toEqual([null, 1, 0.5]);
      expect(df2.get('y').values.toArray()).toEqual([null, 0.5, (4 / 3) - 1]);
      expect(df2.index.toArray()).toEqual([2, 3, 4]);
    });
  });
});
