'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _frame = require('../frame');

var _frame2 = _interopRequireDefault(_frame);

var _series = require('../series');

var _series2 = _interopRequireDefault(_series);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _concatSeriesValues = function _concatSeriesValues(objs) {
  var _Immutable$List;

  return (_Immutable$List = _immutable2.default.List([])).concat.apply(_Immutable$List, (0, _toConsumableArray3.default)(objs.map(function (series) {
    return series.values;
  })));
}; /** 
    * StratoDem Analytics : concat.js
    * Principal Author(s) : Michael Clawar
    * Secondary Author(s) :
    * Description :
    *
    *  (c) 2016- StratoDem Analytics, LLC
    *  All Rights Reserved
    */

var _concatSeriesIndices = function _concatSeriesIndices(objs) {
  var _Immutable$List2;

  return (_Immutable$List2 = _immutable2.default.List([])).concat.apply(_Immutable$List2, (0, _toConsumableArray3.default)(objs.map(function (series) {
    return series.index;
  })));
};

var _concatSeries = function _concatSeries(objs, kwargs) {
  if (objs instanceof _immutable2.default.List && objs.filter(function (series) {
    return series instanceof _series2.default;
  }).size !== objs.size) throw new Error('Objects must all be Series');else if (Array.isArray(objs) && objs.filter(function (series) {
    return series instanceof _series2.default;
  }).length !== objs.length) throw new Error('Objects must all be Series');

  if (!kwargs.ignore_index) return new _series2.default(_concatSeriesValues(objs), { index: _concatSeriesIndices(objs) });else if (kwargs.ignore_index) {
    return new _series2.default(_concatSeriesValues(objs), { index: _immutable2.default.Range(0, objs.reduce(function (a, b) {
        return a + b.length;
      }, 0)).toList() });
  }

  throw new Error('Not supported');
};

var _concatDataFrame = function _concatDataFrame(objs, kwargs) {
  if (!(objs instanceof _immutable2.default.List || Array.isArray(objs))) throw new Error('objs must be List or Array');

  if (objs instanceof _immutable2.default.List && objs.filter(function (frame) {
    return frame instanceof _frame2.default;
  }).size !== objs.size) throw new Error('Objects must all be DataFrame');else if (Array.isArray(objs) && objs.filter(function (frame) {
    return frame instanceof _frame2.default;
  }).length !== objs.length) throw new Error('Objects must all be DataFrame');

  if (Array.isArray(objs) && objs.length === 1) return objs[0];else if (objs instanceof _immutable2.default.List && objs.size === 1) return objs.get(0);

  var seriesOrderedMap = _immutable2.default.OrderedMap({});
  if (kwargs.axis === 1) {
    objs.forEach(function (df) {
      df.columns.forEach(function (column) {
        var columnExists = seriesOrderedMap.has(column);
        seriesOrderedMap = seriesOrderedMap.set(columnExists ? column + '.x' : column, // $FlowIssue
        columnExists ? df.get(column).rename(column + '.x') : df.get(column));
      });
    });
  } else {
    objs.forEach(function (df) {
      var lenSeriesInMap = seriesOrderedMap.keySeq().size === 0 ? 0 : seriesOrderedMap.first().length;
      var nextLength = df.length + lenSeriesInMap;

      seriesOrderedMap = _immutable2.default.OrderedMap(
      // Get entries already concated (already in seriesOrderedMap)
      seriesOrderedMap.entrySeq().map(function (_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
            column = _ref2[0],
            series = _ref2[1];

        if (df.columnExists(column)) return [column, // $FlowIssue
        _concatSeries([series, df.get(column)], kwargs)];
        return [column, // $FlowIssue
        _concatSeries([series, new _series2.default(_immutable2.default.Repeat(NaN, df.length).toList(), { index: df.index })], kwargs)]; // Now merge with columns only in the "right" DataFrame
      })).merge(_immutable2.default.OrderedMap(df.columns.filter(function (column) {
        return !seriesOrderedMap.has(column);
      }).map(function (column) {
        return (// $FlowIssue
          [column, lenSeriesInMap === 0 ? df.get(column) : _concatSeries([new _series2.default(_immutable2.default.Repeat(NaN, nextLength)), df.get(column)], kwargs)]
        );
      })));
    });
  }

  return new _frame2.default(seriesOrderedMap);
};

/**
 * Concatenate pandas objects along a particular axis.
 *
 * pandas equivalent: [pandas.concat](https://pandas.pydata.org/pandas-docs/stable/generated/pandas.concat.html)
 *
 * @returns {Series | DataFrame}
 *
 * @example
 * const series1 = new Series([1, 2, 3, 4]);
 * const series2 = new Series([2, 3, 4, 5]);
 *
 * // Returns Series([1, 2, 3, 4, 2, 3, 4, 5], {index: [0, 1, 2, 3, 0, 1, 2, 3]})
 * concat([series1, series2], {ignore_index: false});
 *
 * // Returns Series([1, 2, 3, 4, 2, 3, 4, 5], {index: [0, 1, 2, 3, 4, 5, 6, 7]})
 * concat([series1, series2], {ignore_index: true});
 */
var concat = function concat(objs) {
  var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { ignore_index: false, axis: 0 };

  if (Array.isArray(objs) && objs[0] instanceof _series2.default || objs instanceof _immutable2.default.List && objs.get(0) instanceof _series2.default) return _concatSeries(objs, { ignore_index: kwargs.ignore_index });else if (Array.isArray(objs) && objs[0] instanceof _frame2.default || objs instanceof _immutable2.default.List && objs.get(0) instanceof _frame2.default) return _concatDataFrame(objs, { ignore_index: kwargs.ignore_index, axis: kwargs.axis });
  throw new Error('Not supported');
};

exports.default = concat;

//# sourceMappingURL=concat.js.map