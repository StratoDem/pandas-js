'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _series = require('../../core/series');

var series = _interopRequireWildcard(_series);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('series', function () {
  describe('Series', function () {
    it('initializes properly with an Array', function () {
      expect(new series.Series([1, 2, 3]).values).toBeInstanceOf(_immutable2.default.List);
      expect(new series.Series([1, 2, 3]).values.toArray()).toEqual([1, 2, 3]);
    });

    describe('sum()', function () {
      it('returns the sum of the Series', function () {
        expect(new series.Series([1, 2, 3]).sum()).toEqual(6);
      });
    });

    describe('mean()', function () {
      it('returns the mean of the Series', function () {
        expect(new series.Series([1, 2, 3]).mean()).toEqual(2);
      });
    });

    describe('std()', function () {
      it('returns the standard deviation of the Series', function () {
        expect(new series.Series([1, 2, 3]).std()).toBeCloseTo(0.8164965809277, 12);
      });
    });

    describe('plus()', function () {
      it('adds a second Series and returns a new Series', function () {
        var ds1 = new series.Series([1, 2, 3]);
        var ds2 = new series.Series([2, 3, 4]);

        var ds3 = ds1.plus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('minus()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new series.Series([1, 2, 3]);
        var ds2 = new series.Series([2, 3, 5]);

        var ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('minus()', function () {
      it('subtracts a second Series and returns a new Series', function () {
        var ds1 = new series.Series([1, 2, 3]);
        var ds2 = new series.Series([2, 3, 5]);

        var ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('times()', function () {
      it('multiplies by a second Series and returns a new Series', function () {
        var ds1 = new series.Series([1, 2, 3]);
        var ds2 = new series.Series([2, 3, 5]);

        var ds3 = ds1.times(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('dividedBy()', function () {
      it('divides by a second Series and returns a new Series', function () {
        var ds1 = new series.Series([1, 2, 3]);
        var ds2 = new series.Series([2, 3, 5]);

        var ds3 = ds1.dividedBy(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });
  });
});
