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

    it('copy', function () {
      var ds1 = new _series2.default([1, 2, 3, 4], { index: [2, 3, 4, 5], name: 'Test name' });
      var ds2 = ds1.copy();

      expect(ds2).toBeInstanceOf(_series2.default);
      expect(ds2.values.toArray()).toEqual([1, 2, 3, 4]);

      ds2.name = 'test';
      expect(ds1.name).toEqual('Test name');
      expect(ds2.name).toEqual('test');

      ds2.index = [1, 2, 3, 4];
      expect(ds1.index.toArray()).toEqual([2, 3, 4, 5]);
      expect(ds2.index.toArray()).toEqual([1, 2, 3, 4]);
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

    describe('std()', function () {
      it('returns the standard deviation of the Series', function () {
        expect(new _series2.default([1, 2, 3]).std()).toBeCloseTo(1, 12);
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
  });
});