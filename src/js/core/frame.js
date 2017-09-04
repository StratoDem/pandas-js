'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._concatDataFrame = exports.mergeDataFrame = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _exceptions = require('./exceptions');

var _generic = require('./generic');

var _generic2 = _interopRequireDefault(_generic);

var _series = require('./series');

var _series2 = _interopRequireDefault(_series);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line

// import { MultiIndex } from './multiindex';

// import { saveAs } from 'file-saver'; TODO figure out if best way

var parseArrayToSeriesMap = function parseArrayToSeriesMap(array, index) {
  var dataMap = _immutable2.default.Map({});

  array.forEach(function (el) {
    if (el instanceof _immutable2.default.Map) {
      el.keySeq().forEach(function (k) {
        if (dataMap.has(k)) {
          dataMap = dataMap.set(k, dataMap.get(k).push(el.get(k)));
        } else {
          dataMap = dataMap.set(k, _immutable2.default.List.of(el.get(k)));
        }
      });
    } else if ((typeof el === 'undefined' ? 'undefined' : (0, _typeof3.default)(el)) === 'object') {
      Object.keys(el).forEach(function (k) {
        if (dataMap.has(k)) {
          dataMap = dataMap.set(k, dataMap.get(k).push(el[k]));
        } else {
          dataMap = dataMap.set(k, _immutable2.default.List.of(el[k]));
        }
      });
    }
  });

  dataMap.keySeq().forEach(function (k) {
    dataMap = dataMap.set(k, new _series2.default(dataMap.get(k), { name: k, index: index }));
  });

  return _immutable2.default.Map(dataMap);
};
// import { Workbook, Sheet } from './structs'; TODO
/** 
 * DataFrame object
 */

