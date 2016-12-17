'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeDataFrame = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _series = require('./series');

var _series2 = _interopRequireDefault(_series);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseArrayToSeriesObject = function parseArrayToSeriesObject(array) {
  var returnObject = {};

  array.forEach(function (el) {
    if ((typeof el === 'undefined' ? 'undefined' : (0, _typeof3.default)(el)) === 'object') {
      Object.keys(el).forEach(function (k) {
        if (k in returnObject) {
          returnObject[k] = returnObject[k].push(el[k]);
        } else {
          returnObject[k] = _immutable2.default.List.of(el[k]);
        }
      });
    }
  });

  return returnObject;
};

var DataFrame = function () {
  /**
   * Two-dimensional size-mutable, potentially heterogeneous tabular data
   * structure with labeled axes (rows and columns). Arithmetic operations
   * align on both row and column labels. Can be thought of as a Object-like
   * container for Series objects. The primary pandas data structure
   *
   * * @param data {Array|Object}
   *    Data to be stored in DataFrame
   * @param {Object} kwargs
   *    Extra optional arguments for a DataFrame
   * @param {Array|Object} [kwargs.index]
   */
  function DataFrame(data) {
    var _this = this;

    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, DataFrame);

    if (Array.isArray(data)) {
      (function () {
        var seriesObject = parseArrayToSeriesObject(data);
        _this._columns = Object.keys(seriesObject);
        _this._columns.forEach(function (k) {
          _this[k] = new _series2.default(seriesObject[k], { name: k });
        });
      })();
    } else if (typeof data === 'undefined') this._columns = [];

    this.index = kwargs.index;
    this._values = _immutable2.default.List(this._columns.map(function (k) {
      return _this[k].values;
    }));
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

      var _loop = function _loop(idx) {
        string += idx + '\t|';
        _this2.columns.forEach(function (k) {
          string += '  ' + _this2[k].iloc(idx) + '  |';
        });
        string += '\n';
      };

      for (var idx = 0; idx < this.length; idx += 1) {
        _loop(idx);
      }

      return string;
    }
  }, {
    key: 'kwargs',
    value: function kwargs() {
      this.kwargs = {
        index: this.index
      };
    }
  }, {
    key: Symbol.iterator,
    value: function value() {
      var _this3 = this;

      var index = -1;

      return {
        next: function next() {
          index += 1;
          var row = {};
          _this3.columns.forEach(function (k) {
            row[k] = _this3[k].values.get(index);
          });
          return {
            value: new DataFrame([row], _this3.kwargs),
            done: !(index >= 0 && index < _this3.length) };
        }
      };
    }
  }, {
    key: 'iterrows',
    value: function iterrows() {
      return (0, _utils.enumerate)(this);
    }

    /**
     * Immutable.List of Immutable.List, with [row][column] indexing
     *
     * @returns {List.<List>}
     */

  }, {
    key: 'merge',


    /**
     * Merge this DataFrame with another DataFrame, optionally on some set of columns
     *
     * @param {DataFrame} df
     * @param {Array} on
     * @param {string} how='inner'
     *
     * @returns {DataFrame}
     */
    value: function merge(df, on) {
      var how = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'inner';

      return mergeDataFrame(this, df, on, how);
    }
  }, {
    key: 'values',
    get: function get() {
      return this._values;
    }
  }, {
    key: 'columns',
    get: function get() {
      return this._columns;
    },
    set: function set(columns) {
      var _this4 = this;

      if (!Array.isArray(columns) || columns.length !== this.columns.length) throw new Error('Columns must be array of same dimension');

      columns.forEach(function (k, idx) {
        var prevColumn = _this4.columns[idx];
        _this4[prevColumn].name = k;
        _this4[k] = _this4[prevColumn];

        if (prevColumn !== k) delete _this4[prevColumn];
      });
      this._columns = columns;
    }
  }, {
    key: 'length',
    get: function get() {
      var _this5 = this;

      return Math.max.apply(Math, (0, _toConsumableArray3.default)(this.columns.map(function (k) {
        return _this5[k].length;
      })));
    }
  }]);
  return DataFrame;
}();

