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
  });
});
