'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _series = require('../../core/series');

var _series2 = _interopRequireDefault(_series);

var _dtype = require('../../core/dtype');

var dtype = _interopRequireWildcard(_dtype);

var _exceptions = require('../../core/exceptions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('series', function () {
  describe('Series', function () {
    it('initializes properly with an Array', function () {
      expect(new _series2.default([1, 2, 3]).values).toBeInstanceOf(_immutable2.default.List);
      expect(new _series2.default([1, 2, 3]).values.toArray()).toEqual([1, 2, 3]);

      expect(new _series2.default([1, 2, 3], { name: 'Test name' }).name).toEqual('Test name');
    });

    it('toString', function () {
      var ds1 = new _series2.default([1.5, 2.1, 3.9]);

      expect(ds1.toString()).toEqual('0\t1.5\n1\t2.1\n2\t3.9\nName: , dtype: dtype(float)');
    });

    it('head', function () {
      var ds = new _series2.default([1, 2, 3, 4, 5]);
      expect(ds.head(3).values.toArray()).toEqual([1, 2, 3]);
    });

    it('tail', function () {
      var ds = new _series2.default([1, 2, 3, 4, 5]);
      expect(ds.tail(3).values.toArray()).toEqual([3, 4, 5]);
    });

    it('copy', function () {
      var ds1 = new _series2.default([1, 2, 3, 4], { index: [2, 3, 4, 5], name: 'Test name' });
      var ds2 = ds1.copy();

      expect(ds2).toBeInstanceOf(_series2.default);
      expect(ds2.values.toArray()).toEqual([1, 2, 3, 4]);

      expect(ds1.name).toEqual('Test name');

      ds2.index = [1, 2, 3, 4];
      expect(ds1.index.toArray()).toEqual([2, 3, 4, 5]);
      expect(ds2.index.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('shape', function () {
      var ds = new _series2.default([1, 2, 3, 4, 5]);
      expect(ds.shape).toBeInstanceOf(_immutable2.default.Seq);
      expect(ds.shape.toArray()).toEqual([5]);
    });

    it('rename', function () {
      var ds = new _series2.default([1, 2, 3], { name: 'test name' });
      expect(ds.name).toEqual('test name');
      var ds2 = ds.rename('test name 2');
      expect(ds.name).toEqual('test name');
      expect(ds2.name).toEqual('test name 2');
    });

    describe('astype', function () {
      it('converts a float Series to an integer Series', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9]);
        expect(ds1.dtype.dtype).toEqual('float');

        var ds2 = ds1.astype(new dtype.DType('int'));
        expect(ds2.values.toArray()).toEqual([1, 2, 3]);
      });
    });

    describe('index', function () {
      it('index is set properly as the [0, ..., length - 1] if not passed in constructor', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9]);
        expect(ds1.index.toArray()).toEqual([0, 1, 2]);
      });

      it('index is set properly as the index array passed in in constructor', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9], { index: [1, 2, 3] });
        expect(ds1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('index is set properly as the index List passed in in constructor', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9], { index: _immutable2.default.List([1, 2, 3]) });
        expect(ds1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('throws IndexMismatchError if the index does not match', function () {
        var f = function f() {
          return new _series2.default([1.5, 2.1, 3.9], { index: _immutable2.default.List([1, 2, 3, 4]) });
        };
        expect(f).toThrowError(_exceptions.IndexMismatchError);
      });

      it('index setter updates the index if proper length array passed in', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9], { index: _immutable2.default.List([1, 2, 3]) });
        ds1.index = _immutable2.default.List([2, 3, 4]);

        expect(ds1.index.toArray()).toEqual([2, 3, 4]);
      });

      it('throws IndexMismatchError in setter if index does not match', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9], { index: _immutable2.default.List([1, 2, 3]) });
        var f = function f() {
          ds1.index = _immutable2.default.List([2, 3, 4, 5]);
        };
        expect(f).toThrowError(_exceptions.IndexMismatchError);
      });
    });

    describe('iloc()', function () {
      it('gets the value in a pandas.Series at the index', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9]);

        expect(ds1.iloc(0)).toEqual(1.5);
        expect(ds1.iloc(1)).toEqual(2.1);
        expect(ds1.iloc(2)).toEqual(3.9);
      });

      it('gets a Series between startVal and endVal', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9]);

        expect(ds1.iloc(0, 2)).toBeInstanceOf(_series2.default);
        expect(ds1.iloc(0, 1).values.toArray()).toEqual([1.5]);
        expect(ds1.iloc(0, 2).values.toArray()).toEqual([1.5, 2.1]);
        expect(ds1.iloc(1, 3).values.toArray()).toEqual([2.1, 3.9]);
      });
    });

    describe('map()', function () {
      it('applies a function over the series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = ds1.map(function (v) {
          return v * 2;
        });

        expect(ds2).toBeInstanceOf(_series2.default);
        expect(ds2.values.toArray()).toEqual([2, 4, 6]);
      });
    });

    describe('forEach()', function () {
      var ds = new _series2.default([1, 2, 3, 4]);

      var a = 0;
      ds.forEach(function (val) {
        a += val;
      });
      expect(a).toEqual(10);
    });

    describe('sum()', function () {
      it('returns the sum of the Series', function () {
        expect(new _series2.default([1, 2, 3]).sum()).toEqual(6);
      });
    });

    describe('mean()', function () {
      it('returns the mean of the Series', function () {
        expect(new _series2.default([1, 2, 3]).mean()).toEqual(2);
      });
    });

    describe('median()', function () {
      it('returns the median of the even-length Series', function () {
        expect(new _series2.default([3, 2, 1, 4]).median()).toEqual(2.5);
      });

      it('returns the median of the odd-length Series', function () {
        expect(new _series2.default([4, 2, 1, 4, 7]).median()).toEqual(4);
      });
    });

    describe('std()', function () {
      it('returns the standard deviation of the Series', function () {
        expect(new _series2.default([1, 2, 3]).std()).toBeCloseTo(1, 12);
      });
    });

    describe('abs()', function () {
      it('returns the absolute value of a numeric Series', function () {
        var ds = new _series2.default([-1, 2, -3]);
        var dsAbs = ds.abs();
        expect(dsAbs).toBeInstanceOf(_series2.default);
        expect(dsAbs.values.toArray()).toEqual([1, 2, 3]);
      });

      it('returns copy of Series if it is not numeric', function () {
        var ds = new _series2.default(['hi', 2, 4]);
        var dsAbs = ds.abs();
        expect(dsAbs).toBeInstanceOf(_series2.default);
        expect(dsAbs.values.toArray()).toEqual(['hi', 2, 4]);
      });
    });

    describe('add()', function () {
      it('adds a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 4]);

        var ds3 = ds1.add(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('sub()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.sub(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('sub()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.sub(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('mul()', function () {
      it('multiplies by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.mul(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('multiply()', function () {
      it('multiplies by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.multiply(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('div()', function () {
      it('divides by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.div(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });

    describe('divide()', function () {
      it('divides by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.divide(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });

    describe('diff', function () {
      it('calculates the difference for 1 period', function () {
        var ds = new _series2.default([1, 2, 4, 8, 16]);
        expect(ds.diff(1).values.toArray()).toEqual([null, 1, 2, 4, 8]);
      });

      it('calculates the difference for 2 periods', function () {
        var ds = new _series2.default([1, 2, 4, 8, 16]);
        expect(ds.diff(2).values.toArray()).toEqual([null, null, 3, 6, 12]);
      });
    });

    describe('pct_change', function () {
      it('calculates the percent change for 1 period', function () {
        var ds = new _series2.default([1, 2, 3, 4, 5]);
        expect(ds.pct_change(1).values.toArray()).toEqual([null, 1, 0.5, 4 / 3 - 1, 0.25]);
      });

      it('calculates the percent change for 2 periods', function () {
        var ds = new _series2.default([1, 2, 3, 4, 5]);
        expect(ds.pct_change(2).values.toArray()).toEqual([null, null, 2, 1, 5 / 3 - 1]);
      });
    });

    describe('sort_values', function () {
      it('sorts the Series by the values in ascending order', function () {
        var ds1 = new _series2.default([2, 3, 4, 1]).sort_values();

        expect(ds1.values.toArray()).toEqual([1, 2, 3, 4]);
        expect(ds1.index.toArray()).toEqual([3, 0, 1, 2]);
      });

      it('sorts the Series by the values in descending order', function () {
        var ds = new _series2.default([2, 3, 4, 1]);
        var ds1 = ds.sort_values(false);

        expect(ds1.values.toArray()).toEqual([4, 3, 2, 1]);
        expect(ds1.index.toArray()).toEqual([2, 1, 0, 3]);
      });

      it('sorts the Series by the values in ascending order for strings', function () {
        var ds = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds1 = ds.sort_values(true);

        expect(ds1.values.toArray()).toEqual(['bar', 'bye', 'foo', 'hi', 'test']);
        expect(ds1.index.toArray()).toEqual([4, 1, 3, 0, 2]);
      });

      it('sorts the Series by the values in descending order for strings', function () {
        var ds = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds1 = ds.sort_values(false);

        expect(ds1.values.toArray()).toEqual(['test', 'hi', 'foo', 'bye', 'bar']);
        expect(ds1.index.toArray()).toEqual([2, 0, 3, 1, 4]);
      });
    });

    describe('round', function () {
      it('rounds a Series to 1 digit', function () {
        var ds = new _series2.default([1.1, 2.13, 2.25, 2.76]);
        var dsRound = ds.round(1);

        expect(dsRound).toBeInstanceOf(_series2.default);
        expect(dsRound.values.toArray()).toEqual([1.1, 2.1, 2.3, 2.8]);
      });

      it('rounds a Series to 2 digits', function () {
        var ds = new _series2.default([1.1, 2.137, 2.255, 2.761]);
        var dsRound = ds.round(2);

        expect(dsRound).toBeInstanceOf(_series2.default);
        expect(dsRound.values.toArray()).toEqual([1.10, 2.14, 2.26, 2.76]);
      });
    });

    describe('_alignSeries', function () {
      it('properly aligns Series with the same index values', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds2 = new _series2.default(['bye', 'hi', 'foo', 'test', 'bar']);

        var aligned = ds1._alignSeries(ds2);
        expect(aligned.size).toEqual(5);
        expect(aligned.getIn([0, 'first']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([0, 'second']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'first']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'second']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([2, 'first']).toArray()).toEqual(['test']);
        expect(aligned.getIn([2, 'second']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'first']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'second']).toArray()).toEqual(['test']);
        expect(aligned.getIn([4, 'first']).toArray()).toEqual(['bar']);
        expect(aligned.getIn([4, 'second']).toArray()).toEqual(['bar']);
      });

      it('properly aligns Series with the differing index values', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds2 = new _series2.default(['bye', 'hi', 'foo', 'test', 'bar']);

        var aligned = ds1._alignSeries(ds2);
        expect(aligned.size).toEqual(5);
        expect(aligned.getIn([0, 'first']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([0, 'second']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'first']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'second']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([2, 'first']).toArray()).toEqual(['test']);
        expect(aligned.getIn([2, 'second']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'first']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'second']).toArray()).toEqual(['test']);
        expect(aligned.getIn([4, 'first']).toArray()).toEqual(['bar']);
        expect(aligned.getIn([4, 'second']).toArray()).toEqual(['bar']);
      });
    });

    describe('where', function () {
      it('checks for equality of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds2 = ds1.where('hi', function (a, b) {
          return a === b;
        });

        expect(ds2.values.toArray()).toEqual([true, false, false, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for equality of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test']);
        var ds2 = ds1.where(new _series2.default(['bye', 'bye', 'test']), function (a, b) {
          return a === b;
        });

        expect(ds2.values.toArray()).toEqual([false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('eq', function () {
      it('checks for equality of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test', 'foo', 'bar']);
        var ds2 = ds1.eq('hi');

        expect(ds2.values.toArray()).toEqual([true, false, false, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for equality of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default(['hi', 'bye', 'test']);
        var ds2 = ds1.eq(new _series2.default(['bye', 'bye', 'test']));

        expect(ds2.values.toArray()).toEqual([false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('lt', function () {
      it('checks for less than of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.lt(3);

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for less than of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.lt(new _series2.default([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('lte', function () {
      it('checks for less than or equal to of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.lte(3);

        expect(ds2.values.toArray()).toEqual([true, true, true, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for less than or equal to of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([2, 2, 3, 4]);
        var ds2 = ds1.lte(new _series2.default([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('gt', function () {
      it('checks for greater than of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.gt(3);

        expect(ds2.values.toArray()).toEqual([false, false, false, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for greater than of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.gt(new _series2.default([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([false, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('gte', function () {
      it('checks for greater than or equal of a scalar and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = ds1.gte(3);

        expect(ds2.values.toArray()).toEqual([false, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for greater than or equal of a Series and returns a Series of dtype bool', function () {
        var ds1 = new _series2.default([2, 2, 3, 4]);
        var ds2 = ds1.gte(new _series2.default([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('notnull', function () {
      it('returns a Series with true if value is not null, false otherwise', function () {
        var ds = new _series2.default([1, 2, null, null, 4]);
        expect(ds.notnull()).toBeInstanceOf(_series2.default);
        expect(ds.notnull().values.toArray()).toEqual([true, true, false, false, true]);
      });
    });

    describe('shift', function () {
      it('returns a copy of the Series if the periods === 0', function () {
        var ds1 = new _series2.default([2, 2, 3, 4]);
        expect(ds1.shift(0).values.toArray()).toEqual([2, 2, 3, 4]);
      });

      it('returns a shifted array if the periods > 0', function () {
        var ds1 = new _series2.default([2, 2, 3, 4]);
        expect(ds1.shift(1).values.toArray()).toEqual([null, 2, 2, 3]);
      });

      it('returns a shifted array if the periods < 0', function () {
        var ds1 = new _series2.default([2, 2, 3, 4]);
        expect(ds1.shift(-1).values.toArray()).toEqual([2, 3, 4, null]);
      });
    });

    describe('unique', function () {
      it('returns unique floats', function () {
        var ds1 = new _series2.default([2, 3.1, 2.1, 3.1, 3.1, 4.3]);
        expect(ds1.unique().toArray()).toEqual([2, 3.1, 2.1, 4.3]);
      });

      it('returns unique strings', function () {
        var ds1 = new _series2.default(['foo', 'bar', 'bar', 'foo', 'foo', 'test', 'bar', 'hi']);
        expect(ds1.unique().toArray()).toEqual(['foo', 'bar', 'test', 'hi']);
      });
    });

    describe('filter', function () {
      it('filters with a simple eq check', function () {
        var ds = new _series2.default([1, 2, 3, 4, 1]);
        var dsFilter = ds.filter(ds.eq(1));

        expect(dsFilter.length).toEqual(2);
        expect(dsFilter.values.toArray()).toEqual([1, 1]);
        expect(dsFilter.index.toArray()).toEqual([0, 4]);
      });

      it('filters with a custom where', function () {
        var ds = new _series2.default([1, 2, 3, 4, 1]);
        var dsFilter = ds.filter(ds.where(2, function (a, b) {
          return a * 2 > b;
        }));

        expect(dsFilter.length).toEqual(3);
        expect(dsFilter.values.toArray()).toEqual([2, 3, 4]);
        expect(dsFilter.index.toArray()).toEqual([1, 2, 3]);
      });
    });

    describe('cov', function () {
      it('calculates the covariance between this Series and another', function () {
        var ds1 = new _series2.default([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var ds2 = new _series2.default([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8]);

        var cov = ds1.cov(ds2);
        expect(cov).toBeCloseTo(18.3333333, 6);
      });

      it('throws an error if the Series are not equal length', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = new _series2.default([2, 3, 4]);

        expect(function () {
          ds1.cov(ds2);
        }).toThrow();
      });
    });

    describe('corr', function () {
      it('calculates the correlation between this Series and another', function () {
        var ds1 = new _series2.default([1, 2, 3, 4, 5]);
        var ds2 = new _series2.default([-10, -8, -6, -4, -2]);

        var corr = ds1.corr(ds2);
        expect(corr).toBeCloseTo(1, 8);
      });

      it('throws an error if the Series are not equal length', function () {
        var ds1 = new _series2.default([1, 2, 3, 4]);
        var ds2 = new _series2.default([2, 3, 4]);

        expect(function () {
          ds1.corr(ds2);
        }).toThrow();
      });
    });

    describe('to_json', function () {
      it('converts a pandas Series to a json object', function () {
        var ds = new _series2.default([1, 2, 3, 4], { name: 'x' });

        var dsJSON = ds.to_json();
        expect(dsJSON).toEqual({ 0: 1, 1: 2, 2: 3, 3: 4 });
      });

      it('converts a pandas Series to a json object when orient="records"', function () {
        var ds = new _series2.default([1, 2, 3, 4], { name: 'x' });

        var dsJSON = ds.to_json({ orient: 'records' });
        expect(dsJSON).toEqual([1, 2, 3, 4]);
      });

      it('converts a pandas Series to a json object when orient="split"', function () {
        var ds = new _series2.default([1, 2, 3, 4], { name: 'x' });

        var dsJSON = ds.to_json({ orient: 'split' });
        expect(dsJSON).toEqual({ name: 'x', index: [0, 1, 2, 3], values: [1, 2, 3, 4] });
      });
    });

    describe('cumulative functions', function () {
      it('cumsum', function () {
        var ds = new _series2.default([1, 2, 3, 4, 5], { index: [2, 3, 4, 5, 6] });
        var ds2 = ds.cumsum();
        expect(ds2).toBeInstanceOf(_series2.default);
        expect(ds2.values.toArray()).toEqual([1, 3, 6, 10, 15]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummul', function () {
        var ds = new _series2.default([1, 2, 3, 4, 5], { index: [2, 3, 4, 5, 6] });
        var ds2 = ds.cummul();
        expect(ds2).toBeInstanceOf(_series2.default);
        expect(ds2.values.toArray()).toEqual([1, 2, 6, 24, 120]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummax', function () {
        var ds = new _series2.default([1, 2, 6, 4, 5], { index: [2, 3, 4, 5, 6] });
        var ds2 = ds.cummax();
        expect(ds2).toBeInstanceOf(_series2.default);
        expect(ds2.values.toArray()).toEqual([1, 2, 6, 6, 6]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummin', function () {
        var ds = new _series2.default([3, 2, 6, 1, 5], { index: [2, 3, 4, 5, 6] });
        var ds2 = ds.cummin();
        expect(ds2).toBeInstanceOf(_series2.default);
        expect(ds2.values.toArray()).toEqual([3, 2, 2, 1, 1]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });
    });
  });

  describe('append', function () {
    it('Appends a Series to another when ignore_index is false', function () {
      var ds1 = new _series2.default([1, 2, 3], { index: [1, 2, 3] });
      var ds2 = new _series2.default([2, 3, 4], { index: [2, 3, 4] });
      var ds3 = ds1.append(ds2);
      expect(ds3.values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(ds3.index.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
    });

    it('Appends a Series to another when ignore_index is true', function () {
      var ds1 = new _series2.default([1, 2, 3], { index: [1, 2, 3] });
      var ds2 = new _series2.default([2, 3, 4], { index: [2, 3, 4] });
      var ds3 = ds1.append(ds2, true);
      expect(ds3.values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(ds3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });
  });
});