/**
 * Perform an inner merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 *
 * @returns {DataFrame}
 */


exports.default = DataFrame;
var innerMerge = function innerMerge(df1, df2, on) {
  var data = [];

  var cols1 = (0, _utils.nonMergeColumns)(df1.columns, on);
  var cols2 = (0, _utils.nonMergeColumns)(df2.columns, on);

  var intersectCols = (0, _utils.intersectingColumns)(cols1, cols2);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop2 = function _loop2() {
      var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
          row1 = _step$value[0],
          _1 = _step$value[1];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop3 = function _loop3() {
          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              row2 = _step2$value[0],
              _2 = _step2$value[1];

          var match = true;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = on[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var c = _step3.value;

              if (row1[c].iloc(0) !== row2[c].iloc(0)) {
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
            (function () {
              var rowData = {};

              on.forEach(function (k) {
                rowData[k] = row1[k].iloc(0);
              });

              cols1.forEach(function (k) {
                var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
                rowData[nextColName] = row1[k].iloc(0);
              });

              cols2.forEach(function (k) {
                var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
                rowData[nextColName] = row2[k].iloc(0);
              });

              data.push(rowData);
            })();
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

/**
 * Perform an outer merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 *
 * @returns {DataFrame}
 */
var outerMerge = function outerMerge(df1, df2, on) {
  var data = [];

  var cols1 = (0, _utils.nonMergeColumns)(df1.columns, on);
  var cols2 = (0, _utils.nonMergeColumns)(df2.columns, on);

  var intersectCols = (0, _utils.intersectingColumns)(cols1, cols2);

  var matched1 = new Array(df1.length).fill(false);
  var matched2 = new Array(df2.length).fill(false);

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    var _loop4 = function _loop4() {
      var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
          row1 = _step4$value[0],
          idx_1 = _step4$value[1];

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        var _loop5 = function _loop5() {
          var _step5$value = (0, _slicedToArray3.default)(_step5.value, 2),
              row2 = _step5$value[0],
              idx_2 = _step5$value[1];

          var match = true;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = on[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var c = _step6.value;

              if (row1[c].iloc(0) !== row2[c].iloc(0)) {
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
            rowData[k] = row1[k].iloc(0);
          });

          cols1.forEach(function (k) {
            var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
            rowData[nextColName] = row1[k].iloc(0);
          });

          if (match) {
            cols2.forEach(function (k) {
              var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
              rowData[nextColName] = row2[k].iloc(0);
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
      (function () {
        var rowData = {};
        on.forEach(function (k) {
          rowData[k] = df1[k].iloc(idx);
        });

        cols1.forEach(function (k) {
          var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
          rowData[nextColName] = df1[k].iloc(idx);
        });

        cols2.forEach(function (k) {
          var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
          rowData[nextColName] = null;
        });
        data.push(rowData);
      })();
    }
  });

  matched2.forEach(function (m, idx) {
    if (!m) {
      (function () {
        var rowData = {};
        on.forEach(function (k) {
          rowData[k] = df2[k].iloc(idx);
        });

        cols1.forEach(function (k) {
          var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
          rowData[nextColName] = null;
        });

        cols2.forEach(function (k) {
          var nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
          rowData[nextColName] = df2[k].iloc(idx);
        });
        data.push(rowData);
      })();
    }
  });

  return new DataFrame(data);
};

/**
 * Perform a merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 * @param {string} how='inner'
 *
 * @returns {DataFrame}
 */
var mergeDataFrame = exports.mergeDataFrame = function mergeDataFrame(df1, df2, on) {
  var how = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'inner';

  var mergeOn = void 0;
  if (typeof on === 'undefined') {
    mergeOn = df1.columns.filter(function (c1) {
      return df2.columns.filter(function (c2) {
        return c1 === c2;
      }).length > 0;
    });
    if (mergeOn.length === 0) throw new Error('No common keys');
  } else {
    on.forEach(function (col) {
      if (df1.columns.indexOf(col) < 0 || df2.columns.indexOf(col) < 0) throw new Error('KeyError: ' + col + ' not found');
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