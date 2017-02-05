'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeDataFrame = undefined;

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

var DataFrame = function (_NDFrame) {
  (0, _inherits3.default)(DataFrame, _NDFrame);

  function DataFrame(data) {
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, DataFrame);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DataFrame.__proto__ || Object.getPrototypeOf(DataFrame)).call(this, data, kwargs));

    if (Array.isArray(data)) {
      _this.set_axis(0, (0, _utils.parseIndex)(kwargs.index, _immutable2.default.List(data)));
      _this._data = parseArrayToSeriesMap(data, _this.index);
      _this.set_axis(1, _this._data.keySeq());
    } else if (data instanceof _immutable2.default.Map) {
      _this._data = _immutable2.default.Map(data.keySeq().map(function (k) {
        if (!(data.get(k) instanceof _series2.default)) throw new Error('Map must have [column, series] key-value pairs');

        return [k, data.get(k).copy()];
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
  }, {
    key: 'copy',
    value: function copy() {
      return new DataFrame(this._data, { index: this.index });
    }
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
  }, {
    key: 'iterrows',
    value: function iterrows() {
      return (0, _utils.enumerate)(this);
    }
  }, {
    key: 'iloc',
    value: function iloc(rowIdx, colIdx) {
      var _this4 = this;

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
            var getCol = _this4.columns.get(idx);
            return [getCol, _this4.get(getCol).iloc(rowIdx, rowIdx + 1)];
          }).toArray()), { index: this.index.slice(rowIdx, rowIdx + 1) });
        } else if (typeof colIdx === 'undefined') {
          return new DataFrame(_immutable2.default.Map(this.columns.map(function (c) {
            return [c, _this4.get(c).iloc(rowIdx, rowIdx + 1)];
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
            var getCol = _this4.columns.get(idx);
            return [getCol, _this4.get(getCol).iloc(rowIdx[0], rowIdx[1])];
          }).toArray()), { index: this.index.slice(rowIdx[0], rowIdx[1]) });
        } else if (typeof colIdx === 'undefined') {
          return new DataFrame(_immutable2.default.Map(this.columns.map(function (c) {
            return [c, _this4.get(c).iloc(rowIdx[0], rowIdx[1])];
          }).toArray()), { index: this.index.slice(rowIdx[0], rowIdx[1]) });
        }

        throw new TypeError('colIdx must be either integer or Array of integers');
      }

      throw new TypeError('rowIdx must be either integer or Array of integers');
    }
  }, {
    key: 'head',
    value: function head() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

      return this.iloc([0, n]);
    }
  }, {
    key: 'tail',
    value: function tail() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

      return this.iloc([this.length - n, this.length]);
    }
  }, {
    key: 'columnExists',
    value: function columnExists(col) {
      return this.columns.indexOf(col) >= 0;
    }
  }, {
    key: 'get',
    value: function get(columns) {
      var _this5 = this;

      if ((typeof columns === 'string' || typeof columns === 'number') && this.columnExists(columns)) return this._data.get(columns);else if (Array.isArray(columns) || columns instanceof _immutable2.default.List || columns instanceof _immutable2.default.Seq) {
        columns.forEach(function (c) {
          if (!_this5.columnExists(c)) throw new Error('KeyError: ' + c + ' not found');
        });
        return new DataFrame(_immutable2.default.Map(columns.map(function (c) {
          return [c, _this5.get(c)];
        })), this.kwargs);
      }
      throw new Error('KeyError: ' + columns + ' not found');
    }
  }, {
    key: 'where',
    value: function where(other, op) {
      if (!Array.isArray(other) && !(other instanceof _immutable2.default.List) && !(other instanceof _series2.default) && !(other instanceof DataFrame)) {
        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref) {
          var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
              k = _ref2[0],
              v = _ref2[1];

          return [k, v.where(other, op)];
        })));
      } else if (Array.isArray(other) || other instanceof _series2.default || other instanceof _immutable2.default.List) {
        if ((Array.isArray(other) || other instanceof _series2.default) && other.length !== this.length) throw new Error('Array or Series must be same length as DataFrame');
        if (other instanceof _immutable2.default.List && other.size !== this.length) throw new Error('Immutable List must be same size as DataFrame');

        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref3) {
          var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
              k = _ref4[0],
              v = _ref4[1];

          return [k, v.where(other, op)];
        })));
      } else if (other instanceof DataFrame) {
        if (!other.shape.equals(this.shape)) throw new Error('DataFrame must have the same shape');

        return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref5, idx) {
          var _ref6 = (0, _slicedToArray3.default)(_ref5, 2),
              k = _ref6[0],
              v = _ref6[1];

          return [k, v.where(other.get(other.columns.get(idx)), op)];
        })));
      }

      throw new Error('Unsupported comparison value, or non-matching lengths');
    }
  }, {
    key: 'eq',
    value: function eq(other) {
      return this.where(other, function (a, b) {
        return a === b;
      });
    }
  }, {
    key: 'gt',
    value: function gt(other) {
      return this.where(other, function (a, b) {
        return a > b;
      });
    }
  }, {
    key: 'gte',
    value: function gte(other) {
      return this.where(other, function (a, b) {
        return a >= b;
      });
    }
  }, {
    key: 'lt',
    value: function lt(other) {
      return this.where(other, function (a, b) {
        return a < b;
      });
    }
  }, {
    key: 'lte',
    value: function lte(other) {
      return this.where(other, function (a, b) {
        return a <= b;
      });
    }
  }, {
    key: 'merge',
    value: function merge(df, on) {
      var how = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'inner';

      return mergeDataFrame(this, df, on, how);
    }
  }, {
    key: 'to_csv',
    value: function to_csv() {
      var _this6 = this;

      var csvString = '';
      this.columns.forEach(function (k) {
        csvString += k + ',';
      });
      csvString += '\r\n';

      var updateString = function updateString(idx) {
        var s = '';
        _this6.columns.forEach(function (k) {
          s += _this6.get(k).iloc(idx) + ',';
        });
        return s;
      };
      for (var idx = 0; idx < this.length; idx += 1) {
        csvString += updateString(idx);
        csvString += '\r\n';
      }

      return csvString;
    }
  }, {
    key: 'to_excel',
    value: function to_excel(excel_writer) {
      var sheetName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Sheet1';
      var download = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var kwargs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { index: true };

      throw new Error('to_excel not yet implemented');
    }
  }, {
    key: 'to_json',
    value: function to_json() {
      var _this7 = this;

      var kwargs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { orient: 'columns' };

      var ALLOWED_ORIENT = ['records', 'split', 'index', 'values', 'columns'];
      var orient = 'columns';

      if (typeof kwargs.orient !== 'undefined') {
        if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0) throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
        orient = kwargs.orient;
      }

      var json = void 0;
      switch (orient) {
        case 'records':
          return this.values.map(function (row) {
            var rowObj = {};
            row.forEach(function (val, idx) {
              rowObj[_this7.columns.get(idx)] = val;
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
              rowObj[_this7.columns.get(idx2)] = val;
            });
            json[_this7.index.get(idx)] = rowObj;
          });
          return json;
        case 'values':
          return this.values.toJS();
        case 'columns':
          json = {};
          this.columns.forEach(function (c) {
            json[c] = _this7.get(c).to_json({ orient: 'index' });
          });
          return json;
        default:
          throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
      }
    }
  }, {
    key: 'sum',
    value: function sum() {
      var _this8 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this8.get(k).sum();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return new _series2.default(_immutable2.default.Range(0, this.length).map(function (idx) {
          return _this8.values.get(idx).reduce(function (s, k) {
            return s + k;
          }, 0);
        }).toList(), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: 'mean',
    value: function mean() {
      var _this9 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this9.get(k).mean();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return new _series2.default(_immutable2.default.Range(0, this.length).map(function (idx) {
          return _this9.values.get(idx).reduce(function (s, k) {
            return s + k / _this9.columns.size;
          }, 0);
        }).toList(), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: 'std',
    value: function std() {
      var _this10 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this10.get(k).std();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        return this.variance(axis).map(function (v) {
          return Math.sqrt(v);
        });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: 'variance',
    value: function variance() {
      var _this11 = this;

      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (axis === 0) {
        return new _series2.default(this.columns.toArray().map(function (k) {
          return _this11.get(k).variance();
        }), { index: this.columns.toArray() });
      } else if (axis === 1) {
        var _ret = function () {
          var means = _this11.mean(axis).values;
          return {
            v: new _series2.default(_immutable2.default.Range(0, _this11.length).map(function (idx) {
              return _this11.values.get(idx).reduce(function (s, k) {
                var diff = k - means.get(idx);
                return s + diff * diff / (_this11.columns.size - 1);
              }, 0);
            }).toArray(), { index: _this11.index })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: '_pairwiseDataFrame',
    value: function _pairwiseDataFrame(func) {
      var valArray = [];

      for (var idx1 = 0; idx1 < this.columns.size; idx1 += 1) {
        valArray.push({});
        var ds1 = this.get(this.columns.get(idx1));

        for (var idx2 = idx1; idx2 < this.columns.size; idx2 += 1) {
          var col2 = this.columns.get(idx2);
          var ds2 = this.get(col2);
          valArray[idx1][col2] = func(ds1, ds2);
        }
      }

      for (var _idx = 0; _idx < this.columns.size; _idx += 1) {
        var col1 = this.columns.get(_idx);
        for (var _idx2 = _idx + 1; _idx2 < this.columns.size; _idx2 += 1) {
          var _col = this.columns.get(_idx2);
          valArray[_idx2][col1] = valArray[_idx][_col];
        }
      }

      return new DataFrame(valArray, { index: this.columns.toList() });
    }
  }, {
    key: 'cov',
    value: function cov() {
      return this._pairwiseDataFrame(function (ds1, ds2) {
        return ds1.cov(ds2);
      });
    }
  }, {
    key: 'corr',
    value: function corr() {
      var corrFunc = function corrFunc(ds1, ds2) {
        return ds1.values === ds2.values ? 1 : ds1.corr(ds2);
      };
      return this._pairwiseDataFrame(corrFunc);
    }
  }, {
    key: 'diff',
    value: function diff() {
      var _this12 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      if (axis === 0) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k) {
          return [k, _this12._data.get(k).diff(periods)];
        })), { index: this.index });
      } else if (axis === 1) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k, idx) {
          if (idx < periods) return [k, new _series2.default(_immutable2.default.Repeat(null, _this12.length).toList(), { name: k, index: _this12.index })];
          var compareCol = _this12.get(_this12.columns.get(idx - periods));
          return [k, _this12.get(k).map(function (v, vIdx) {
            return v - compareCol.iloc(vIdx);
          })];
        })), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: 'pct_change',
    value: function pct_change() {
      var _this13 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      if (axis === 0) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k) {
          return [k, _this13._data.get(k).pct_change(periods)];
        })), { index: this.index });
      } else if (axis === 1) {
        return new DataFrame(_immutable2.default.Map(this.columns.map(function (k, idx) {
          if (idx < periods) return [k, new _series2.default(_immutable2.default.Repeat(null, _this13.length).toList(), { name: k, index: _this13.index })];
          var compareCol = _this13.get(_this13.columns.get(idx - periods));
          return [k, _this13.get(k).map(function (v, vIdx) {
            return v / compareCol.iloc(vIdx) - 1;
          })];
        })), { index: this.index });
      }

      throw new _exceptions.InvalidAxisError();
    }
  }, {
    key: 'filter',
    value: function filter(iterBool) {
      if (!Array.isArray(iterBool) && !(iterBool instanceof _immutable2.default.List) && !(iterBool instanceof _series2.default)) throw new Error('filter must be an Array, List, or Series');

      if (Array.isArray(iterBool) && iterBool.length !== this.length) throw new Error('Array must be of equal length to DataFrame');else if (iterBool instanceof _immutable2.default.List && iterBool.size !== this.length) throw new Error('List must be of equal length to DataFrame');else if (iterBool instanceof _series2.default && iterBool.length !== this.length) throw new Error('Series must be of equal length to DataFrame');

      return new DataFrame(_immutable2.default.Map(this._data.mapEntries(function (_ref7) {
        var _ref8 = (0, _slicedToArray3.default)(_ref7, 2),
            k = _ref8[0],
            v = _ref8[1];

        return [k, v.filter(iterBool)];
      })));
    }
  }, {
    key: 'pivot',
    value: function pivot(index, columns, values) {
      var _this14 = this;

      var uniqueVals = _immutable2.default.Map({});
      var uniqueCols = _immutable2.default.List([]);

      this.index.forEach(function (v, idx) {
        var idxVal = _this14.get(index).iloc(idx);
        var colVal = _this14.get(columns).iloc(idx);

        if (uniqueVals.hasIn([idxVal, colVal])) throw new Error('pivot index and column must be unique');

        var val = _this14.get(values).iloc(idx);

        uniqueVals = uniqueVals.setIn([idxVal, colVal], val);
        if (!uniqueCols.has(colVal)) uniqueCols = uniqueCols.push(colVal);
      });
      var sortedIndex = uniqueVals.keySeq().sort().toArray();
      var sortedColumns = uniqueCols.sort();
      return new DataFrame(sortedIndex.map(function (idx) {
        var rowMap = _immutable2.default.Map({});
        sortedColumns.forEach(function (col) {
          var val = uniqueVals.getIn([idx, col]);
          rowMap = rowMap.set(col, typeof val === 'undefined' ? null : val);
        });
        return rowMap;
      }), { index: sortedIndex });
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return { index: this.index };
    }
  }, {
    key: 'values',
    get: function get() {
      var _this15 = this;

      if (this._values instanceof _immutable2.default.List) return (0, _get3.default)(DataFrame.prototype.__proto__ || Object.getPrototypeOf(DataFrame.prototype), 'values', this);

      var valuesList = _immutable2.default.List([]);

      var _loop = function _loop(idx) {
        valuesList = valuesList.concat([_immutable2.default.List(_this15.columns.map(function (k) {
          return _this15._data.get(k).iloc(idx);
        }))]);
      };

      for (var idx = 0; idx < this.length; idx += 1) {
        _loop(idx);
      }
      this._values = valuesList;

      return (0, _get3.default)(DataFrame.prototype.__proto__ || Object.getPrototypeOf(DataFrame.prototype), 'values', this);
    }
  }, {
    key: 'columns',
    get: function get() {
      return this._get_axis(1);
    },
    set: function set(columns) {
      var _this16 = this;

      if (!Array.isArray(columns) || columns.length !== this.columns.size) throw new Error('Columns must be array of same dimension');

      var nextData = {};
      columns.forEach(function (k, idx) {
        var prevColumn = _this16.columns.get(idx);
        var prevSeries = _this16.get(prevColumn);

        prevSeries.name = k;
        nextData[k] = prevSeries;
      });

      this._data = _immutable2.default.Map(nextData);
      this.set_axis(1, _immutable2.default.Seq(columns));
    }
  }, {
    key: 'index',
    get: function get() {
      return this._get_axis(0);
    },
    set: function set(index) {
      var _this17 = this;

      this.set_axis(0, (0, _utils.parseIndex)(index, this._data.get(this.columns.get(0)).values));

      this._data.mapEntries(function (_ref9) {
        var _ref10 = (0, _slicedToArray3.default)(_ref9, 2),
            k = _ref10[0],
            v = _ref10[1];

        v.index = _this17.index;
      });
    }
  }, {
    key: 'length',
    get: function get() {
      var _this18 = this;

      return Math.max.apply(Math, (0, _toConsumableArray3.default)(this._data.keySeq().map(function (k) {
        return _this18.get(k).length;
      }).toArray()));
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
  intersectCols.count();

  var cols1Rename = cols1.map(function (k) {
    return intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_x' : k;
  });

  var cols2Rename = cols2.map(function (k) {
    return intersectCols.size > 0 && intersectCols.indexOf(k) >= 0 ? k + '_y' : k;
  });

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
            (function () {
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

var outerMerge = function outerMerge(df1, df2, on) {
  var data = [];

  var cols1 = (0, _utils.nonMergeColumns)(df1.columns, on);
  var cols2 = (0, _utils.nonMergeColumns)(df2.columns, on);

  var intersectCols = (0, _utils.intersectingColumns)(cols1, cols2);
  intersectCols.count();

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
      (function () {
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
      })();
    }
  });

  matched2.forEach(function (m, idx) {
    if (!m) {
      (function () {
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
      })();
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