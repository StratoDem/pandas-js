'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _frame = require('../../core/frame');

var _frame2 = _interopRequireDefault(_frame);

var _series = require('../../core/series');

var _series2 = _interopRequireDefault(_series);

var _structs = require('../../core/structs');

var _exceptions = require('../../core/exceptions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('frame', function () {
  describe('DataFrame', function () {
    it('initializes a DataFrame', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);

      expect(df1.get('x')).toBeInstanceOf(_series2.default);
      expect(df1.get('x').values.toArray()).toEqual([1, 2]);
      expect(df1.get('y')).toBeInstanceOf(_series2.default);
      expect(df1.get('y').values.toArray()).toEqual([2, 3]);
    });

    describe('toString', function () {
      it('logs the DataFrame properly', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
        df1.columns = ['date', 'unemployment_rate_x'];
        var df2 = new _frame2.default([{ x: 1, y: 3 }, { x: 2, y: 4 }]);
        df2.columns = ['date', 'unemployment_rate_y'];

        df1.merge(df2, ['date']).toString();
      });
    });

    describe('set', function () {
      it('sets a new Series column at the index', function () {
        var df = new _frame2.default([{ x: 1 }, { x: 2 }, { x: 3 }]);
        var df2 = df.set('y', new _series2.default([2, 3, 4]));
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      });

      it('sets a new List column at the index', function () {
        var df = new _frame2.default([{ x: 1 }, { x: 2 }, { x: 3 }]);
        var df2 = df.set('y', _immutable2.default.List([2, 3, 4]));
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      });

      it('sets a new Array column at the index', function () {
        var df = new _frame2.default([{ x: 1 }, { x: 2 }, { x: 3 }]);
        var df2 = df.set('y', [2, 3, 4]);
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      });
    });

    describe('index', function () {
      it('index is set properly as the [0, ..., length - 1] if not passed in constructor', function () {
        var df1 = new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }]);
        expect(df1.index.toArray()).toEqual([0, 1, 2]);
      });

      it('index is set properly as the index array passed in in constructor', function () {
        var df1 = new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }], { index: [1, 2, 3] });
        expect(df1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('index is set properly as the index List passed in in constructor', function () {
        var df1 = new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }], { index: _immutable2.default.List([1, 2, 3]) });
        expect(df1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('throws IndexMismatchError if the index does not match', function () {
        var f = function f() {
          return new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }], { index: _immutable2.default.List([1, 2, 3, 4]) });
        };
        expect(f).toThrowError(_exceptions.IndexMismatchError);
      });

      it('index setter updates the index if proper length array passed in', function () {
        var df1 = new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }], { index: _immutable2.default.List([1, 2, 3]) });
        df1.index = _immutable2.default.List([2, 3, 4]);

        expect(df1.index.toArray()).toEqual([2, 3, 4]);
        expect(df1.get('x').index.toArray()).toEqual([2, 3, 4]);
      });

      it('throws IndexMismatchError in setter if index does not match', function () {
        var df1 = new _frame2.default([{ x: 1.5 }, { x: 1.2 }, { x: 1.3 }], { index: _immutable2.default.List([1, 2, 3]) });
        var f = function f() {
          df1.index = _immutable2.default.List([2, 3, 4, 5]);
        };
        expect(f).toThrowError(_exceptions.IndexMismatchError);
      });
    });

    describe('columns', function () {
      it('columns are set properly', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
        expect(df1.columns.toArray()).toEqual(['x', 'y']);
      });

      it('new columns of equal length can be set', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
        df1.columns = ['a', 'x'];

        expect(df1.columns.toArray()).toEqual(['a', 'x']);
        expect(df1.get('a')).toBeInstanceOf(_series2.default);
        expect(df1.get('x')).toBeInstanceOf(_series2.default);
        expect(df1.get('x').values.toArray()).toEqual([2, 3]);
      });
    });

    describe('get', function () {
      it('gets one column as a Series when string passed in', function () {
        var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

        var ds = df.get('y');
        expect(ds).toBeInstanceOf(_series2.default);
        expect(ds.values.toArray()).toEqual([2, 3, 4]);
      });

      it('gets multiple columns as a DataFrame when Iterable of strings passed in', function () {
        var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

        var df2 = df.get(['y', 'z']);
        expect(df2).toBeInstanceOf(_frame2.default);
        expect(df2.columns.toArray()).toEqual(['y', 'z']);
        expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df2.get('z').values.toArray()).toEqual([3, 4, 5]);
      });
    });

    describe('reset_index', function () {
      it('resets the index to a range and places "index" as a column in the DataFrame', function () {
        var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }], { index: [1, 2, 3] }).reset_index();

        expect(df.get('index')).toBeInstanceOf(_series2.default);
        expect(df.get('index').values.toArray()).toEqual([1, 2, 3]);
        expect(df.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });

      it('resets the index to a range and does not include "index" in the DataFrame', function () {
        var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }], { index: [1, 2, 3] }).reset_index({ drop: true });

        expect(df.columns.toArray()).toEqual(['x', 'y', 'z']);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });

      it('resets the index to a range and includes "level_0" in the DataFrame', function () {
        var df = new _frame2.default([{ index: 1, y: 2, z: 3 }, { index: 2, y: 3, z: 4 }, { index: 3, y: 4, z: 5 }], { index: [2, 3, 4] }).reset_index();

        expect(df.get('index')).toBeInstanceOf(_series2.default);
        expect(df.get('index').values.toArray()).toEqual([1, 2, 3]);
        expect(df.get('level_0')).toBeInstanceOf(_series2.default);
        expect(df.get('level_0').values.toArray()).toEqual([2, 3, 4]);
        expect(df.index.toArray()).toEqual([0, 1, 2]);
      });
    });

    describe('head', function () {
      it('returns the first n rows as a new DataFrame', function () {
        var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }]);

        var df2 = df.head(2);
        expect(df2.shape.toArray()).toEqual([2, 2]);
        expect(df2.get('x').values.toArray()).toEqual([1, 2]);
        expect(df2.index.toArray()).toEqual([0, 1]);
      });
    });

    describe('tail', function () {
      it('returns the last n rows as a new DataFrame', function () {
        var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }]);

        var df2 = df.tail(2);
        expect(df2.shape.toArray()).toEqual([2, 2]);
        expect(df2.get('x').values.toArray()).toEqual([3, 4]);
        expect(df2.index.toArray()).toEqual([2, 3]);
      });
    });

    it('measures length properly', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]);
      expect(df1.length).toEqual(3);
    });

    it('Is iterable via iterrows', function () {
      var vals = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }];
      var df1 = new _frame2.default(vals);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = df1.iterrows()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              row = _step$value[0],
              idx = _step$value[1];

          expect(row).toBeInstanceOf(_immutable2.default.Map);
          expect(row.get('x')).toEqual(vals[idx].x);
          expect(row.get('y')).toEqual(vals[idx].y);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });

    describe('sum', function () {
      it('sums along axis 0', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 10 }]);
        var ds_sum = df1.sum();
        expect(ds_sum).toBeInstanceOf(_series2.default);
        expect(ds_sum.values.toArray()).toEqual([3, 5, 13]);
        expect(ds_sum.index.toArray()).toEqual(['x', 'y', 'z']);
      });

      it('sums along axis 1', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 10 }], { index: [2, 3] });
        var ds_sum = df1.sum(1);
        expect(ds_sum).toBeInstanceOf(_series2.default);
        expect(ds_sum.values.toArray()).toEqual([6, 15]);
        expect(ds_sum.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('mean', function () {
      it('takes mean along axis 0', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 10 }]);
        var ds_sum = df1.mean();
        expect(ds_sum).toBeInstanceOf(_series2.default);
        expect(ds_sum.values.toArray()).toEqual([1.5, 2.5, 6.5]);
        expect(ds_sum.index.toArray()).toEqual(['x', 'y', 'z']);
      });

      it('takes mean along axis 1', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 10 }], { index: [2, 3] });
        var ds_mean = df1.mean(1);
        expect(ds_mean).toBeInstanceOf(_series2.default);
        expect(ds_mean.values.toArray()).toEqual([2, 5]);
        expect(ds_mean.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('variance', function () {
      it('takes variance along axis 0', function () {
        var df1 = new _frame2.default([{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 5 }]);
        var ds_var = df1.variance();
        expect(ds_var).toBeInstanceOf(_series2.default);
        expect(ds_var.values.toArray()).toEqual([1, 4]);
        expect(ds_var.index.toArray()).toEqual(['x', 'y']);
      });

      it('takes variance along axis 1', function () {
        var df1 = new _frame2.default([{ x: 1, y: 1, z: 1 }, { x: 2, y: 3, z: 4 }], { index: [2, 3] });
        var ds_var = df1.variance(1);
        expect(ds_var).toBeInstanceOf(_series2.default);
        expect(ds_var.values.toArray()).toEqual([0, 1]);
        expect(ds_var.index.toArray()).toEqual([2, 3]);
      });
    });

    describe('std', function () {
      it('takes standard deviation along axis 0', function () {
        var df1 = new _frame2.default([{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 5 }]);
        var ds_std = df1.std();
        expect(ds_std).toBeInstanceOf(_series2.default);
        expect(ds_std.values.toArray()).toEqual([1, 2]);
        expect(ds_std.index.toArray()).toEqual(['x', 'y']);
      });

      it('takes standard deviation along axis 1', function () {
        var df1 = new _frame2.default([{ x: 1, y: 1, z: 1 }, { x: 2, y: 3, z: 4 }], { index: [2, 3] });
        var ds_std = df1.std(1);
        expect(ds_std).toBeInstanceOf(_series2.default);
        expect(ds_std.values.toArray()).toEqual([0, 1]);
        expect(ds_std.index.toArray()).toEqual([2, 3]);
      });
    });
  });

  describe('mergeDataFrame', function () {
    describe('innerMerge', function () {
      it('merges two DataFrames on a given key', function () {
        var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
        var df1 = new _frame2.default(vals1);
        var vals2 = [{ x: 2, z: 6 }, { x: 1, z: 1 }, { x: 3, z: 100 }];
        var df2 = new _frame2.default(vals2);

        var df3 = (0, _frame.mergeDataFrame)(df1, df2, ['x'], 'inner');
        expect(df3).toBeInstanceOf(_frame2.default);
        expect(df3.length).toEqual(3);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
        expect(df3.get('y').values.toArray()).toEqual([2, 3, 4]);
        expect(df3.get('z').values.toArray()).toEqual([1, 6, 100]);
      });

      it('replaces a common column with _x and _y', function () {
        var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
        var df1 = new _frame2.default(vals1);
        var vals2 = [{ x: 2, y: 6 }, { x: 1, y: 1 }, { x: 3, y: 100 }];
        var df2 = new _frame2.default(vals2);

        var df3 = (0, _frame.mergeDataFrame)(df1, df2, ['x'], 'inner');
        expect(df3).toBeInstanceOf(_frame2.default);
        expect(df3.length).toEqual(3);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
        expect(df3.get('y_x').values.toArray()).toEqual([2, 3, 4]);
        expect(df3.get('y_y').values.toArray()).toEqual([1, 6, 100]);
      });

      it('merges on a date column', function () {
        var vals1 = [{ date: '01-01-2010', unemployment_rate: 2 }, { date: '01-01-2011', unemployment_rate: 3 }, { date: '01-01-2012', unemployment_rate: 4 }, { date: '01-01-2013', unemployment_rate: 10 }];
        var df1 = new _frame2.default(vals1);
        var vals2 = [{ date: '01-01-2010', unemployment_rate: 5 }, { date: '01-01-2011', unemployment_rate: 7 }, { date: '01-01-2012', unemployment_rate: 20 }, { date: '01-01-2013', unemployment_rate: 23 }];
        var df2 = new _frame2.default(vals2);

        var df3 = (0, _frame.mergeDataFrame)(df1, df2, ['date']);
        expect(df3).toBeInstanceOf(_frame2.default);
        expect(df3.length).toEqual(4);
        expect(df3.get('date').values.toArray()).toEqual(["01-01-2010", "01-01-2011", "01-01-2012", "01-01-2013"]);
        expect(df3.get('unemployment_rate_x').values.toArray()).toEqual([2, 3, 4, 10]);
        expect(df3.get('unemployment_rate_y').values.toArray()).toEqual([5, 7, 20, 23]);
      });
    });

    describe('outerMerge', function () {
      it('merges two DataFrames on a given key', function () {
        var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
        var df1 = new _frame2.default(vals1);
        var vals2 = [{ x: 2, z: 6 }, { x: 1, z: 1 }, { x: 3, z: 100 }, { x: 5, z: 200 }];
        var df2 = new _frame2.default(vals2);

        var df3 = (0, _frame.mergeDataFrame)(df1, df2, ['x'], 'outer');
        expect(df3).toBeInstanceOf(_frame2.default);
        expect(df3.length).toEqual(5);
        expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 4, 5]);
        expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 10, null]);
        expect(df3.get('z').values.toArray()).toEqual([1, 6, 100, null, 200]);
      });
    });
  });

  describe('values', function () {
    it('values returns an Immutable.List of Immutable.Lists with [row][column] indexing', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
      var df1 = new _frame2.default(vals1);

      expect(df1.values).toBeInstanceOf(_immutable2.default.List);
      df1.values.forEach(function (r, idx) {
        expect(r).toBeInstanceOf(_immutable2.default.List);
        expect(r.get(0)).toEqual(vals1[idx].x);
        expect(r.get(1)).toEqual(vals1[idx].y);
      });
    });

    it('values equality check is true if data is unchanged', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
      var df1 = new _frame2.default(vals1);

      expect(df1.values === df1.values).toEqual(true);
    });
  });

  describe('merge', function () {
    it('merges a second DataFrame to this instance on a given key', function () {
      // n = 10  : .014s
      // n = 25  : .037s
      // n = 50  : .11s
      // n = 100 : .38s
      // n = 200 : 3.2s
      // n = 300 : 5.1s
      // n = 400 : 8.5s
      // n = 800 : 35.7s
      var n = 25;
      var xSeries = new _series2.default(_immutable2.default.Range(0, n).toList());
      var ySeries = new _series2.default(_immutable2.default.Range(1, n + 1).toList());
      var zSeries = new _series2.default(_immutable2.default.Range(n + 2, 2, -1).toList());
      var df1 = new _frame2.default(_immutable2.default.Map({ x: xSeries, y: ySeries }));
      var df2 = new _frame2.default(_immutable2.default.Map({ x: xSeries, z: zSeries }));

      var df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(_frame2.default);
      expect(df3.length).toEqual(25);
      expect(df3.get('x').values.toArray()).toEqual(xSeries.values.toArray());
      expect(df3.get('y').values.toArray()).toEqual(ySeries.values.toArray());
      expect(df3.get('z').values.toArray()).toEqual(zSeries.values.toArray());
    });

    it('merges a second DataFrame after columns are renamed', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
      var df1 = new _frame2.default(vals1);
      df1.columns = ['x', 'a'];
      var vals2 = [{ x: 2, z: 6 }, { x: 1, z: 1 }, { x: 3, z: 100 }];
      var df2 = new _frame2.default(vals2);
      df2.columns = ['x', 'b'];

      var df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(_frame2.default);
      expect(df3.length).toEqual(3);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('a').values.toArray()).toEqual([2, 3, 4]);
      expect(df3.get('b').values.toArray()).toEqual([1, 6, 100]);
    });
  });

  describe('to_csv', function () {
    it('converts a pandas.DataFrame to a properly formatted csv string', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 8 }];
      var df1 = new _frame2.default(vals1);

      expect(df1.to_csv()).toEqual('x,y,\r\n1,2,\r\n3,3,\r\n4,8,\r\n');

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = df1.iterrows()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          // console.log(r.values);

          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              r = _step2$value[0],
              idx = _step2$value[1];
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    });
  });

  describe('to_excel', function () {
    it('converts a pandas DataFrame to a properly formatted Excel file', function () {
      // TODO
    });
  });

  describe('to_json', function () {
    it('converts a pandas DataFrame to a json object when orient="columns"', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 3]), y: new _series2.default([2, 3, 4]) }));

      var dfJSON = df.to_json();
      expect(dfJSON).toEqual({ x: { 0: 1, 1: 2, 2: 3 }, y: { 0: 2, 1: 3, 2: 4 } });
    });

    it('converts a pandas DataFrame to a json object when orient="records"', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 3]), y: new _series2.default([2, 3, 4]) }));

      var dfJSON = df.to_json({ orient: 'records' });
      expect(dfJSON).toBeInstanceOf(Array);
      expect(dfJSON[0]).toEqual({ x: 1, y: 2 });
      expect(dfJSON[1]).toEqual({ x: 2, y: 3 });
      expect(dfJSON[2]).toEqual({ x: 3, y: 4 });
    });

    it('converts a pandas DataFrame to a json object when orient="split"', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 3]), y: new _series2.default([2, 3, 4]) }));

      var dfJSON = df.to_json({ orient: 'split' });
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON.columns).toEqual(['x', 'y']);
      expect(dfJSON.index).toEqual([0, 1, 2]);
      expect(dfJSON.values).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

    it('converts a pandas DataFrame to a json object when orient="index"', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 3]), y: new _series2.default([2, 3, 4]) }));

      var dfJSON = df.to_json({ orient: 'index' });
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON).toEqual({
        0: { x: 1, y: 2 },
        1: { x: 2, y: 3 },
        2: { x: 3, y: 4 }
      });
    });

    it('converts a pandas DataFrame to a json object when orient="values"', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 3]), y: new _series2.default([2, 3, 4]) }));

      var dfJSON = df.to_json({ orient: 'values' });
      expect(dfJSON).toBeInstanceOf(Object);
      expect(dfJSON).toEqual([[1, 2], [2, 3], [3, 4]]);
    });
  });

  describe('where', function () {
    it('checks for equality of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.where(1, function (a, b) {
        return a === b;
      });

      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for equality of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.where(new _series2.default([1, 3]), function (a, b) {
        return a === b;
      });

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for equality of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.where(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]), function (a, b) {
        return a === b;
      });

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('eq', function () {
    it('checks for equality of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.eq(1);

      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for equality of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.eq(new _series2.default([1, 3]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for equality of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.eq(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('gt', function () {
    it('checks for greater than of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gt(1);

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gt(new _series2.default([1, 3]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });

    it('checks for greater than of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gt(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });
  });

  describe('gte', function () {
    it('checks for greater than or equal of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gte(1);

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than or equal of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gte(new _series2.default([1, 3]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });

    it('checks for greater than or equal of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.gte(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, true]);
    });
  });

  describe('lt', function () {
    it('checks for less than of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lt(1);

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lt(new _series2.default([1, 3]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([false, true]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lt(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });
  });

  describe('lte', function () {
    it('checks for less than or equal of a scalar and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lte(1);

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, false]);
      expect(df2.get('y').values.toArray()).toEqual([false, false]);
    });

    it('checks for less than or equal of a Series and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lte(new _series2.default([1, 3]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([false, true]);
    });

    it('checks for less than or equal of a DataFrame and returns a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.lte(new _frame2.default([{ a: 2, b: 2 }, { a: 2, b: 2 }]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([true, true]);
      expect(df2.get('y').values.toArray()).toEqual([true, false]);
    });
  });

  describe('filter', function () {
    it('takes a Series boolean and returns the subset of the DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.filter(df.get('x').gt(1));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });

    it('takes a Array boolean and returns the subset of the DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.filter([false, true]);

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });

    it('takes a List boolean and returns the subset of the DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
      var df2 = df.filter(_immutable2.default.List([false, true]));

      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([2]);
      expect(df2.get('y').values.toArray()).toEqual([3]);
    });
  });

  describe('cov', function () {
    it('calculates the covariance of all Series in a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 1, z: 5 }, { x: 3, y: 0, z: 7 }]);

      var dfCov = df.cov();

      expect(dfCov.get('x').values.toArray()).toEqual([1, -1, 2]);
      expect(dfCov.get('y').values.toArray()).toEqual([-1, 1, -2]);
      expect(dfCov.get('z').values.toArray()).toEqual([2, -2, 4]);
    });
  });

  describe('corr', function () {
    it('calculates the correlation of all Series in a DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 1, z: 5 }, { x: 3, y: 0, z: 7 }]);

      var dfCorr = df.corr();

      expect(dfCorr.get('x').values.toArray()).toEqual([1, -1, 1]);
      expect(dfCorr.get('y').values.toArray()).toEqual([-1, 1, -1]);
      expect(dfCorr.get('z').values.toArray()).toEqual([1, -1, 1]);
    });
  });

  describe('diff', function () {
    it('calculates the diff along axis 0', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [2, 3, 4] });

      var df2 = df1.diff();
      expect(df2.get('x').values.toArray()).toEqual([null, 1, 1]);
      expect(df2.get('y').values.toArray()).toEqual([null, 1, 1]);
      expect(df2.index.toArray()).toEqual([2, 3, 4]);
    });

    it('calculates the diff along axis 1', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [2, 3, 4] });

      var df2 = df1.diff(1, 1);
      expect(df2.values.get(0).toArray()).toEqual([null, 1]);
      expect(df2.values.get(1).toArray()).toEqual([null, 1]);
      expect(df2.values.get(2).toArray()).toEqual([null, 1]);
      expect(df2.columns.toArray()).toEqual(['x', 'y']);
    });
  });

  describe('pct_change', function () {
    it('calculates the pct_change along axis 0', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [2, 3, 4] });

      var df2 = df1.pct_change();
      expect(df2.get('x').values.toArray()).toEqual([null, 1, 0.5]);
      expect(df2.get('y').values.toArray()).toEqual([null, 0.5, 4 / 3 - 1]);
      expect(df2.index.toArray()).toEqual([2, 3, 4]);
    });

    it('calculates the pct_change along axis 1', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [2, 3, 4] });

      var df2 = df1.pct_change(1, 1);
      expect(df2.values.get(0).toArray()).toEqual([null, 1]);
      expect(df2.values.get(1).toArray()).toEqual([null, 0.5]);
      expect(df2.values.get(2).toArray()).toEqual([null, 4 / 3 - 1]);
      expect(df2.columns.toArray()).toEqual(['x', 'y']);
    });
  });

  describe('pivot', function () {
    it('pivots a DataFrame with unique index, column pairs', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 1, z: 1 }]);

      var dfPv = df.pivot('x', 'y', 'z');

      expect(dfPv).toBeInstanceOf(_frame2.default);

      expect(dfPv.get(1).values.toArray()).toEqual([null, 1]);
      expect(dfPv.get(2).values.toArray()).toEqual([3, null]);

      dfPv = df.pivot('z', 'x', 'y');

      expect(dfPv).toBeInstanceOf(_frame2.default);
      expect(dfPv.get(1).values.toArray()).toEqual([null, 2]);
      expect(dfPv.get(2).values.toArray()).toEqual([1, null]);
    });

    it('throws an error if column not in df', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);

      expect(function () {
        return df.pivot('x', 'y', 'z');
      }).toThrow();
    });

    it('throws an error if index or column not unique', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 }]);

      expect(function () {
        return df.pivot('x', 'y', 'z');
      }).toThrow();
    });

    it('properly sorts columns', function () {
      var data = JSON.parse("[" + "{\"name\":\"Boston, MA - Hispanic - American Indian or Alaska Native\",\"val\":0,\"idx\":1}," + "{\"name\":\"Cambridge-Newton-Framingham, MA - Hispanic - American Indian or Alaska Native\",\"val\":1,\"idx\":1}," + "{\"name\":\"Worcester, MA-CT - Not Hispanic - Black\",\"val\":4,\"idx\":1}," + "{\"name\":\"Worcester, MA-CT - Not Hispanic - American Indian or Alaska Native\",\"val\":9,\"idx\":1}," + "{\"name\":\"Cambridge-Newton-Framingham, MA - Hispanic - Black\",\"val\":16,\"idx\":1}," + "{\"name\":\"Boston, MA - Hispanic - Black\",\"val\":25,\"idx\":1}," + "{\"name\":\"Providence-Warwick, RI-MA - Not Hispanic - American Indian or Alaska Native\",\"val\":36,\"idx\":1}," + "{\"name\":\"Providence-Warwick, RI-MA - Hispanic - Black\",\"val\":49,\"idx\":1}," + "{\"name\":\"Boston, MA - Not Hispanic - American Indian or Alaska Native\",\"val\":64,\"idx\":1}," + "{\"name\":\"Cambridge-Newton-Framingham, MA - Not Hispanic - American Indian or Alaska Native\",\"val\":81,\"idx\":1}," + "{\"name\":\"Worcester, MA-CT - Hispanic - American Indian or Alaska Native\",\"val\":100,\"idx\":1}," + "{\"name\":\"Worcester, MA-CT - Hispanic - Black\",\"val\":121,\"idx\":1}," + "{\"name\":\"Cambridge-Newton-Framingham, MA - Not Hispanic - Black\",\"val\":144,\"idx\":1}," + "{\"name\":\"Boston, MA - Not Hispanic - Black\",\"val\":169,\"idx\":1}," + "{\"name\":\"Providence-Warwick, RI-MA - Hispanic - American Indian or Alaska Native\",\"val\":196,\"idx\":1}," + "{\"name\":\"Providence-Warwick, RI-MA - Not Hispanic - Black\",\"val\":225,\"idx\":1}]");
      var df = new _frame2.default(data);

      var dfPv = df.pivot('idx', 'name', 'val');
      expect(dfPv.columns.toArray()).toEqual(['Boston, MA - Hispanic - American Indian or Alaska Native', 'Boston, MA - Hispanic - Black', 'Boston, MA - Not Hispanic - American Indian or Alaska Native', 'Boston, MA - Not Hispanic - Black', 'Cambridge-Newton-Framingham, MA - Hispanic - American Indian or Alaska Native', 'Cambridge-Newton-Framingham, MA - Hispanic - Black', 'Cambridge-Newton-Framingham, MA - Not Hispanic - American Indian or Alaska Native', 'Cambridge-Newton-Framingham, MA - Not Hispanic - Black', 'Providence-Warwick, RI-MA - Hispanic - American Indian or Alaska Native', 'Providence-Warwick, RI-MA - Hispanic - Black', 'Providence-Warwick, RI-MA - Not Hispanic - American Indian or Alaska Native', 'Providence-Warwick, RI-MA - Not Hispanic - Black', 'Worcester, MA-CT - Hispanic - American Indian or Alaska Native', 'Worcester, MA-CT - Hispanic - Black', 'Worcester, MA-CT - Not Hispanic - American Indian or Alaska Native', 'Worcester, MA-CT - Not Hispanic - Black']);
    });
  });

  describe('iloc', function () {
    it('.iloc(1, 1) returns a DataFrame of shape [1, 1]', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

      var df2 = df.iloc(1, 1);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.shape.toArray()).toEqual([1, 1]);
      expect(df2.columns.toArray()).toEqual(['y']);
      expect(df2.get('y').length).toEqual(1);
      expect(df2.get('y').iloc(0)).toEqual(3);

      expect(df2.index.toArray()).toEqual([1]);
    });

    it('.iloc(1, [1, 3]) returns a DataFrame of shape [1, 2]', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

      var df2 = df.iloc(1, [1, 3]);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.shape.toArray()).toEqual([1, 2]);
      expect(df2.columns.toArray()).toEqual(['y', 'z']);
      expect(df2.get('y').length).toEqual(1);
      expect(df2.get('y').iloc(0)).toEqual(3);
      expect(df2.get('z').length).toEqual(1);
      expect(df2.get('z').iloc(0)).toEqual(4);

      expect(df2.index.toArray()).toEqual([1]);
    });

    it('.iloc(1) returns a DataFrame of shape [1, 3]', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

      var df2 = df.iloc(1);
      expect(df2).toBeInstanceOf(_frame2.default);
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

    it('.iloc([1, 3], 1) returns a DataFrame of shape [2, 1]', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

      var df2 = df.iloc([1, 3], 1);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.shape.toArray()).toEqual([2, 1]);
      expect(df2.columns.toArray()).toEqual(['y']);
      expect(df2.get('y').length).toEqual(2);
      expect(df2.get('y').values.toArray()).toEqual([3, 4]);

      expect(df2.index.toArray()).toEqual([1, 2]);
    });

    it('.iloc([1, 3], [1, 3]) returns a DataFrame of shape [2, 2]', function () {
      var df = new _frame2.default([{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }, { x: 3, y: 4, z: 5 }]);

      var df2 = df.iloc([1, 3], [1, 3]);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.shape.toArray()).toEqual([2, 2]);
      expect(df2.columns.toArray()).toEqual(['y', 'z']);
      expect(df2.get('y').length).toEqual(2);
      expect(df2.get('y').values.toArray()).toEqual([3, 4]);
      expect(df2.get('z').length).toEqual(2);
      expect(df2.get('z').values.toArray()).toEqual([4, 5]);

      expect(df2.index.toArray()).toEqual([1, 2]);
    });
  });

  describe('cumsum', function () {
    it('sums along axis 0', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cumsum();
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 3, 6]);
      expect(df2.get('y').values.toArray()).toEqual([2, 5, 9]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('sums along axis 1', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cumsum(1);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([3, 5, 7]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummul', function () {
    it('multiplies along axis 0', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummul();
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 6]);
      expect(df2.get('y').values.toArray()).toEqual([2, 6, 24]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('multiplies along axis 1', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummul(1);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([2, 6, 12]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummin', function () {
    it('Cumulative minimum along axis 0', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummin();
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 1, 1]);
      expect(df2.get('y').values.toArray()).toEqual([2, 2, 2]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('Cumulative minimum along axis 1', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummin(1);
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('cummax', function () {
    it('Cumulative maximum along axis 0', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummax();
      expect(df2).toBeInstanceOf(_frame2.default);
      expect(df2.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(df2.index.toArray()).toEqual([1, 2, 3]);
    });

    it('Cumulative maximum along axis 1', function () {
      var df = new _frame2.default([{ x: 2, y: 1 }, { x: 2, y: 3 }, { x: 7, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.cummax(1);
      expect(df2).toBeInstanceOf(_frame2.default);
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

  describe('rename', function () {
    it('renames one Series in the DataFrame', function () {
      var df = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df.rename({ columns: _immutable2.default.Map({ x: 'q' }) });

      expect(df.columns.toArray()).toEqual(['x', 'y']);
      expect(df2.columns.toArray()).toEqual(['q', 'y']);
      expect(df2.get('q').values.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('q').index.toArray()).toEqual([1, 2, 3]);
      expect(df2.get('q').name).toEqual('q');
    });
  });

  describe('length', function () {
    it('Has length zero when empty DataFrame', function () {
      var df = new _frame2.default();
      expect(df.length).toEqual(0);

      var df2 = new _frame2.default([]);
      expect(df2.length).toEqual(0);
    });

    it('Estimates non-zero length properly', function () {
      var df = new _frame2.default(_immutable2.default.Map({ x: new _series2.default([1, 2, 5, 4, 3]) }));
      expect(df.length).toEqual(5);
    });
  });

  describe('append', function () {
    it('Appends a DataFrame to another when ignore_index is false', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = new _frame2.default([{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }], { index: [2, 3, 4] });

      var df3 = df1.append(df2);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 2, 3, 4]);
      expect(df3.index.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
    });

    it('Appends a DataFrame to another when ignore_index is true', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = new _frame2.default([{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }], { index: [2, 3, 4] });

      var df3 = df1.append(df2, true);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4, 2, 3, 4]);
      expect(df3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('Appends an empty DataFrame to another', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = new _frame2.default([]);

      var df3 = df1.append(df2);
      expect(df3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(df3.index.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('transpose', function () {
    it('Tranposes a DataFrame by flipping indexes and columns', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }], { index: [1, 2, 3] });
      var df2 = df1.transpose();

      expect(df2.columns.toArray()).toEqual([1, 2, 3]);
      expect(df2.index.toArray()).toEqual(['x', 'y']);
      expect(df2.get(1).index.toArray()).toEqual(['x', 'y']);

      var df3 = df2.transpose();
      expect(df3.columns.toArray()).toEqual(['x', 'y']);
      expect(df3.index.toArray()).toEqual([1, 2, 3]);
      expect(df3.get('x').index.toArray()).toEqual([1, 2, 3]);
    });
  });
});

//# sourceMappingURL=frame.js.map