var DataFrame = function (_NDFrame) {
  (0, _inherits3.default)(DataFrame, _NDFrame);

  /**
   * Two-dimensional size-mutable, potentially heterogeneous tabular data
   * structure with labeled axes (rows and columns). Arithmetic operations
   * align on both row and column labels. Can be thought of as a Immutable.Map-like
   * container for Series objects. The primary pandas data structure
   *
   * @param data {Array|Object}
   *    Data to be stored in DataFrame
   * @param {Object} kwargs
   *    Extra optional arguments for a DataFrame
   * @param {Array|Object} [kwargs.index]
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}])
   *
   * // Returns:
   * //    x  |  y
   * // 0  1  |  2
   * // 1  2  |  3
   * // 2  3  |  4
   * df.toString();
   */
  function DataFrame(data) {
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, DataFrame);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DataFrame.__proto__ || Object.getPrototypeOf(DataFrame)).call(this, data, kwargs));

    if (Array.isArray(data)) {
      _this.set_axis(0, (0, _utils.parseIndex)(kwargs.index, _immutable2.default.List(data)));
      _this._data = parseArrayToSeriesMap(data, _this.index);
      _this.set_axis(1, _this._data.keySeq());
    } else if (data instanceof _immutable2.default.Map) {
      _this._data = _immutable2.default.OrderedMap(data.keySeq().map(function (k) {
        if (data instanceof _immutable2.default.Map && !(data.get(k) instanceof _series2.default)) throw new Error('Map must have [column, series] key-value pairs');

        if (data instanceof _immutable2.default.Map) return [k, data.get(k).copy()];

        throw new Error('Data is not Map');
      }));
      _this.set_axis(1, _this._data.keySeq());
      _this.set_axis(0, _this._data.get(_this.columns.get(0)).index);
    } else if (data instanceof _immutable2.default.List) {
      // List of List of row values
      var columns = void 0;
      if (Array.isArray(kwargs.columns) || kwargs.columns instanceof _immutable2.default.Seq) columns = _immutable2.default.List(kwargs.columns);else if (kwargs.columns instanceof _immutable2.default.List) columns = kwargs.columns;else if (typeof kwargs.columns === 'undefined') columns = _immutable2.default.Range(0, data.get(0).size).toList();else throw new Error('Invalid columns');

      _this._values = data; // Cache the values since we're in List of List or row data already
      _this._data = _immutable2.default.OrderedMap(columns.map(function (c, colIdx) {
        return [c, new _series2.default(data.map(function (row) {
          return row.get(colIdx);
        }), { index: kwargs.index })];
      }));

      _this.set_axis(1, _this._data.keySeq());
      _this.set_axis(0, _this._data.get(_this.columns.get(0)).index);
    } else if (typeof data === 'undefined') {
      _this._data = _immutable2.default.Map({});
      _this.set_axis(0, _immutable2.default.List.of());
      _this.set_axis(1, _immutable2.default.Seq.of());
    }

    _this._setup_axes(_immutable2.default.List.of(0, 1));
    return _this;
  }

  (0, _createClass3.default)(DataFrame, [{
    key: 'toString',
    value: function toString() {
      var _this2 = this;

      var string = '\t|';
      this.columns.forEach(function (k) {
        string += '  ' + k + '  |';
      });
      var headerRow = '-'.repeat(string.length);

      string += '\n' + headerRow + '\n';

      var stringUpdate = function stringUpdate(idx) {
        var s = '';
        _this2.columns.forEach(function (k) {
          s += '  ' + _this2._data.get(k).iloc(idx) + '  |';
        });
        return s;
      };

      for (var idx = 0; idx < this.length; idx += 1) {
        string += this.index.get(idx) + '\t|';
        string += stringUpdate(idx);
        string += '\n';
      }

      return string;
    }

    /**
     * Return a new deep copy of the `DataFrame`
     *
     * pandas equivalent: [DataFrame.copy](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.copy.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     * const df2 = df.copy();
     * df2.index = [1, 2, 3];
     * df.index   // [0, 1, 2];
     * df2.index  // [1, 2, 3];
     */

  }, {
    key: 'copy',
    value: function copy() {
      return new DataFrame(this._data, { index: this.index });
    }

    // $FlowFixMe

  }, {
    key: Symbol.iterator,
    value: function value() {
      var _this3 = this;

      var index = -1;

      return {
        next: function next() {
          index += 1;
          var done = !(index >= 0 && index < _this3.length);
          var value = done ? undefined : _immutable2.default.Map(_this3.columns.map(function (k, idx) {
            return [k, _this3.values.get(index).get(idx)];
          }));
          return { value: value, done: done };
        }
      };
    }

    /**
     * A generator which returns [row, index location] tuples
     *
     * pandas equivalent: [DataFrame.iterrows](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.iterrows.html)
     *
     * @returns {*}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Logs 2 4 6
     * for(const [row, idx] of df) {
     *   console.log(row.get('x') * 2);
     * }
     */

  }, {
    key: 'iterrows',
    value: function iterrows() {
      return (0, _utils.enumerate)(this);
    }
  }, {
    key: 'set',


    /**
     * Set a `Series` at `column`
     *
     * @param {string|number} column
     * @param {Series|List|Array} series
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1}, {x: 2}, {x: 3}]);
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     * df.set('y', new Series([2, 3, 4]));
     */
    value: function set(column, series) {
      if (series instanceof _series2.default) return new DataFrame(this._data.set(column, series), this.kwargs);else if (series instanceof _immutable2.default.List || Array.isArray(series)) return new DataFrame(this._data.set(column, // $FlowFixMe TODO
      new _series2.default(series, { index: this.index, name: column })), this.kwargs);
      throw new TypeError('series must be a Series!');
    }

    /**
     * Reset the index for a DataFrame
     *
     * pandas equivalent: [DataFrame.reset_index](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.reset_index.html)
     *
     * @param {object} args
     * @param {boolean} args.drop
     *  Drop the index when resetting? Otherwise, add as new column
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [1, 2]});
     *
     * // returns DataFrame([{index: 1, x: 1, y: 2}, {index: 2, x: 2, y: 3}], {index: [0, 1]})
     * df.reset_index();
     *
     * // returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [0, 1]});
     * df.reset_index({drop: true});
     *
     * const df2 = new DataFrame([{index: 1}, {index: 2}], {index: [1, 2]});
     * // returns DataFrame([{level_0: 1, index: 1}, {level_0: 1, index: 2}], {index: [1, 2]});
     * df2.reset_index();
     */

  }, {
    key: 'reset_index',
    value: function reset_index() {
      var _this4 = this;

      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { drop: false };

      if (typeof args.drop !== 'undefined' && typeof args.drop !== 'boolean') throw new TypeError('drop must be a boolean');
      var drop = typeof args.drop === 'undefined' ? false : args.drop;

      var indexName = 'index';
      if (this.columnExists('index')) {
        var i = 0;
        while (this.columnExists('level_' + i)) {
          i += 1;
        }
        indexName = 'level_' + i;
      }

      var data = _immutable2.default.Map(this.columns.map(function (c) {
        return [c, new _series2.default(_this4.get(c).values)];
      }));
      if (!args.drop) data = data.set(indexName, new _series2.default(this.index));

      return new DataFrame(data);
    }

    /**
     * Return new DataFrame subset at [rowIdx, colIdx]
     *
     * pandas equivalent: [DataFrame.iloc](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.iloc.html)
     *
     * @param {number|Array.<number>} rowIdx
     * @param {number|Array.<number>=} colIdx
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);
     *
     * // Returns DataFrame([{y: 3}], {index: [1]})
     * df.iloc(1, 1);
     *
     * // Returns DataFrame([{y: 3, z: 4}}], {index: [1]})
     * df.iloc(1, [1, 3]);
     *
     * // Returns DataFrame([{y: 3, z: 4}, {y: 4, z: 5}], {index: [1, 2]})
     * df.iloc([1, 3], [1, 3]);
     *
     * // Returns DataFrame([{y: 3}, {y: 4}], {index: [1, 2]})
     * df.iloc([1, 3], 1);
     *
     * // Returns DataFrame([{y: 2}, {y: 3}, {y: 4}], {index: [0, 1, 2]})
     * df.iloc(1);
     */

  }, {
    key: 'iloc',
    value: function iloc(rowIdx, colIdx) {
      var _this5 = this;

      if (typeof rowIdx === 'number') {
        if (typeof colIdx === 'number') {
          if (colIdx < 0 || colIdx >= this.shape[1]) throw new Error('colIdx out of bounds');

          var getCol = this.columns.get(colIdx);
          return new DataFrame(_immutable2.default.Map([[getCol, this.get(getCol).iloc(rowIdx, rowIdx + 1)]]), { index: this.index.slice(rowIdx, rowIdx + 1) });
        } else if (Array.isArray(colIdx)) {
          if (colIdx.length !== 2) throw new Error('colIdx must be length 2 (start and end positions)');
          if (colIdx[1] <= colIdx[0]) throw new Error('colIdx end position cannot be less than or equal tostart position');
          if (colIdx[0] < 0 || colIdx[1] > this.shape[1]) throw new Error('colIdx position out of bounds');

          return new DataFrame(_immutable2.default.Map(_immutable2.default.Range(colIdx[0], colIdx[1]).map(function (idx) {
            var getCol = _this5.columns.get(idx);
            // $FlowFixMe TODO
            return [getCol, _this5.get(getCol).iloc(rowIdx, rowIdx + 1)];
          }).toArray()), { index: this.index.slice(rowIdx, rowIdx + 1) });
        } else if (typeof colIdx === 'undefined') {
          return new DataFrame(_immutable2.default.Map(this.columns.map(function (c) {
            return (
              // $FlowFixMe TODO
              [c, _this5.get(c).iloc(rowIdx, rowIdx + 1)]
            );
          }).toArray()), { index: this.index.slice(rowIdx, rowIdx + 1) });
        }

        throw new TypeError('colIdx must be either integer or Array of integers');
      } else if (Array.isArray(rowIdx)) {
        if (typeof colIdx === 'number') {
          if (colIdx < 0 || colIdx >= this.shape[1]) throw new Error('colIdx out of bounds');

          var _getCol = this.columns.get(colIdx);
          return new DataFrame(_immutable2.default.Map([[_getCol, this.get(_getCol).iloc(rowIdx[0], rowIdx[1])]]), { index: this.index.slice(rowIdx[0], rowIdx[1]) });
        } else if (Array.isArray(colIdx)) {
          if (colIdx.length !== 2) throw new Error('colIdx must be length 2 (start and end positions)');
          if (colIdx[1] <= colIdx[0]) throw new Error('colIdx end position cannot be less than or equal tostart position');
          if (colIdx[0] < 0 || colIdx[1] > this.shape[1]) throw new Error('colIdx position out of bounds');

          return new DataFrame(_immutable2.default.Map(_immutable2.default.Range(colIdx[0], colIdx[1]).map(function (idx) {
            var getCol = _this5.columns.get(idx);
            // $FlowFixMe TODO
            return [getCol, _this5.get(getCol).iloc(rowIdx[0], rowIdx[1])];
          }).toArray()), { index: this.index.slice(rowIdx[0], rowIdx[1]) });
        } else if (typeof colIdx === 'undefined') {
          return new DataFrame(_immutable2.default.Map(this.columns.map(function (c) {
            return (
              // $FlowFixMe TODO
              [c, _this5.get(c).iloc(rowIdx[0], rowIdx[1])]
            );
          }).toArray()), { index: this.index.slice(rowIdx[0], rowIdx[1]) });
        }

        throw new TypeError('colIdx must be either integer or Array of integers');
      }

      throw new TypeError('rowIdx must be either integer or Array of integers');
    }

    /**
     * Return new DataFrame composed of first n rows of this DataFrame
     *
     * pandas equivalent: [DataFrame.head](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.head.html)
     *
     * @param {number} n=10
     *  Integer number of n rows to return from the DataFrame
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);
     *
     * // returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}])
     * df.head(2);
     */

  }, {
    key: 'head',
    value: function head() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

      return this.iloc([0, n]);
    }

    /**
     * Return new DataFrame composed of last n rows of this DataFrame
     *
     * pandas equivalent: [DataFrame.tail](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.tail.html)
     *
     * @param {number} n=10
     *  Integer number of n rows to return from the DataFrame
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);
     *
     * // returns DataFrame([{x: 3, y: 4}, {x: 4, y: 5}])
     * df.tail(2);
     */

  }, {
    key: 'tail',
    value: function tail() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

      return this.iloc([this.length - n, this.length]);
    }
  }, {
    key: '_assertColumnExists',
    value: function _assertColumnExists(col) {
      if (!this.columnExists(col)) throw new Error('Column ' + col + ' not in DataFrame');
    }
  }, {
    key: 'columnExists',
    value: function columnExists(col) {
      return this.columns.indexOf(col) >= 0;
    }

    /**
     * Return the `Series` at the column
     *
     * pandas equivalent: df['column_name']
     *
     * @param {string|Array.<string>|Immutable.List.<string>|Immutable.Seq.<string>} columns
     *    Name of the column to retrieve or list of columns to retrieve
     *
     * @returns {Series}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns Series([1, 2, 3], {name: 'x', index: [0, 1, 2]})
     * df.get('x');
     *
     * // Returns DataFrame([{y: 2}, {y: 3}, {y: 4}])
     * df.get(['y']);
     */

  }, {
    key: 'get',
    value: function get(columns) {
      var _this6 = this;

      if ((typeof columns === 'string' || typeof columns === 'number') && this.columnExists(columns)) return this._data.get(columns);else if (Array.isArray(columns) || columns instanceof _immutable2.default.List || columns instanceof _immutable2.default.Seq) {
        columns.forEach(function (c) {
          if (!_this6.columnExists(c)) throw new Error('KeyError: ' + c + ' not found');
        });
        return new DataFrame(_immutable2.default.Map(columns.map(function (c) {
          return [c, _this6.get(c)];
        })), this.kwargs);
      }
      throw new Error('KeyError: ' + columns + ' not found');
    }

    /**
     * Return an object of same shape as self and whose corresponding entries are from self
     * where cond is True and otherwise are from other.
     *
     * pandas equivalent [DataFrame.where](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.where.html)
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Iterable or value to compare to DataFrame
     * @param {function} op
     *  Function which takes (a, b) values and returns a boolean
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
     * df.where(new Series([1, 3]), (a, b) => a === b);
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
     * df.where(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([3, 3])})),
     *    (a, b) => a === b);
     */

  }, {
    key: 'where',
    value: function where(other, op) {
      if (!Array.isArray(other) && !(other instanceof _immutable2.default.List) && !(other instanceof _series2.default) && !(other instanceof DataFrame)) {
        // noinspection Eslint
        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref) {
          var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
              k = _ref2[0],
              v = _ref2[1];

          return [k, v.where(other, op)];
        })));
      } else if (Array.isArray(other) || other instanceof _series2.default || other instanceof _immutable2.default.List) {
        if ((Array.isArray(other) || other instanceof _series2.default) && other.length !== this.length) throw new Error('Array or Series must be same length as DataFrame');
        if (other instanceof _immutable2.default.List && other.size !== this.length) throw new Error('Immutable List must be same size as DataFrame');
        // noinspection Eslint
        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref3) {
          var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
              k = _ref4[0],
              v = _ref4[1];

          return [k, v.where(other, op)];
        })));
      } else if (other instanceof DataFrame) {
        if (!other.shape.equals(this.shape)) throw new Error('DataFrame must have the same shape');
        // noinspection Eslint
        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref5, idx) {
          var _ref6 = (0, _slicedToArray3.default)(_ref5, 2),
              k = _ref6[0],
              v = _ref6[1];

          // $FlowFixMe TODO
          return [k, v.where(other.get(other.columns.get(idx)), op)];
        })));
      }

      throw new Error('Unsupported comparison value, or non-matching lengths');
    }

    /**
     * Equal to `DataFrame` and other, element wise
     *
     * pandas equivalent: df == val
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Other Iterable or scalar value to check for equal to
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
     * df.eq(new Series([1, 3]));
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, false])})
     * df.gt(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([1, 2])})));
     */

  }, {
    key: 'eq',
    value: function eq(other) {
      return this.where(other, function (a, b) {
        return a === b;
      });
    }

    /**
     * Greater than of `DataFrame` and other, element wise
     *
     * pandas equivalent: df > val
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Other Iterable or scalar value to check for greater than
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Map({x: Series([false, false]), y: Series([true, false])})
     * df.gt(new Series([1, 3]));
     *
     * // Returns DataFrame(Map({x: Series([false, true]), y: Series([true, true])})
     * df.gt(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([1, 2])})));
     */

  }, {
    key: 'gt',
    value: function gt(other) {
      return this.where(other, function (a, b) {
        return a > b;
      });
    }

    /**
     * Greater than or equal to of `DataFrame` and other, element wise
     *
     * pandas equivalent: df >= val
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Other Iterable or scalar value to check for greater than or equal to
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([true, true])})
     * df.gte(new Series([1, 3]));
     *
     * // Returns DataFrame(Map({x: Series([true, true]), y: Series([true, true])})
     * df.gte(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([1, 2])})));
     */

  }, {
    key: 'gte',
    value: function gte(other) {
      return this.where(other, function (a, b) {
        return a >= b;
      });
    }

    /**
     * Less than of `DataFrame` and other, element wise
     *
     * pandas equivalent: df < val
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Other Iterable or scalar value to check for less than
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Map({x: Series([false, true]), y: Series([false, false])})
     * df.lt(new Series([1, 3]));
     *
     * // Returns DataFrame(Map({x: Series([false, false]), y: Series([false, false])})
     * df.lt(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([1, 2])})));
     */

  }, {
    key: 'lt',
    value: function lt(other) {
      return this.where(other, function (a, b) {
        return a < b;
      });
    }

    /**
     * Less than or equal to of `DataFrame` and other, element wise
     *
     * pandas equivalent: df <= val
     *
     * @param {Array|List|Series|DataFrame|number|string} other
     *  Other Iterable or scalar value to check for less than or equal to
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Map({x: Series([true, true]), y: Series([false, true])})
     * df.lte(new Series([1, 3]));
     *
     * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, false])})
     * df.lte(new DataFrame(Map({
     *    a: new Series([1, 1]),
     *    b: new Series([1, 2])})));
     */

  }, {
    key: 'lte',
    value: function lte(other) {
      return this.where(other, function (a, b) {
        return a <= b;
      });
    }

    /**
     * Merge this `DataFrame` with another `DataFrame`, optionally on some set of columns
     *
     * pandas equivalent: `DataFrame.merge`
     *
     * @param {DataFrame} df
     *    `DataFrame` with which to merge this `DataFrame`
     * @param {Array} on
     *    Array of columns on which to merge
     * @param {string} how='inner'
     *    Merge method, either 'inner' or 'outer'
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     * const df2 = new DataFrame([{x: 1, z: 3}, {x: 3, z: 5}, {x: 2, z: 10}]);
     *
     * // Returns
     * //    x  |  y  |  z
     * // 0  1  |  2  |  3
     * // 1  2  |  3  |  10
     * // 2  3  |  4  |  5
     * df.merge(df2, ['x'], 'inner');
     */

  }, {
    key: 'merge',
    value: function merge(df, on) {
      var how = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'inner';

      // eslint-disable-next-line
      return mergeDataFrame(this, df, on, how);
    }

    /**
     * Convert the `DataFrame` to a csv string
     *
     * pandas equivalent: [DataFrame.to_csv](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.to_csv.html)
     *
     * @returns {string}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns x,y,\r\n1,2,\r\n2,3\r\n3,4\r\n
     * df.to_csv();
     */

  }, {
    key: 'to_csv',
    value: function to_csv() {
      var _this7 = this;

      var csvString = '';
      this.columns.forEach(function (k) {
        csvString += k + ',';
      });
      csvString += '\r\n';

      var updateString = function updateString(idx) {
        var s = ''; // $FlowFixMe TODO
        _this7.columns.forEach(function (k) {
          s += _this7.get(k).iloc(idx) + ',';
        });
        return s;
      };
      for (var idx = 0; idx < this.length; idx += 1) {
        csvString += updateString(idx);
        csvString += '\r\n';
      }

      return csvString;
    }

    /**
     * Write the `DataFrame` to a Workbook object
     *
     * @param {string|Workbook} excel_writer
     *    File path or existing Workbook object
     * @param {string} sheetName
     *    Name of values which will contain DataFrame
     * @param {boolean} download
     *    Download the excel file?
     * @param {Object} kwargs
     * @param {boolean} kwargs.index=true
     *
     * @return {Workbook}
     *
     */ // eslint-disable-next-line

  }, {
    key: 'to_excel',
    value: function to_excel(excel_writer) {
      var sheetName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Sheet1';
      var download = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var kwargs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { index: true };

      throw new Error('to_excel not yet implemented');
      // let wb;
      //
      // const sheetObject = () => {
      //   if (kwargs.index) {
      //     const colRow = Immutable.List.of('').concat(this.columns.toList());
      //     return new Sheet(
      //       Immutable.List.of(colRow)
      //         .concat(this.values.map((v, idx) =>
      //  Immutable.List.of(this.index.get(idx)).concat(v))));
      //   }
      //
      //   return new Sheet(Immutable.List.of(this.columns.toList()).concat(this.values));
      // };
      //
      // if (excel_writer instanceof Workbook) {
      //   wb = excel_writer.copy();
      //   wb.addSheet(sheetName, sheetObject());
      // } else if (typeof excel_writer === 'string') {
      //   wb = new Workbook();
      //   wb.addSheet(sheetName, sheetObject());
      // } else throw new Error('excel_writer must be a file path or Workbook object');
      //
      // function s2ab(s) {
      //   const buf = new ArrayBuffer(s.length);
      //   const view = new Uint8Array(buf);
      //   for (let i = 0; i < s.length; i += 1) { // noinspection Eslint
      //     view[i] = s.charCodeAt(i) & 0xFF;
      //   }
      //   return buf;
      // }
      //
      // if (download) {
      //   saveAs(new Blob([s2ab(wb.writeWorkbook())],
      //     {type: "application/octet-stream"}),
      //     typeof excel_writer === 'string' ? excel_writer : 'StratoDem Download.xlsx');
      // }
      //
      // return wb;
    }

    /**
     * Convert the DataFrame to a json object
     *
     * pandas equivalent: [DataFrame.to_json](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.to_json.html)
     *
     * @param kwargs
     * @param {string} [kwargs.orient=columns] orientation of JSON
     *
     * @returns {*}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns {x: {0: 1, 1: 2, 2: 3}, y: {0: 1, 1: 2, 2: 3}}
     * df.to_json();
     *
     * // Returns [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]
     * df.to_json({orient: 'records'});
     *
     * // Returns {0: {x: 1, y: 2}, 1: {x: 2, y: 3}, 2: {x: 3, y: 4}}
     * df.to_json({orient: 'index'});
     *
     * // Returns {index: [0, 1, 2], columns: ['x', 'y'], values: [[1, 2], [2, 3], [3, 4]]}
     * df.to_json({orient: 'split'});
     *
     * // Returns [[1, 2], [2, 3], [3, 4]]
     * df.to_json({orient: 'values'});
     */

  }, {
    key: 'to_json',
    value: function to_json() {
      var _this8 = this;

      var kwargs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { orient: 'columns' };

      var ALLOWED_ORIENT = ['records', 'split', 'index', 'values', 'columns'];
      var orient = 'columns';

      if (typeof kwargs.orient !== 'undefined') {
        if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0) throw new TypeError('orient must be in ' + ALLOWED_ORIENT.toString());
        orient = kwargs.orient;
      }

      var json = void 0;
      switch (orient) {
        case 'records':
          return this.values.map(function (row) {
            var rowObj = {};
            row.forEach(function (val, idx) {
              rowObj[_this8.columns.get(idx)] = val;
            });
            return rowObj;
          }).toArray();
        case 'split':
          return {
            index: this.index.toArray(),
            columns: this.columns.toArray(),
            values: this.values.toJS()
          };
        case 'index':
          json = {};
          this.values.forEach(function (row, idx) {
            var rowObj = {};
            row.forEach(function (val, idx2) {
              rowObj[_this8.columns.get(idx2)] = val;
            });
            json[_this8.index.get(idx)] = rowObj;
          });
          return json;
        case 'values':
          return this.values.toJS();
        case 'columns':
          json = {};
          this.columns.forEach(function (c) {
            json[c] = _this8.get(c).to_json({ orient: 'index' });
          });
          return json;
        default:
          throw new TypeError('orient must be in ' + ALLOWED_ORIENT.toString());
      }
    }

    /**
     * Return the sum of the values in the `DataFrame` along the axis
     *
     * pandas equivalent: [DataFrame.sum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.sum.html)
     *
     * @param {number} axis=0
     *    Axis along which to sum values
     *
     * @returns {Series}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // x  6
     * // y  9
     * // Name: , dtype: dtype(int)
     * df.sum().toString();
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // 0  3
     * // 1  5
     * // 2  7
     * // Name: , dtype: dtype('int')
     * df.sum(1).toString();
     */

  }, {
    key: 'sum',
    value: function sum() {
      var _this9 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this9.get(k).sum();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return new _series2.default(_immutable2.default.Range(0, this.length).map(function (idx) {
          return _this9.values.get(idx).reduce(function (s, k) {
            return s + k;
          }, 0);
        }).toList(), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }

    /**
     * Return the mean of the values in the `DataFrame` along the axis
     *
     * pandas equivalent: [DataFrame.mean](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.mean.html)
     *
     * @param {number} axis=0
     *    Axis along which to average values
     *
     * @returns {Series}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // x  2
     * // y  3
     * // Name: , dtype: dtype('int')
     * df.mean().toString();
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // 0  1.5
     * // 1  2.5
     * // 2  3.5
     * // Name: , dtype: dtype('float')
     * df.mean(1).toString();
     */

  }, {
    key: 'mean',
    value: function mean() {
      var _this10 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this10.get(k).mean();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return new _series2.default(_immutable2.default.Range(0, this.length).map(function (idx) {
          return _this10.values.get(idx).reduce(function (s, k) {
            return s + k / _this10.columns.size;
          }, 0);
        }).toList(), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }

    /**
     * Return the standard deviation of the values in the `DataFrame` along the axis
     *
     * pandas equivalent: [DataFrame.std](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.std.html)
     *
     * @param {number} axis=0
     *    Axis along which to calculate the standard deviation
     *
     * @returns {Series}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // x  1
     * // y  1
     * // Name: , dtype: dtype('int')
     * df.std().toString();
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
     *
     * // Returns
     * // 0  0
     * // 1  0
     * // 2  0
     * // Name: , dtype: dtype('int')
     * df.std(1).toString();
     */

  }, {
    key: 'std',
    value: function std() {
      var _this11 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this11.get(k).std();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return this.variance(axis).map(function (v) {
          return Math.sqrt(v);
        });
      }

      throw new _exceptions.InvalidAxisError();
    }

    /**
     * Return the variance of the values in the `DataFrame` along the axis
     *
     * pandas equivalent: [DataFrame.var](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.var.html)
     *
     * @param {number} axis=0
     *    Axis along which to calculate the variance
     *
     * @returns {Series}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * // x  1
     * // y  1
     * // Name: , dtype: dtype('int')
     * df.std().toString();
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
     *
     * // Returns
     * // 0  0
     * // 1  0
     * // 2  0
     * // Name: , dtype: dtype('int')
     * df.std(1).toString();
     */

  }, {
    key: 'variance',
    value: function variance() {
      var _this12 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this12.get(k).variance();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        var means = this.mean(axis).values;
        return new _series2.default(_immutable2.default.Range(0, this.length).map(function (idx) {
          return _this12.values.get(idx).reduce(function (s, k) {
            var diff = k - means.get(idx);
            return s + diff * diff / (_this12.columns.size - 1);
          }, 0);
        }).toArray(), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: '_pairwiseDataFrame',
    value: function _pairwiseDataFrame(func) {
      // Apply the func between all Series in the DataFrame, takes two series and returns a value
      var valArray = [];

      // Calculate upper triangle
      for (var idx1 = 0; idx1 < this.columns.size; idx1 += 1) {
        valArray.push({});
        var ds1 = this.get(this.columns.get(idx1));

        for (var idx2 = idx1; idx2 < this.columns.size; idx2 += 1) {
          var col2 = this.columns.get(idx2);
          var ds2 = this.get(col2);
          valArray[idx1][col2] = func(ds1, ds2);
        }
      }

      // Take upper triangle and fill in lower triangle
      for (var _idx = 0; _idx < this.columns.size; _idx += 1) {
        var col1 = this.columns.get(_idx);
        for (var _idx2 = _idx + 1; _idx2 < this.columns.size; _idx2 += 1) {
          var _col = this.columns.get(_idx2);
          valArray[_idx2][col1] = valArray[_idx][_col];
        }
      }

      return new DataFrame(valArray, { index: this.columns.toList() });
    }

    /**
     * Calculate the covariance between all `Series` in the `DataFrame`
     *
     * pandas equivalent: [DataFrame.cov](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cov.html)
     *
     * @return {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);
     *
     * // Returns DataFrame([{x: 1, y: -1, z: 2}, {x: -1, y: 1, z: -2}, {x: 2, y: -2, z: 4}])
     * df.cov();
     */

  }, {
    key: 'cov',
    value: function cov() {
      // $FlowFixMe TODO
      return this._pairwiseDataFrame(function (ds1, ds2) {
        return ds1.cov(ds2);
      });
    }

    /**
     * Calculate the correlation between all `Series` in the `DataFrame`
     *
     * pandas equivalent: [DataFrame.corr](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.corr.html)
     *
     * @return {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);
     *
     * // Returns DataFrame([{x: 1, y: -1, z: 1}, {x: -1, y: 1, z: -1}, {x: 1, y: -1, z: 1}])
     * df.corr();
     */

  }, {
    key: 'corr',
    value: function corr() {
      // noinspection Eslint
      var corrFunc = function corrFunc(ds1, ds2) {
        // $FlowFixMe TODO
        return ds1.values === ds2.values ? 1 : ds1.corr(ds2);
      };
      return this._pairwiseDataFrame(corrFunc);
    }

    /**
     * Return the difference over a given number of periods along the axis
     *
     * pandas equivalent: [DataFrame.diff](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.diff.html)
     *
     * @param {number} periods=1
     *    Number of periods to use for difference calculation
     * @param {number} axis=0
     *    Axis along which to calculate difference
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * //    x    |  y
     * // 0  null |  null
     * // 1  1    |  1
     * // 2  1  |  1
     * df.diff().toString();
     */

  }, {
    key: 'diff',
    value: function diff() {
      var _this13 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      if (axis === 0) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k) {
          return [k, _this13._data.get(k).diff(periods)];
        })), { index: this.index });
      } else if (axis === 1) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k, idx) {
          if (idx < periods) return [k, new _series2.default(_immutable2.default.Repeat(null, _this13.length).toList(), { name: k, index: _this13.index })];
          var compareCol = _this13.get(_this13.columns.get(idx - periods)); // $FlowFixMe TODO
          return [k, _this13.get(k).map(function (v, vIdx) {
            return v - compareCol.iloc(vIdx);
          })];
        })), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }

    /**
     * Return the percentage change over a given number of periods along the axis
     *
     * pandas equivalent: [DataFrame.pct_change](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.pct_change.html)
     *
     * @param {number} periods=1
     *    Number of periods to use for percentage change calculation
     * @param {number} axis=0
     *    Axis along which to calculate percentage change
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns
     * //    x    |  y
     * // 0  null |  null
     * // 1  1    |  0.5
     * // 2  0.5  |  0.3333
     * df.pct_change().toString();
     */

  }, {
    key: 'pct_change',
    value: function pct_change() {
      var _this14 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      if (axis === 0) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k) {
          return [k, _this14._data.get(k).pct_change(periods)];
        })), { index: this.index });
      } else if (axis === 1) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k, idx) {
          if (idx < periods) return [k, new _series2.default(_immutable2.default.Repeat(null, _this14.length).toList(), { name: k, index: _this14.index })];
          var compareCol = _this14.get(_this14.columns.get(idx - periods));
          // $FlowFixMe TODO
          return [k, _this14.get(k).map(function (v, vIdx) {
            return v / compareCol.iloc(vIdx) - 1;
          })];
        })), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }

    /**
     * Filter the DataFrame by an Iterable (Series, Array, or List) of booleans and return the subset
     *
     * pandas equivalent: df[df condition]
     *
     * @param {Series|Array|List} iterBool
     *    Iterable of booleans
     *
     * @returns {DataFrame}
     *
     * @example
     * const df = new DataFrame(Immutable.Map({x: new Series([1, 2]), y: new Series([2, 3])}));
     *
     * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
     * df.filter(df.get('x').gt(1));
     *
     * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
     * df.filter([false, true]);
     *
     * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
     * df.filter(Immutable.Map([false, true]));
     */

  }, {
    key: 'filter',
    value: function filter(iterBool) {
      if (!Array.isArray(iterBool) && !(iterBool instanceof _immutable2.default.List) && !(iterBool instanceof _series2.default)) throw new Error('filter must be an Array, List, or Series');

      if (Array.isArray(iterBool) && iterBool.length !== this.length) throw new Error('Array must be of equal length to DataFrame');else if (iterBool instanceof _immutable2.default.List && iterBool.size !== this.length) throw new Error('List must be of equal length to DataFrame');else if (iterBool instanceof _series2.default && iterBool.length !== this.length) throw new Error('Series must be of equal length to DataFrame');

      // noinspection Eslint
      return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref7) {
        var _ref8 = (0, _slicedToArray3.default)(_ref7, 2),
            k = _ref8[0],
            v = _ref8[1];

        return [k, v.filter(iterBool)];
      })));
    }

    /**
     * Reshape data (produce a 'pivot' table) based on column values. Uses unique values from
     * index / columns to form axes of the resulting DataFrame.
     *
     * pandas equivalent: [DataFrame.pivot](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.pivot.html)
     *
     * @param {string|number} index
     *  Name of the column to use as index
     * @param {string|number} columns
     *  Name of the column to use as column values
     * @param {string|number} values
     *  Name of the column to use as the value
     *
     * @returns {DataFrame}
     */

  }, {
    key: 'pivot',
    value: function pivot(index, columns, values) {
      var _this15 = this;

      var uniqueVals = _immutable2.default.Map({});
      var uniqueCols = _immutable2.default.List([]);

      this.index.forEach(function (v, idx) {
        var idxVal = _this15.get(index).iloc(idx);
        var colVal = _this15.get(columns).iloc(idx);

        if (uniqueVals.hasIn([idxVal, colVal])) throw new Error('pivot index and column must be unique');

        var val = _this15.get(values).iloc(idx);

        uniqueVals = uniqueVals.setIn([idxVal, colVal], val);
        if (!uniqueCols.has(colVal)) uniqueCols = uniqueCols.push(colVal);
      });
      var sortedIndex = uniqueVals.keySeq().sort().toArray();
      var sortedColumns = uniqueCols.sort();

      var data = _immutable2.default.OrderedMap(sortedColumns.map(function (col) {
        return [col, new _series2.default(sortedIndex.map(function (idx) {
          var val = uniqueVals.getIn([idx, col]);
          return typeof val === 'undefined' ? null : val;
        }), { name: col, index: sortedIndex })];
      }));

      return new DataFrame(data, { index: sortedIndex });
    }

    /**
     * Reshape data (produce a 'pivot' table) based on a set of index, columns, or values
     * columns from the original DataFrame
     *
     * @param {Array<string>|Immutable.List|string|number} index
     *  Name(s) of column(s) to use as the index for the pivoted DataFrame
     * @param {Array<string>|Immutable.List|string|number} columns
     *  Name(s) of column(s) to use as the columns for the pivoted DataFrame
     * @param {Array<string>|Immutable.List|string|number} values
     *  Name(s) of column(s) to use as the values for the pivoted DataFrame
     * @param {string} aggfunc
     *  Name of aggregation function
     */
    // eslint-disable-next-line

  }, {
    key: 'pivot_table',
    value: function pivot_table(index, columns, values) {
      var aggfunc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'sum';

      throw new Error('Not implemented');
      // const validateCols = (cols: T_PVINDEX): Immutable.List => {
      //   if (Array.isArray(cols)) {
      //     cols.forEach(c => this._assertColumnExists(c));
      //     return Immutable.List(cols);
      //   } else if (cols instanceof Immutable.List) {
      //     cols.forEach(c => this._assertColumnExists(c));
      //     return cols;
      //   } else if (typeof cols === 'string') {
      //     this._assertColumnExists(cols);
      //     return Immutable.List.of(cols);
      //   }
      //
      //   throw new TypeError('cols must be Array, Immutable.List, or string');
      // };
      //
      // // Validate types and cast to Immutable.List of column names
      // const indexCols = validateCols(index);
      // const columnCols = validateCols(columns);
      // const valuesCols = validateCols(values);
      //
      // let pivotMap = Immutable.Map({});
      //
      // this.index.map((indexVal, idx) => {
      //   const key = indexCols.map(c => this.get(c).iloc(idx))
      //     .concat(columnCols.map(c => this.get(c).iloc(idx)));
      //   let val = this.get(valuesCols.get(0)).iloc(idx);
      //   if (pivotMap.has(key)) {
      //     switch (aggfunc) {
      //       case 'sum':
      //         val += pivotMap.get(key);
      //         break;
      //       default:
      //         throw new Error('not implemented for aggs');
      //     }
      //   }
      //
      //   // This pivotMap has indexCols.size keys then columnCols.size keys which point to the value
      //   pivotMap = pivotMap.set(key, val);
      // });
      //
      // let indexMap = Immutable.OrderedMap({});
      // let columnsMap = Immutable.OrderedMap({});
      //
      // pivotMap.entrySeq().forEach(([k, v]) => {
      //   const indexKey = k.slice(0, indexCols.size - 1);
      //   console.log(k);
      //   console.log(indexKey);
      //   if (indexMap.hasIn(indexKey))
      //     indexMap = indexMap.setIn(
      //       indexKey, indexMap.getIn(indexKey).concat([k[indexCols.size - 1]]));
      //   else indexMap = indexMap.setIn(
      //     indexKey, Immutable.List.of(k[indexCols.size - 1]));
      //   columnsMap = columnsMap.setIn(k.slice(indexCols.size, k.length));
      // });
      //
      // console.log(indexMap);
      // console.log(columnsMap);
      // return pivotMap;
    }
  }, {
    key: '_cumulativeHelper',
    value: function _cumulativeHelper() {
      var _this16 = this;

      var operation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _utils.OP_CUMSUM;
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (axis === 0) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (c) {
          return [c, _this16.get(c)._cumulativeHelper(operation)];
        })), this.kwargs);
      } else if (axis === 1) {
        return new DataFrame(this.values.map(function (row) {
          return (0, _utils.generateCumulativeFunc)(operation)(row);
        }), this.kwargs);
      }
      throw new Error('invalid axis');
    }

    /**
     * Return cumulative sum over requested axis
     *
     * pandas equivalent: [DataFrame.cumsum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cumsum.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 3, y: 5}, {x: 6, y: 9}], {index: [2, 3, 4]});
     * ds.cumsum();
     *
     * // Returns DataFrame([{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 7}], {index: [2, 3 ,4]});
     * ds.cumsum(1);
     */

  }, {
    key: 'cumsum',
    value: function cumsum() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this._cumulativeHelper(_utils.OP_CUMSUM, axis);
    }

    /**
     * Return cumulative multiple over requested axis
     *
     * pandas equivalent: [DataFrame.cummul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummul.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 6}, {x: 6, y: 24}], {index: [2, 3, 4]});
     * ds.cummul();
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 6}, {x: 3, y: 12}], {index: [2, 3 ,4]});
     * ds.cummul(1);
     */

  }, {
    key: 'cummul',
    value: function cummul() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this._cumulativeHelper(_utils.OP_CUMMUL, axis);
    }

    /**
     * Return cumulative maximum over requested axis
     *
     * pandas equivalent: [DataFrame.cummax](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummax.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
     * ds.cummax();
     *
     * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3 ,4]});
     * ds.cummax(1);
     */

  }, {
    key: 'cummax',
    value: function cummax() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this._cumulativeHelper(_utils.OP_CUMMAX, axis);
    }

    /**
     * Return cumulative minimum over requested axis
     *
     * pandas equivalent: [DataFrame.cummin](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummin.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
     *
     * // Returns DataFrame([{x: 1, y: 1}, {x: 1, y: 1}, {x: 1, y: 1}], {index: [2, 3, 4]});
     * ds.cummin();
     *
     * // Returns DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}], {index: [2, 3 ,4]});
     * ds.cummin(1);
     */

  }, {
    key: 'cummin',
    value: function cummin() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this._cumulativeHelper(_utils.OP_CUMMIN, axis);
    }

    /**
     * Rename the `DataFrame` and return a new DataFrame
     *
     * pandas equivalent: [DataFrame.rename](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.rename.html)
     *
     * @param {Immutable.Map} columns
     * @returns {DataFrame}
     */

  }, {
    key: 'rename',
    value: function rename(_ref9) {
      var _this17 = this;

      var columns = _ref9.columns;

      return new DataFrame(_immutable2.default.OrderedMap(this.columns.map(function (prevCol) {
        var nextCol = columns.get(prevCol);
        if (typeof nextCol === 'undefined') return [prevCol, _this17._data.get(prevCol)];
        return [nextCol, _this17._data.get(prevCol).rename(nextCol)];
      })), { index: this.index });
    }

    /**
     * Append another DataFrame to this and return a new DataFrame
     *
     * pandas equivalent: [DataFrame.append](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.append.html)
     *
     * @param {DataFrame} other
     * @param {boolean} ignore_index
     * @returns {DataFrame}
     *
     * @example
     * const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [1, 2]});
     * const df2 = new DataFrame([{x: 2, y: 2}, {x: 3, y: 3}], {index: [2, 3]});
     *
     * // Returns DataFrame(
     * //  [{x: 1, y: 2}, {x: 2, y: 3}, {x: 2, y: 2}, {x: 3, y: 3}],
     * //  {index: [1, 2, 2, 3]});
     * df1.append(df2);
     *
     * // Returns DataFrame(
     * //  [{x: 1, y: 2}, {x: 2, y: 3}, {x: 2, y: 2}, {x: 3, y: 3}],
     * //  {index: [0, 1, 2, 3]});
     * df1.append(df2, true);
     */

  }, {
    key: 'append',
    value: function append(other) {
      var ignore_index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      // eslint-disable-next-line
      return _concatDataFrame( // $FlowFixMe
      [this, other], { ignore_index: ignore_index });
    }

    /**
     * Transpose the DataFrame by switching the index and columns
     *
     * pandas equivalent: [DataFrame.transpose](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.transpose.html)
     *
     * @returns {DataFrame}
     *
     * @example
     * const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
     *
     * // Returns DataFrame(
     * //  [{1: 1, 2: 2, 3: 3}, {1: 2, 2: 3, 3: 4}], {index: ['x', 'y']});
     * df1.transpose();
     */

  }, {
    key: 'transpose',
    value: function transpose() {
      var _this18 = this;

      return new DataFrame(_immutable2.default.OrderedMap(this.index.map(function (index, idx) {
        return [index, new _series2.default(_this18.values.get(idx), { index: _this18.columns.toList() })];
      })));
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return { index: this.index, columns: this.columns };
    }

    /**
     * Immutable.List of Immutable.List, with [row][column] indexing
     *
     * pandas equivalent: [DataFrame.values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.values.html)
     *
     * @returns {List.<List>}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns List [ List[1, 2, 3], List[2, 3, 4]]
     * df.values;
     */

  }, {
    key: 'values',
    get: function get() {
      var _this19 = this;

      if (this._values instanceof _immutable2.default.List) return (0, _get3.default)(DataFrame.prototype.__proto__ || Object.getPrototypeOf(DataFrame.prototype), 'values', this);

      var valuesList = _immutable2.default.List([]);

      var _loop = function _loop(idx) {
        valuesList = valuesList.concat([_immutable2.default.List(_this19.columns.map(function (k) {
          return _this19._data.get(k).iloc(idx);
        }))]);
      };

      for (var idx = 0; idx < this.length; idx += 1) {
        _loop(idx);
      }
      this._values = valuesList;

      return (0, _get3.default)(DataFrame.prototype.__proto__ || Object.getPrototypeOf(DataFrame.prototype), 'values', this);
    }

    /**
     * Returns the indexed Immutable.Seq of columns
     *
     * pandas equivalent: [DataFrame.columns](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.columns.html)
     *
     * @returns {Seq.Indexed<string>}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns Seq ['x', 'y']
     * df.columns;
     */

  }, {
    key: 'columns',
    get: function get() {
      return this._get_axis(1);
    }

    // noinspection JSAnnotator
    /**
     * Sets columns
     *
     * pandas equivalent: [DataFrame.columns](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.columns.html)
     *
     * @param {Seq.Indexed<string>|Array} columns
     *    Next column names
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * df.columns = ['a', 'b'];
     * // Returns Seq ['a', 'b']
     * df.columns;
     */
    ,
    set: function set(columns) {
      var _this20 = this;

      if (!Array.isArray(columns) || columns.length !== this.columns.size) throw new Error('Columns must be array of same dimension');

      var nextData = {};
      columns.forEach(function (k, idx) {
        var prevColumn = _this20.columns.get(idx);
        var prevSeries = _this20.get(prevColumn);

        nextData[k] = prevSeries.rename(k);
      });

      this._data = _immutable2.default.Map(nextData);
      this.set_axis(1, _immutable2.default.Seq(columns));
    }

    /**
     * Return the index values of the `DataFrame`
     *
     * @returns {List}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns List [0, 1, 2, 3]
     * df.index;
     */

  }, {
    key: 'index',
    get: function get() {
      return this._get_axis(0);
    }

    // noinspection JSAnnotator
    /**
     * Set the index values of the `DataFrame`
     *
     * @param {List|Array} index
     *  Next index values
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns List [0, 1, 2, 3]
     * df.index;
     * df.index = Immutable.List([2, 3, 4, 5]);
     * // Returns List [2, 3, 4, 5]
     * df.index;
     */
    ,
    set: function set(index) {
      var _this21 = this;

      this.set_axis(0, (0, _utils.parseIndex)(index, this._data.get(this.columns.get(0)).values));

      // noinspection Eslint
      this._data.mapEntries(function (_ref10) {
        var _ref11 = (0, _slicedToArray3.default)(_ref10, 2),
            k = _ref11[0],
            v = _ref11[1];

        // noinspection Eslint
        v.index = _this21.index;
      });
    }

    /**
     * Return the length of the `DataFrame`
     *
     * pandas equivalent: len(df);
     *
     * @returns {number}
     *
     * @example
     * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
     *
     * // Returns 3
     * df.length;
     */

  }, {
    key: 'length',
    get: function get() {
      var _this22 = this;

      return Math.max.apply(Math, [0].concat((0, _toConsumableArray3.default)(this.columns.map(function (k) {
        return _this22.get(k).length;
      }).toArray())));
    }
  }]);
  return DataFrame;
}(_generic2.default);

