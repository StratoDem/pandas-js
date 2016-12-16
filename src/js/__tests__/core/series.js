'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _series = require('../../core/series');

var _series2 = _interopRequireDefault(_series);

var _dtype = require('../../core/dtype');

var dtype = _interopRequireWildcard(_dtype);

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

    describe('astype', function () {
      it('converts a float Series to an integer Series', function () {
        var ds1 = new _series2.default([1.5, 2.1, 3.9]);
        expect(ds1.dtype.dtype).toEqual('float');

        var ds2 = ds1.astype(new dtype.DType('int'));
        expect(ds2.values.toArray()).toEqual([1, 2, 3]);
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
        expect(new _series2.default([1, 2, 3]).std()).toBeCloseTo(0.8164965809277, 12);
      });
    });

    describe('plus()', function () {
      it('adds a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 4]);

        var ds3 = ds1.plus(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('minus()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('minus()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('times()', function () {
      it('multiplies by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.times(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('dividedBy()', function () {
      it('divides by a second Series and returns a new Series', function () {
        var ds1 = new _series2.default([1, 2, 3]);
        var ds2 = new _series2.default([2, 3, 5]);

        var ds3 = ds1.dividedBy(ds2);
        expect(ds3).toBeInstanceOf(_series2.default);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });
  });
});
