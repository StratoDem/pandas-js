'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _frame = require('../../core/frame');

var _frame2 = _interopRequireDefault(_frame);

var _series = require('../../core/series');

var _series2 = _interopRequireDefault(_series);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('frame', function () {
  describe('DataFrame', function () {
    it('initializes a DataFrame', function () {
      var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);

      expect(df1.x).toBeInstanceOf(_series2.default);
      expect(df1.x.values.toArray()).toEqual([1, 2]);
      expect(df1.y).toBeInstanceOf(_series2.default);
      expect(df1.y.values.toArray()).toEqual([2, 3]);
    });

    describe('columns', function () {
      it('columns are set properly', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
        expect(df1.columns).toEqual(['x', 'y']);
      });

      it('new columns of equal length can be set', function () {
        var df1 = new _frame2.default([{ x: 1, y: 2 }, { x: 2, y: 3 }]);
        df1.columns = ['a', 'b'];

        expect(df1.columns).toEqual(['a', 'b']);
        expect(df1.a).toBeInstanceOf(_series2.default);
        expect(df1.b).toBeInstanceOf(_series2.default);
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
          var _step$value = _slicedToArray(_step.value, 2),
              row = _step$value[0],
              idx = _step$value[1];

          expect(row).toBeInstanceOf(_frame2.default);
          expect(row.x.iloc(0)).toEqual(vals[idx].x);
          expect(row.y.iloc(0)).toEqual(vals[idx].y);
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
  });

  describe('mergeDataFrame', function () {
    it('merges two DataFrames on a given key', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
      var df1 = new _frame2.default(vals1);
      var vals2 = [{ x: 2, z: 6 }, { x: 1, z: 1 }, { x: 3, z: 100 }];
      var df2 = new _frame2.default(vals2);

      var df3 = (0, _frame.mergeDataFrame)(df1, df2, ['x']);
      expect(df3).toBeInstanceOf(_frame2.default);
      expect(df3.length).toEqual(3);
      expect(df3.x.values.toArray()).toEqual([1, 2, 3]);
      expect(df3.y.values.toArray()).toEqual([2, 3, 4]);
      expect(df3.z.values.toArray()).toEqual([1, 6, 100]);
    });
  });

  describe('merge', function () {
    it('merges a second DataFrame to this instance on a given key', function () {
      var vals1 = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 10 }];
      var df1 = new _frame2.default(vals1);
      var vals2 = [{ x: 2, z: 6 }, { x: 1, z: 1 }, { x: 3, z: 100 }];
      var df2 = new _frame2.default(vals2);

      var df3 = df1.merge(df2, ['x']);
      expect(df3).toBeInstanceOf(_frame2.default);
      expect(df3.length).toEqual(3);
      expect(df3.x.values.toArray()).toEqual([1, 2, 3]);
      expect(df3.y.values.toArray()).toEqual([2, 3, 4]);
      expect(df3.z.values.toArray()).toEqual([1, 6, 100]);
    });
  });
});