exports.default = DataFrame;


var innerMerge = function innerMerge(df1, df2, on) {
  var data = [];

  var cols1 = (0, _utils.nonMergeColumns)(df1.columns, on);
  var cols2 = (0, _utils.nonMergeColumns)(df2.columns, on);

  var intersectCols = (0, _utils.intersectingColumns)(cols1, cols2);
  intersectCols.count(); // Cache intersectCols size

  var cols1Rename = cols1.map(function (k) {
    return intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
  });

  var cols2Rename = cols2.map(function (k) {
    return intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
  });

  // eslint-disable-next-line
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop2 = function _loop2() {
      var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
          row1 = _step$value[0],
          _1 = _step$value[1];

      // eslint-disable-next-line
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop3 = function _loop3() {
          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              row2 = _step2$value[0],
              _2 = _step2$value[1];

          var match = true; // eslint-disable-next-line
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = on[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var c = _step3.value;

              if (row1.get(c) !== row2.get(c)) {
                match = false;
                break;
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          if (match) {
            var rowData = {};

            on.forEach(function (k) {
              rowData[k] = row1.get(k);
            });

            cols1.forEach(function (k, idx) {
              rowData[cols1Rename.get(idx)] = row1.get(k);
            });

            cols2.forEach(function (k, idx) {
              rowData[cols2Rename.get(idx)] = row2.get(k);
            });

            data.push(rowData);
          }
        };

        for (var _iterator2 = df2.iterrows()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop3();
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
    };

    for (var _iterator = df1.iterrows()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop2();
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

  return new DataFrame(data);
};

var outerMerge = function outerMerge(df1, df2, on) {
  var data = [];

  var cols1 = (0, _utils.nonMergeColumns)(df1.columns, on);
  var cols2 = (0, _utils.nonMergeColumns)(df2.columns, on);

  var intersectCols = (0, _utils.intersectingColumns)(cols1, cols2);
  intersectCols.count(); // Cache intersectCols size

  var matched1 = new Array(df1.length).fill(false);
  var matched2 = new Array(df2.length).fill(false);

  // eslint-disable-next-line
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    var _loop4 = function _loop4() {
      var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
          row1 = _step4$value[0],
          idx_1 = _step4$value[1];

      // eslint-disable-next-line
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        var _loop5 = function _loop5() {
          var _step5$value = (0, _slicedToArray3.default)(_step5.value, 2),
              row2 = _step5$value[0],
              idx_2 = _step5$value[1];

          var match = true; // eslint-disable-next-line
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = on[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var c = _step6.value;

              if (row1.get(c) !== row2.get(c)) {
                match = false;
                break;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          var rowData = {};

          on.forEach(function (k) {
            rowData[k] = row1.get(k);
          });

          cols1.forEach(function (k) {
            var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
            rowData[nextColName] = row1.get(k);
          });

          if (match) {
            cols2.forEach(function (k) {
              var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
              rowData[nextColName] = row2.get(k);
            });
            data.push(rowData);
            matched1[idx_1] = true;
            matched2[idx_2] = true;
          }
        };

        for (var _iterator5 = df2.iterrows()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          _loop5();
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    };

    for (var _iterator4 = df1.iterrows()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      _loop4();
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  matched1.forEach(function (m, idx) {
    if (!m) {
      var rowData = {};
      on.forEach(function (k) {
        rowData[k] = df1.get(k).iloc(idx);
      });

      cols1.forEach(function (k) {
        var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
        rowData[nextColName] = df1.get(k).iloc(idx);
      });

      cols2.forEach(function (k) {
        var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
        rowData[nextColName] = null;
      });
      data.push(rowData);
    }
  });

  matched2.forEach(function (m, idx) {
    if (!m) {
      var rowData = {};
      on.forEach(function (k) {
        rowData[k] = df2.get(k).iloc(idx);
      });

      cols1.forEach(function (k) {
        var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
        rowData[nextColName] = null;
      });

      cols2.forEach(function (k) {
        var nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
        rowData[nextColName] = df2.get(k).iloc(idx);
      });
      data.push(rowData);
    }
  });

  return new DataFrame(data);
};

var mergeDataFrame = exports.mergeDataFrame = function mergeDataFrame(df1, df2, on) {
  var how = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'inner';

  var mergeOn = void 0;
  if (typeof on === 'undefined') {
    mergeOn = df1.columns.filter(function (c1) {
      return df2.columns.filter(function (c2) {
        return c1 === c2;
      }).size > 0;
    });
    if (mergeOn.size === 0) throw new Error('No common keys');
  } else {
    on.forEach(function (col) {
      if (!df1.columnExists(col) || !df2.columnExists(col)) throw new Error('KeyError: ' + col + ' not found');
    });
    mergeOn = on;
  }

  switch (how) {
    case 'inner':
      return innerMerge(df1, df2, mergeOn);
    case 'outer':
      return outerMerge(df1, df2, mergeOn);
    default:
      throw new Error('MergeError: ' + how + ' not a supported merge type');
  }
};

// Concat
var _concatDataFrame = exports._concatDataFrame = function _concatDataFrame(objs, kwargs) {
  if (!(objs instanceof _immutable2.default.List || Array.isArray(objs))) throw new Error('objs must be List or Array');

  if (objs instanceof _immutable2.default.List && objs.filter(function (frame) {
    return frame instanceof DataFrame;
  }).size !== objs.size) throw new Error('Objects must all be DataFrame');else if (Array.isArray(objs) && objs.filter(function (frame) {
    return frame instanceof DataFrame;
  }).length !== objs.length) throw new Error('Objects must all be DataFrame');

  if (Array.isArray(objs) && objs.length === 1) return objs[0];else if (objs instanceof _immutable2.default.List && objs.size === 1) return objs.get(0);

  var seriesOrderedMap = _immutable2.default.OrderedMap({});
  if (kwargs.axis === 1) {
    objs.forEach(function (df) {
      df.columns.forEach(function (column) {
        var columnExists = seriesOrderedMap.has(column);
        seriesOrderedMap = seriesOrderedMap.set(columnExists ? column + '.x' : column, // $FlowFixMe
        columnExists ? df.get(column).rename(column + '.x') : df.get(column));
      });
    });
  } else {
    objs.forEach(function (df) {
      var lenSeriesInMap = seriesOrderedMap.keySeq().size === 0 ? 0 : seriesOrderedMap.first().length;
      var nextLength = df.length + lenSeriesInMap;

      seriesOrderedMap = _immutable2.default.OrderedMap(
      // Get entries already concated (already in seriesOrderedMap)
      seriesOrderedMap.entrySeq().map(function (_ref12) {
        var _ref13 = (0, _slicedToArray3.default)(_ref12, 2),
            column = _ref13[0],
            series = _ref13[1];

        if (df.columnExists(column)) return [column, // $FlowFixMe
        (0, _series._concatSeries)([series, df.get(column)], kwargs)];
        return [column, // $FlowFixMe
        (0, _series._concatSeries)([series, new _series2.default(_immutable2.default.Repeat(NaN, df.length).toList(), { index: df.index })], kwargs)]; // Now merge with columns only in the "right" DataFrame
      })).merge(_immutable2.default.OrderedMap(df.columns.filter(function (column) {
        return !seriesOrderedMap.has(column);
      }).map(function (column) {
        return (// $FlowFixMe
          [column, lenSeriesInMap === 0 ? df.get(column) : (0, _series._concatSeries)([new _series2.default(_immutable2.default.Repeat(NaN, nextLength)), df.get(column)], kwargs)]
        );
      })));
    });
  }

  return new DataFrame(seriesOrderedMap);
};

//# sourceMappingURL=frame.js.map