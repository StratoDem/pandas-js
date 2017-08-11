import Immutable from 'immutable';

import DataFrame, {mergeDataFrame} from '../../core/frame';
import Series from '../../core/series';
import { Workbook } from '../../core/structs';
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

    describe('set', () => {
      it('sets a new Series column at the index', () => {
        const df = new DataFrame([{x: 1}, {x: 2}, {x: 3}]);
        const df2 = df.set('y', new Series([2, 3, 4]));
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      });

      it('sets a new List column at the index', () => {
        const df = new DataFrame([{x: 1}, {x: 2}, {x: 3}]);
        const df2 = df.set('y', Immutable.List([2, 3, 4]));
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      });

      it('sets a new Array column at the index', () => {
        const df = new DataFrame([{x: 1}, {x: 2}, {x: 3}]);
        const df2 = df.set('y', [2, 3, 4]);
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
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

    describe('get', () => {
      it('gets one column as a Series when string passed in', () => {
        const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

        const ds = df.get('y');
        expect(ds).toBeInstanceOf(Series);
        expect(ds.values.toArray()).toEqual([2, 3, 4]);
      });

      it('gets multiple columns as a DataFrame when Iterable of strings passed in', () => {
        const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

        const df2 = df.get(['y', 'z']);
        expect(df2).toBeInstanceOf(DataFrame);
        expect(df2.columns.toArray()).toEqual(['y', 'z']);
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df2.get('z').values.toArray()).toEqual([3, 4, 5]);
      })
    });

    describe('reset_index', () => {
      it('resets the index to a range and places "index" as a column in the DataFrame', () => {
        const df = new DataFrame(
          [{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}],
          {index: [1, 2, 3]}).reset_index();

        expect(df.get('index')).toBeInstanceOf(Series);
        expect(df.get('index').values.toArray()).toEqual([1, 2, 3]);
        expect(df.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });

      it('resets the index to a range and does not include "index" in the DataFrame', () => {
        const df = new DataFrame(
          [{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}],
          {index: [1, 2, 3]}).reset_index({drop: true});

        expect(df.columns.toArray()).toEqual(['x', 'y', 'z']);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });

      it('resets the index to a range and includes "level_0" in the DataFrame', () => {
        const df = new DataFrame(
          [{index: 1, y: 2, z: 3}, {index: 2, y: 3, z: 4}, {index: 3, y: 4, z: 5}],
          {index: [2, 3, 4]}).reset_index();

        expect(df.get('index')).toBeInstanceOf(Series);
        expect(df.get('index').values.toArray()).toEqual([1, 2, 3]);
        expect(df.get('level_0')).toBeInstanceOf(Series);
        expect(df.get('level_0').values.toArray()).toEqual([2, 3, 4]);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });
    });

    describe('head', () => {
      it('returns the first n rows as a new DataFrame', () => {
        const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);

        const df2 = df.head(2);
        expect(df2.shape.toArray()).toEqual([2, 2]);
        expect(df2.get('x').values.toArray()).toEqual([1, 2]);
        expect(df2.index.toArray()).toEqual([0, 1]);
      });
    });

    describe('tail', () => {
      it('returns the last n rows as a new DataFrame', () => {
        const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);

        const df2 = df.tail(2);
        expect(df2.shape.toArray()).toEqual([2, 2]);
        expect(df2.get('x').values.toArray()).toEqual([3, 4]);
        expect(df2.index.toArray()).toEqual([2, 3]);
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
        expect(row).toBeInstanceOf(Immutable.Map);
        expect(row.get('x')).toEqual(vals[idx].x);
        expect(row.get('y')).toEqual(vals[idx].y);
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
      // n = 10  : .014s
      // n = 25  : .037s
      // n = 50  : .11s
      // n = 100 : .38s
      // n = 200 : 3.2s
      // n = 300 : 5.1s
      // n = 400 : 8.5s
      // n = 800 : 35.7s
      const n = 25;
      const xSeries = new Series(Immutable.Range(0, n).toList());
      const ySeries = new Series(Immutable.Range(1, n + 1).toList());
      const zSeries = new Series(Immutable.Range(n + 2, 2, -1).toList());
      const df1 = new DataFrame(Immutable.Map({x: xSeries, y: ySeries}));
      const df2 = new DataFrame(Immutable.Map({x: xSeries, z: zSeries}));

      const df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(DataFrame);
      expect(df3.length).toEqual(25);
      expect(df3.get('x').values.toArray()).toEqual(xSeries.values.toArray());
      expect(df3.get('y').values.toArray()).toEqual(ySeries.values.toArray());
      expect(df3.get('z').values.toArray()).toEqual(zSeries.values.toArray());
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

  describe('to_excel', () => {
    it('converts a pandas DataFrame to a properly formatted Excel file', () => {
      // TODO
    });
  });

  describe('to_json', () => {
    it('converts a pandas DataFrame to a json object when orient="columns"', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 3]), y: new Series([2, 3, 4])}));

      const dfJSON = df.to_json();
      expect(dfJSON).toEqual({x: {0: 1, 1: 2, 2: 3}, y: {0: 2, 1: 3, 2: 4}});
    });

    it('converts a pandas DataFrame to a json object when orient="records"', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 3]), y: new Series([2, 3, 4])}));

      const dfJSON = df.to_json({orient: 'records'});
      expect(dfJSON).toBeInstanceOf(Array);
      expect(dfJSON[0]).toEqual({x: 1, y: 2});
      expect(dfJSON[1]).toEqual({x: 2, y: 3});
      expect(dfJSON[2]).toEqual({x: 3, y: 4});
    });

    it('converts a pandas DataFrame to a json object when orient="split"', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 3]), y: new Series([2, 3, 4])}));

      const dfJSON = df.to_json({orient: 'split'});
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON.columns).toEqual(['x', 'y']);
      expect(dfJSON.index).toEqual([0, 1, 2]);
      expect(dfJSON.values).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

    it('converts a pandas DataFrame to a json object when orient="index"', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 3]), y: new Series([2, 3, 4])}));

      const dfJSON = df.to_json({orient: 'index'});
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON).toEqual({
        0: {x: 1, y: 2},
        1: {x: 2, y: 3},
        2: {x: 3, y: 4},
      });
    });

    it('converts a pandas DataFrame to a json object when orient="values"', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 3]), y: new Series([2, 3, 4])}));

      const dfJSON = df.to_json({orient: 'values'});
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON).toEqual([[1, 2], [2, 3], [3, 4]]);
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

  describe('cov', () => {
    it('calculates the covariance of all Series in a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);

      const dfCov = df.cov();

      expect(dfCov.get('x').values.toArray()).toEqual([1, -1, 2]);
      expect(dfCov.get('y').values.toArray()).toEqual([-1, 1, -2]);
      expect(dfCov.get('z').values.toArray()).toEqual([2, -2, 4]);
    });
  });

  describe('corr', () => {
    it('calculates the correlation of all Series in a DataFrame', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);

      const dfCorr = df.corr();

      expect(dfCorr.get('x').values.toArray()).toEqual([1, -1, 1]);
      expect(dfCorr.get('y').values.toArray()).toEqual([-1, 1, -1]);
      expect(dfCorr.get('z').values.toArray()).toEqual([1, -1, 1]);
    });
  });

  describe('diff', () => {
    it('calculates the diff along axis 0', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});

      const df2 = df1.diff();
      expect(df2.get('x').values.toArray()).toEqual([null, 1, 1]);
      expect(df2.get('y').values.toArray()).toEqual([null, 1, 1]);
      expect(df2.index.toArray()).toEqual([2, 3, 4]);
    });

    it('calculates the diff along axis 1', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});

      const df2 = df1.diff(1, 1);
      expect(df2.values.get(0).toArray()).toEqual([null, 1]);
      expect(df2.values.get(1).toArray()).toEqual([null, 1]);
      expect(df2.values.get(2).toArray()).toEqual([null, 1]);
      expect(df2.columns.toArray()).toEqual(['x', 'y']);
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

    it('calculates the pct_change along axis 1', () => {
      const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});

      const df2 = df1.pct_change(1, 1);
      expect(df2.values.get(0).toArray()).toEqual([null, 1]);
      expect(df2.values.get(1).toArray()).toEqual([null, 0.5]);
      expect(df2.values.get(2).toArray()).toEqual([null, (4 / 3) - 1]);
      expect(df2.columns.toArray()).toEqual(['x', 'y']);
    });
  });

  describe('pivot', () => {
    it('pivots a DataFrame with unique index, column pairs', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 1}]);

      let dfPv = df.pivot('x', 'y', 'z');

      expect(dfPv).toBeInstanceOf(DataFrame);

      expect(dfPv.get(1).values.toArray()).toEqual([null, 1]);
      expect(dfPv.get(2).values.toArray()).toEqual([3, null]);

      dfPv = df.pivot('z', 'x', 'y');

      expect(dfPv).toBeInstanceOf(DataFrame);
      expect(dfPv.get(1).values.toArray()).toEqual([null, 2]);
      expect(dfPv.get(2).values.toArray()).toEqual([1, null]);
    });

    it('throws an error if column not in df', () => {
      const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);

      expect(() => df.pivot('x', 'y', 'z')).toThrow();
    });

    it('throws an error if index or column not unique', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 1, y: 2, z: 4}]);

      expect(() => df.pivot('x', 'y', 'z')).toThrow();
    });

    it('properly sorts columns', () => {
      const data = JSON.parse("[" +
        "{\"name\":\"Boston, MA - Hispanic - American Indian or Alaska Native\",\"val\":0,\"idx\":1}," +
        "{\"name\":\"Cambridge-Newton-Framingham, MA - Hispanic - American Indian or Alaska Native\",\"val\":1,\"idx\":1}," +
        "{\"name\":\"Worcester, MA-CT - Not Hispanic - Black\",\"val\":4,\"idx\":1}," +
        "{\"name\":\"Worcester, MA-CT - Not Hispanic - American Indian or Alaska Native\",\"val\":9,\"idx\":1}," +
        "{\"name\":\"Cambridge-Newton-Framingham, MA - Hispanic - Black\",\"val\":16,\"idx\":1}," +
        "{\"name\":\"Boston, MA - Hispanic - Black\",\"val\":25,\"idx\":1}," +
        "{\"name\":\"Providence-Warwick, RI-MA - Not Hispanic - American Indian or Alaska Native\",\"val\":36,\"idx\":1}," +
        "{\"name\":\"Providence-Warwick, RI-MA - Hispanic - Black\",\"val\":49,\"idx\":1}," +
        "{\"name\":\"Boston, MA - Not Hispanic - American Indian or Alaska Native\",\"val\":64,\"idx\":1}," +
        "{\"name\":\"Cambridge-Newton-Framingham, MA - Not Hispanic - American Indian or Alaska Native\",\"val\":81,\"idx\":1}," +
        "{\"name\":\"Worcester, MA-CT - Hispanic - American Indian or Alaska Native\",\"val\":100,\"idx\":1}," +
        "{\"name\":\"Worcester, MA-CT - Hispanic - Black\",\"val\":121,\"idx\":1}," +
        "{\"name\":\"Cambridge-Newton-Framingham, MA - Not Hispanic - Black\",\"val\":144,\"idx\":1}," +
        "{\"name\":\"Boston, MA - Not Hispanic - Black\",\"val\":169,\"idx\":1}," +
        "{\"name\":\"Providence-Warwick, RI-MA - Hispanic - American Indian or Alaska Native\",\"val\":196,\"idx\":1}," +
        "{\"name\":\"Providence-Warwick, RI-MA - Not Hispanic - Black\",\"val\":225,\"idx\":1}]");
      const df = new DataFrame(data);

      const dfPv = df.pivot('idx', 'name', 'val');
      expect(dfPv.columns.toArray()).toEqual([ 'Boston, MA - Hispanic - American Indian or Alaska Native',
        'Boston, MA - Hispanic - Black',
        'Boston, MA - Not Hispanic - American Indian or Alaska Native',
        'Boston, MA - Not Hispanic - Black',
        'Cambridge-Newton-Framingham, MA - Hispanic - American Indian or Alaska Native',
        'Cambridge-Newton-Framingham, MA - Hispanic - Black',
        'Cambridge-Newton-Framingham, MA - Not Hispanic - American Indian or Alaska Native',
        'Cambridge-Newton-Framingham, MA - Not Hispanic - Black',
        'Providence-Warwick, RI-MA - Hispanic - American Indian or Alaska Native',
        'Providence-Warwick, RI-MA - Hispanic - Black',
        'Providence-Warwick, RI-MA - Not Hispanic - American Indian or Alaska Native',
        'Providence-Warwick, RI-MA - Not Hispanic - Black',
        'Worcester, MA-CT - Hispanic - American Indian or Alaska Native',
        'Worcester, MA-CT - Hispanic - Black',
        'Worcester, MA-CT - Not Hispanic - American Indian or Alaska Native',
        'Worcester, MA-CT - Not Hispanic - Black' ]);
    });
  });

  describe('iloc', () => {
    it('.iloc(1, 1) returns a DataFrame of shape [1, 1]', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

      const df2 = df.iloc(1, 1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.shape.toArray()).toEqual([1, 1]);
      expect(df2.columns.toArray()).toEqual(['y']);
      expect(df2.get('y').length).toEqual(1);
      expect(df2.get('y').iloc(0)).toEqual(3);

      expect(df2.index.toArray()).toEqual([1]);
    });

    it('.iloc(1, [1, 3]) returns a DataFrame of shape [1, 2]', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

      const df2 = df.iloc(1, [1, 3]);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.shape.toArray()).toEqual([1, 2]);
      expect(df2.columns.toArray()).toEqual(['y', 'z']);
      expect(df2.get('y').length).toEqual(1);
      expect(df2.get('y').iloc(0)).toEqual(3);
      expect(df2.get('z').length).toEqual(1);
      expect(df2.get('z').iloc(0)).toEqual(4);

      expect(df2.index.toArray()).toEqual([1]);
    });

    it('.iloc(1) returns a DataFrame of shape [1, 3]', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

      const df2 = df.iloc(1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.shape.toArray()).toEqual([1, 3]);
      expect(df2.columns.toArray()).toEqual(['x', 'y', 'z']);
      expect(df2.get('x').length).toEqual(1);
      expect(df2.get('x').iloc(0)).toEqual(2);
      expect(df2.get('y').length).toEqual(1);
      expect(df2.get('y').iloc(0)).toEqual(3);
      expect(df2.get('z').length).toEqual(1);
      expect(df2.get('z').iloc(0)).toEqual(4);

      expect(df2.index.toArray()).toEqual([1]);
    });

    it('.iloc([1, 3], 1) returns a DataFrame of shape [2, 1]', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

      const df2 = df.iloc([1, 3], 1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.shape.toArray()).toEqual([2, 1]);
      expect(df2.columns.toArray()).toEqual(['y']);
      expect(df2.get('y').length).toEqual(2);
      expect(df2.get('y').values.toArray()).toEqual([3, 4]);

      expect(df2.index.toArray()).toEqual([1, 2]);
    });

    it('.iloc([1, 3], [1, 3]) returns a DataFrame of shape [2, 2]', () => {
      const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);

      const df2 = df.iloc([1, 3], [1, 3]);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.shape.toArray()).toEqual([2, 2]);
      expect(df2.columns.toArray()).toEqual(['y', 'z']);
      expect(df2.get('y').length).toEqual(2);
      expect(df2.get('y').values.toArray()).toEqual([3, 4]);
      expect(df2.get('z').length).toEqual(2);
      expect(df2.get('z').values.toArray()).toEqual([4, 5]);

      expect(df2.index.toArray()).toEqual([1, 2]);
    });
  });

  describe('cumsum', () => {
    it('sums along axis 0', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cumsum();
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 3, 6]);
      expect(df2.get('y').values.toArray()).toEqual([2, 5, 9]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('sums along axis 1', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cumsum(1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([3, 5, 7]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummul', () => {
    it('multiplies along axis 0', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummul();
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 6]);
      expect(df2.get('y').values.toArray()).toEqual([2, 6, 24]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('multiplies along axis 1', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummul(1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([2, 6, 12]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummin', () => {
    it('Cumulative minimum along axis 0', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummin();
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 1, 1]);
      expect(df2.get('y').values.toArray()).toEqual([2, 2, 2]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('Cumulative minimum along axis 1', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummin(1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummax', () => {
    it('Cumulative maximum along axis 0', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummax();
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('Cumulative maximum along axis 1', () => {
      const df = new DataFrame(
        [{x: 2, y: 1}, {x: 2, y: 3}, {x: 7, y: 4}], {index: [1, 2, 3]});
      const df2 = df.cummax(1);
      expect(df2).toBeInstanceOf(DataFrame);
      expect(df2.get('x').values.toArray()).toEqual([2, 2, 7]);
      expect(df2.get('y').values.toArray()).toEqual([2, 3, 7]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });
  //
  // describe('pivot_table', () => {
  //   it('pivots', () => {
  //     const df = new DataFrame([
  //       {a: 1, b: 1, c: 1, d: 3},
  //       // {a: 1, b: 1, c: 1, d: 4},
  //       {a: 1, b: 1, c: 2, d: 8},
  //       {a: 1, b: 2, c: 1, d: 9},
  //       {a: 1, b: 2, c: 2, d: 10},
  //       {a: 2, b: 1, c: 1, d: 1},
  //       {a: 2, b: 1, c: 2, d: 4},
  //       {a: 2, b: 2, c: 1, d: 1},
  //       {a: 2, b: 2, c: 2, d: 3},
  //       {a: 2, b: 2, c: 2, d: 3},
  //     ]);
  //
  //     console.log(df.pivot_table(['a', 'b'], 'c', 'd'));
  //   });
  // });

  describe('rename', () => {
    it('renames one Series in the DataFrame', () => {
      const df = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df.rename({columns: Immutable.Map({x: 'q'})});

      expect(df.columns.toArray()).toEqual(['x', 'y']);
      expect(df2.columns.toArray()).toEqual(['q', 'y']);
      expect(df2.get('q').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('q').index.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('q').name).toEqual('q');
    });
  });

  describe('length', () => {
    it('Has length zero when empty DataFrame', () => {
      const df = new DataFrame();
      expect(df.length).toEqual(0);

      const df2 = new DataFrame([]);
      expect(df2.length).toEqual(0);
    });

    it('Estimates non-zero length properly', () => {
      const df = new DataFrame(Immutable.Map({x: new Series([1, 2, 5, 4, 3])}));
      expect(df.length).toEqual(5);
    });
  });

  describe('append', () => {
    it('Appends a DataFrame to another when ignore_index is false', () => {
      const df1 = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = new DataFrame(
        [{x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}], {index: [2, 3, 4]});

      const df3 = df1.append(df2);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 2, 3, 4]);
      expect(df3.index.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
    });

    it('Appends a DataFrame to another when ignore_index is true', () => {
      const df1 = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = new DataFrame(
        [{x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}], {index: [2, 3, 4]});

      const df3 = df1.append(df2, true);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 2, 3, 4]);
      expect(df3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('Appends an empty DataFrame to another', () => {
      const df1 = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = new DataFrame([]);

      const df3 = df1.append(df2);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(df3.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('transpose', () => {
    it('Tranposes a DataFrame by flipping indexes and columns', () => {
      const df1 = new DataFrame(
        [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
      const df2 = df1.transpose();

      expect(df2.columns.toArray()).toEqual([1, 2, 3]);
      expect(df2.index.toArray()).toEqual(['x', 'y']);
      expect(df2.get(1).index.toArray()).toEqual(['x', 'y']);

      const df3 = df2.transpose();
      expect(df3.columns.toArray()).toEqual(['x', 'y']);
      expect(df3.index.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('x').index.toArray()).toEqual([1, 2, 3]);
    });
  });
});
