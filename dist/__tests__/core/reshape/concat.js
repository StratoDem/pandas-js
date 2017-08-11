'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _frame = require('../../../core/frame');

var _frame2 = _interopRequireDefault(_frame);

var _series = require('../../../core/series');

var _series2 = _interopRequireDefault(_series);

var _concat = require('../../../core/reshape/concat');

var _concat2 = _interopRequireDefault(_concat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('concat', function () {
  describe('concat Series', function () {
    it('Concatenates two Series without ignoring index', function () {
      var series1 = new _series2.default([1, 2, 3, 4]);
      var series2 = new _series2.default([2, 3, 4, 5]);

      var series3 = (0, _concat2.default)([series1, series2]);
      expect(series3.values.toArray()).toEqual([1, 2, 3, 4, 2, 3, 4, 5]);
      expect(series3.index.toArray()).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
    });

    it('Concatenates two Series with ignore index', function () {
      var series1 = new _series2.default([1, 2, 3, 4]);
      var series2 = new _series2.default([2, 3, 4, 5]);

      var series3 = (0, _concat2.default)([series1, series2], { ignore_index: true });
      expect(series3.values.toArray()).toEqual([1, 2, 3, 4, 2, 3, 4, 5]);
      expect(series3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('Throws an error if the first object in concat is a Series ' + 'and any of the rest are not', function () {
      var series1 = new _series2.default([1, 2, 3, 4]);
      var series2 = new _series2.default([2, 3, 4, 5]);

      expect(function () {
        return (0, _concat2.default)([series1, series2, []], { ignore_index: true });
      }).toThrow();
      expect(function () {
        return (0, _concat2.default)(_immutable2.default.List([series1, series2, []]), { ignore_index: true });
      }).toThrow();
    });
  });

  describe('concat DataFrame', function () {
    it('Concatenates two DataFrames without ignoring index', function () {
      var frame1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]);
      var frame2 = new _frame2.default([{ x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }]);

      var frame3 = (0, _concat2.default)([frame1, frame2]);
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(frame3.get('x').index.toArray()).toEqual([0, 1, 2, 0, 1, 2]);
    });

    it('Concatenates two DataFrames with index ignored', function () {
      var frame1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]);
      var frame2 = new _frame2.default([{ x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }]);

      var frame3 = (0, _concat2.default)([frame1, frame2], { ignore_index: true });
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(frame3.get('x').index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('Concatenates two DataFrames along axis = 1 without ignoring index', function () {
      var frame1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]);
      var frame2 = new _frame2.default([{ x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }]);

      var frame3 = (0, _concat2.default)([frame1, frame2], { axis: 1 });
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(frame3.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(frame3.get('x.x').values.toArray()).toEqual([2, 3, 4]);
      expect(frame3.get('x.x').name).toEqual('x.x');
      expect(frame3.get('y.x').values.toArray()).toEqual([3, 4, 5]);
      expect(frame3.get('y.x').name).toEqual('y.x');
    });
  });
});