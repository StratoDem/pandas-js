'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._concatSeries = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _generic = require('./generic');

var _generic2 = _interopRequireDefault(_generic);

var _utils = require('./utils');

var _dtype = require('./dtype');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 
 * A pandas.Series one-dimensional array with axis labels, with an Immutable.List instead of
 * numpy.ndarray as the values
 */

var Series = function (_NDFrame) {
  (0, _inherits3.default)(Series, _NDFrame);

  /**
   * One dimensional array with axis labels. An `Immutable.List` serves as the numpy.ndarray for
   * values.
   *
   * Operations between `Series` (+, -, /, *, **) align values based on their associated index
   * values
   *
   * @param {Array|List} data
   *    Data to be stored in Series
   * @param {Object} kwargs
   *    Extra optional arguments for a Series
   * @param {string} [kwargs.name='']
   *    The _name to assign to the Series
   * @param {Array|List} [kwargs.index]
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'My test name', index: [2, 3, 4, 5]})
   * ds.toString()
   * // Returns:
   * // 2  1
   * // 3  2
   * // 4  3
   * // 5  4
   * // Name: My test name, dtype: dtype(int)
   */
  function Series(data) {
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Series);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Series.__proto__ || Object.getPrototypeOf(Series)).call(this, data, kwargs));

    if (Array.isArray(data)) {
      _this._values = _immutable2.default.List(data);
      _this._dtype = (0, _dtype.arrayToDType)(data);
    } else if (data instanceof _immutable2.default.List) {
      _this._values = data;
      _this._dtype = (0, _dtype.arrayToDType)(data);
    } else {
      _this._values = _immutable2.default.List.of(data);
      _this._dtype = (0, _dtype.arrayToDType)([data]);
    }

    _this._name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';

    _this.set_axis(0, (0, _utils.parseIndex)(kwargs.index, _this.values));
    _this._setup_axes(_immutable2.default.List.of(0));

    // $FlowFixMe TODO
    _this._sort_ascending = _this._sort_ascending.bind(_this);
    // $FlowFixMe TODO
    _this._sort_descending = _this._sort_descending.bind(_this);
    return _this;
  }

  // $FlowFixMe


  (0, _createClass3.default)(Series, [{
    key: Symbol.iterator,
    value: function value() {
      var values = this.values;
      var index = -1;

      return {
        next: function next() {
          index += 1;
          return { value: values.get(index), done: !(index >= 0 && index < values.size) };
        }
      };
    }

    /**
     * Return a new `Series` created by a map along a `Series`
     *
     * pandas equivalent: [Series.map](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.map.html)
     *
     * @param {function} func
     *  Function to apply along the values
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
     *
     * // Returns Series([1, 4, 9, 16], {name: 'New Series', index: [1, 2]})
     * ds.map((val, idx) => val ** 2);
     */

  }, {
    key: 'map',
    value: function map(func) {
      return new Series(this.values.map(function (val, idx) {
        return func(val, idx);
      }), { name: this.name, index: this.index });
    }

    /**
     * forEach applied along the `Series` values
     *
     * @param {function} func
     *  Function to apply along the values
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
     *
     * // Logs 1, 4, 9, 16
     * ds.forEach((val, idx) => console.log(val ** 2));
     */

  }, {
    key: 'forEach',
    value: function forEach(func) {
      this.values.forEach(function (val, idx) {
        return func(val, idx);
      });
    }

    /**
     * Return the `Series` as a string
     *
     * @returns {string}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'My test name', index: [2, 3, 4, 5]})
     * ds.toString()
     * // Returns:
     * // 2  1
     * // 3  2
     * // 4  3
     * // 5  4
     * // Name: My test name, dtype: dtype(int)
     */

  }, {
    key: 'toString',
    value: function toString() {
      var _this2 = this;

      // $FlowFixMe TODO
      var vals = this.iloc(0, 10).values;

      var valString = '';
      vals.forEach(function (v, idx) {
        valString += _this2.index.get(idx) + '\t' + v + '\n';
      });

      return valString + 'Name: ' + this.name + ', dtype: ' + this.dtype;
    }

    /**
     * Return first n rows
     *
     * pandas equivalent: [Series.head](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.head.html)
     *
     * @param {number} n=5
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4, 5, 6, 7, 8]);
     *
     * // Returns Series([1, 2, 3, 4, 5])
     * ds.head();
     *
     * // Returns Series([1, 2, 3])
     * ds.head(3);
     */

  }, {
    key: 'head',
    value: function head() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

      // $FlowFixMe TODO
      return this.iloc(0, n);
    }

    /**
     * Return last n rows
     *
     * pandas equivalent: [Series.tail](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.tail.html)
     *
     * @param {number} n=5
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4, 5, 6, 7, 8]);
     *
     * // Returns Series([4, 5, 6, 7, 8])
     * ds.tail();
     *
     * // Returns Series([6, 7, 8])
     * ds.tail(3);
     */

  }, {
    key: 'tail',
    value: function tail() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

      // $FlowFixMe TODO
      return this.iloc(this.length - n, this.length);
    }

    /**
     * Return a new deep copy of the `Series`
     *
     * pandas equivalent: [Series.copy](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.copy.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test 1'});
     * const ds2 = ds.copy();
     * ds2.index = [1, 2, 3];
     * ds.index   // [0, 1, 2];
     * ds2.index  // [1, 2, 3];
     */

  }, {
    key: 'copy',
    value: function copy() {
      return new Series(this.values, { index: this.index, name: this.name });
    }
  }, {
    key: 'astype',


    /**
     * Convert the series to the desired type
     *
     * pandas equivalent: [Series.astype](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.astype.html)
     *
     * @param {DType} nextType
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     *
     * // dtype('float')
     * ds.dtype;
     *
     * // Series([1, 2, 3])
     * ds.astype(new DType('int'))
     */
    value: function astype(nextType) {
      if (!(nextType instanceof _dtype.DType)) throw new Error('Next type must be a DType');

      if (nextType.dtype === this.dtype) return this;

      switch (nextType.dtype) {
        case 'int':
          {
            if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to int');
            var kwargs = { name: this.name, index: this.index };
            return new Series(this.values.map(function (v) {
              return Math.floor(v);
            }), kwargs);
          }
        case 'float':
          {
            if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to float');
            var _kwargs = { name: this.name, index: this.index };
            return new Series(this.values.map(function (v) {
              return parseFloat(v);
            }), _kwargs);
          }
        default:
          throw new Error('Invalid dtype ' + nextType);
      }
    }

    /**
     * Return the Series between [startVal, endVal), or at startVal if endVal is undefined
     *
     * pandas equivalent: [Series.iloc](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.iloc.html)
     *
     * @param {int} startVal
     * @param {int} [endVal]
     *
     * @returns {Series|number|string}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
     * ds.iloc(1)      // 2
     * ds.iloc(1, 3)   // Series([2, 3], {name: 'New Series', index: [1, 2]})
     */

  }, {
    key: 'iloc',
    value: function iloc(startVal, endVal) {
      if (typeof endVal === 'undefined') return this.values.get(startVal);

      var name = this.kwargs.name;

      var index = this.index.slice(startVal, endVal);

      return new Series(this.values.slice(startVal, endVal), { name: name, index: index });
    }

    /**
     * Return the sum of the values in the `Series`
     *
     * pandas equivalent: [Series.sum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sum.html)
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
     *
     * // Returns 10
     * ds.sum();
     */

  }, {
    key: 'sum',
    value: function sum() {
      return (0, _utils.sum)(this.values);
    }

    /**
     * Return the mean of the values in the `Series`
     *
     * pandas equivalent: [Series.mean](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.mean.html)
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
     *
     * // Returns 2.5
     * ds.mean();
     */

  }, {
    key: 'mean',
    value: function mean() {
      return this.sum() / this.length;
    }

    /**
     * Return the median of the values in the `Series`
     *
     * pandas equivalent: [Series.median](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.median.html)
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([2, 3, 1, 4, 5], {name: 'New Series'})
     *
     * // Returns 3
     * ds.median();
     */

  }, {
    key: 'median',
    value: function median() {
      var sortedVals = this.values.sort();

      if (this.length % 2 === 1) return sortedVals.get(Math.floor(this.length / 2));

      var halfLength = this.length / 2;
      return (sortedVals.get(halfLength - 1) + sortedVals.get(halfLength)) / 2;
    }

    /**
     * Return the variance of the values in the `Series`
     *
     * pandas equivalent: [Series.var](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.var.html)
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * // Returns 1
     * ds.variance();
     */

  }, {
    key: 'variance',
    value: function variance() {
      var _this3 = this;

      var mean = this.mean();

      return this.values.reduce(function (s, v) {
        var diff = v - mean;
        return s + diff * diff / (_this3.length - 1);
      }, 0);
    }

    /**
     * Return the standard deviation of the values in the `Series`
     *
     * pandas equivalent: [Series.std](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.std.html)
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * // Returns 1
     * ds.std();
     */

  }, {
    key: 'std',
    value: function std() {
      return Math.sqrt(this.variance());
    }

    /**
     * Return Series with absolute value of all values
     *
     * pandas equivalent: [Series.abs](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.abs.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([-1, 2, -4, 5, -1, -2]);
     *
     * // Returns Series([1, 2, 4, 5, 1, 2]);
     * ds.abs();
     */

  }, {
    key: 'abs',
    value: function abs() {
      if (['bool', 'string', 'object'].indexOf(this.dtype.dtype) >= 0) return this.copy();

      return new Series(this.values.map(function (v) {
        return Math.abs(v);
      }), { name: this.name, index: this.index });
    }
  }, {
    key: '_combineOp',
    value: function _combineOp(other, op) {
      var opName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      if (typeof other === 'number') return this.map(function (val) {
        return op(val, other);
      });else if (other instanceof Series) return this.map(function (val, idx) {
        return op(val, other.iloc(idx));
      });else if (Array.isArray(other)) return this.map(function (val, idx) {
        return op(val, other[idx]);
      });else if (other instanceof _immutable2.default.List) return this.map(function (val, idx) {
        return op(val, other.get(idx));
      });

      throw new Error(opName + ' only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Add another Iterable, `Series`, or number to the `Series`
     *
     * pandas equivalent: [Series.add](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.add.html)
     *
     * @param {Iterable|Series|number} other
     *  Value to add to the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     * ds.add(5)                           // Series([6, 7, 8], {name: 'New Series'})
     * ds.add(new Series([2, 3, 4]))       // Series([3, 5, 7], {name: 'New Series'})
     * ds.add([2, 3, 4])                   // Series([3, 5, 7], {name: 'New Series'})
     * ds.add(Immutable.List([2, 3, 4]))   // Series([3, 5, 7], {name: 'New Series'})
     */

  }, {
    key: 'add',
    value: function add(other) {
      return this._combineOp(other, function (a, b) {
        return a + b;
      }, 'add');
    }

    /**
     * Subtract another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.sub](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sub.html)
     *
     * @param {Iterable|Series|number} other
     *  Value to subtract from the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * ds.sub(5)                           // Series([-4, -3, -2], {name: 'New Series'})
     * ds.sub(new Series([2, 3, 4]))       // Series([-1, -1, -1], {name: 'New Series'})
     * ds.sub([2, 3, 4])                   // Series([-1, -1, -1], {name: 'New Series'})
     * ds.sub(Immutable.List([2, 3, 4]))   // Series([-1, -1, -1], {name: 'New Series'})
     */

  }, {
    key: 'sub',
    value: function sub(other) {
      return this._combineOp(other, function (a, b) {
        return a - b;
      }, 'sub');
    }

    /**
     * Multiply by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.mul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.mul.html)
     *
     * @param {Iterable|Series|number} other
     *  Value to multiply by the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * ds.mul(5)                           // Series([5, 10, 15], {name: 'New Series'})
     * ds.mul(new Series([2, 3, 4]))       // Series([2, 6, 12], {name: 'New Series'})
     * ds.mul([2, 3, 4])                   // Series([2, 6, 12], {name: 'New Series'})
     * ds.mul(Immutable.List([2, 3, 4]))   // Series([2, 6, 12], {name: 'New Series'})
     */

  }, {
    key: 'mul',
    value: function mul(other) {
      return this._combineOp(other, function (a, b) {
        return a * b;
      });
    }

    /**
     * Multiply by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.multiply](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.multiply.html)
     *
     * @param {Iterable|Series|number} other
     *  Value to multiply by the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * ds.multiply(5)                           // Series([5, 10, 15], {name: 'New Series'})
     * ds.multiply(new Series([2, 3, 4]))       // Series([2, 6, 12], {name: 'New Series'})
     * ds.multiply([2, 3, 4])                   // Series([2, 6, 12], {name: 'New Series'})
     * ds.multiply(Immutable.List([2, 3, 4]))   // Series([2, 6, 12], {name: 'New Series'})
     */

  }, {
    key: 'multiply',
    value: function multiply(other) {
      return this.mul(other);
    }

    /**
     * Divide by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.div](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.div.html)
     *
     * @param {Iterable|Series|number} other
     *  Value by which to divide the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * ds.div(5)                           // Series([0.2, 0.4, 0.6], {name: 'New Series'})
     * ds.div(new Series([4, 2, 1]))       // Series([0.25, 1, 3], {name: 'New Series'})
     * ds.div([4, 2, 1])                   // Series([0.25, 1, 3], {name: 'New Series'})
     * ds.div(Immutable.List([4, 2, 1]))   // Series([0.25, 1, 3], {name: 'New Series'})
     */

  }, {
    key: 'div',
    value: function div(other) {
      return this._combineOp(other, function (a, b) {
        return a / b;
      }, 'div');
    }

    /**
     * Divide by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.divide](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.divide.html)
     *
     * @param {Iterable|Series|number} other
     *  Value by which to divide the `Series`
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'New Series'})
     *
     * ds.divide(5)                           // Series([0.2, 0.4, 0.6], {name: 'New Series'})
     * ds.divide(new Series([4, 2, 1]))       // Series([0.25, 1, 3], {name: 'New Series'})
     * ds.divide([4, 2, 1])                   // Series([0.25, 1, 3], {name: 'New Series'})
     * ds.divide(Immutable.List([4, 2, 1]))   // Series([0.25, 1, 3], {name: 'New Series'})
     */

  }, {
    key: 'divide',
    value: function divide(other) {
      return this.div(other);
    }

    /**
     * Calculate the covariance between this `Series` and another `Series` or iterable
     *
     * pandas equivalent: [Series.cov](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cov.html)
     *
     * @param {Series} ds
     *    Series with which to calculate covariance
     *
     * @returns {number}
     *
     * @example
     * const ds1 = new Series([1, 2, 3, 4, 5]);
     * const ds2 = new Series([2, 4, 6, 8, 10]);
     *
     * // Returns 5
     * ds1.cov(ds2);
     *
     * // Also returns 5
     * ds2.cov(ds1);
     */

  }, {
    key: 'cov',
    value: function cov(ds) {
      if (!(ds instanceof Series)) throw new Error('ds must be a Series');

      if (ds.length !== this.length) throw new Error('Series must be of equal length');

      var n = 0;
      var mean1 = 0;
      var mean2 = 0;
      var m12 = 0;

      this.values.forEach(function (v1, idx) {
        n += 1;
        var d1 = (v1 - mean1) / n;
        mean1 += d1;
        var d2 = (ds.values.get(idx) - mean2) / n;
        mean2 += d2;

        m12 += (n - 1) * d1 * d2 - m12 / n;
      });

      return n / (n - 1) * m12;
    }

    /**
     * Calculate the correlation between this `Series` and another `Series` or iterable
     *
     * pandas equivalent: [Series.corr](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.corr.html)
     *
     * @param {Series} ds
     *    Series with which to calculate correlation
     *
     * @returns {number}
     *
     * @example
     * const ds1 = new Series([1, 2, 3, 4, 5]);
     * const ds2 = new Series([2, 4, 6, 8, 10]);
     *
     * // Returns 1
     * ds1.corr(ds2);
     *
     * // Also returns 1
     * ds2.corr(ds1);
     */

  }, {
    key: 'corr',
    value: function corr(ds) {
      if (!(ds instanceof Series)) throw new Error('ds must be a Series');

      if (ds.length !== this.length) throw new Error('Series must be of equal length');

      return this.cov(ds) / (this.std() * ds.std());
    }

    /**
     * Return the difference over a given number of periods
     *
     * pandas equivalent: [Series.diff](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.diff.html)
     *
     * @param {number} periods=1
     *  Number of periods to use for difference calculation
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 6, 5])
     *
     * // Returns Series([null, 1, 4, -1])
     * ds.diff();
     *
     * // Returns Series([null, null, 5, 3])
     * ds.diff(2);
     */

  }, {
    key: 'diff',
    value: function diff() {
      var _this4 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      return new Series(_immutable2.default.Repeat(null, periods).toList().concat(_immutable2.default.Range(periods, this.length).map(function (idx) {
        return _this4.values.get(idx) - _this4.values.get(idx - periods);
      }).toList()), { index: this.index, name: this.name });
    }

    /**
     * Return the percentage change over a given number of periods
     *
     * pandas equivalent: [Series.pct_change](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.pct_change.html)
     *
     * @param {number} periods=1
     *  Number of periods to use for percentage change calculation
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4, 5], {name: 'New Series'})
     *
     * ds.pct_change(1)    // Series([null, 1, 0.5, 0.333, 0.25], {name: 'New Series'})
     * ds.pct_change(2)    // Series([null, null, 2, 1, 0.66666], {name: 'New Series'})
     */

  }, {
    key: 'pct_change',
    value: function pct_change() {
      var _this5 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      return new Series(_immutable2.default.Repeat(null, periods).toList().concat(_immutable2.default.Range(periods, this.length).map(function (idx) {
        return _this5.values.get(idx) / _this5.values.get(idx - periods) - 1;
      }).toList()), { index: this.index, name: this.name });
    }
  }, {
    key: '_sort_ascending',
    value: function _sort_ascending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      // $FlowFixMe
      if (valA < valB) return -1;
      // $FlowFixMe
      else if (valA > valB) return 1;
      return 0;
    }
  }, {
    key: '_sort_descending',
    value: function _sort_descending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      // $FlowFixMe
      if (valA > valB) return -1;
      // $FlowFixMe
      else if (valA < valB) return 1;
      return 0;
    }

    /**
     * Return a sorted `Series` in either ascending or descending order
     *
     * pandas equivalent: [Series.sort_values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sort_values.html)
     *
     * @param {boolean} ascending
     *    Sort in ascending (true) or descending (false) order
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([2, 1, 0, 3], {name: 'New Series', index: [0, 1, 2, 3]})
     *
     * ds.sort_values(true)    // Series([0, 1, 2, 3], {name: 'New Series', index: [2, 1, 0, 3]})
     * ds.sort_values(false)   // Series([3, 2, 1, 0], {name: 'New Series', index: [3, 0, 1, 2]})
     */

  }, {
    key: 'sort_values',
    value: function sort_values() {
      var _this6 = this;

      var ascending = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var sortedIndex = ascending ? this.index.sort(this._sort_ascending) : this.index.sort(this._sort_descending);

      return new Series(sortedIndex.map(function (i) {
        return _this6.iloc(i);
      }), { name: this.name, index: sortedIndex });
    }

    /**
     * Return a `Series` with all values rounded to the nearest precision specified by decimals
     *
     * pandas equivalent: [Series.round](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.round.html)
     *
     * @param {number} decimals=0
     *  Number of decimals to round to
     *
     * @example
     * const ds = new Series([1.25, 1.47, 1.321])
     *
     * // Returns Series([1.3, 1.5, 1.3])
     * ds.round(1);
     */

  }, {
    key: 'round',
    value: function round() {
      var decimals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return new Series(this.values.map(function (v) {
        return (0, _utils.round10)(v, -1 * decimals);
      }));
    }

    // Filtering methods

  }, {
    key: '_alignSeries',
    value: function _alignSeries(series) {
      var _this7 = this;

      // Align two series by index values, returning a Map with index values as keys and
      // values as Maps with 1: List [value locations at index], 2: [value locations at index]

      var seriesAlignment = _immutable2.default.Map({});

      this.index.forEach(function (idx1) {
        if (!seriesAlignment.has(idx1)) {
          seriesAlignment = seriesAlignment.set(idx1, _immutable2.default.Map({
            first: _immutable2.default.List.of(_this7.iloc(idx1)),
            second: _immutable2.default.List([])
          }));
        } else {
          seriesAlignment = seriesAlignment.updateIn([idx1, 'first'], function (l) {
            return l.concat(_this7.iloc(idx1));
          });
        }
      });

      series.index.forEach(function (idx2) {
        if (!seriesAlignment.has(idx2)) {
          seriesAlignment = seriesAlignment.set(idx2, _immutable2.default.Map({
            first: _immutable2.default.List([]),
            second: _immutable2.default.List.of(series.iloc(idx2))
          }));
        } else {
          seriesAlignment = seriesAlignment.updateIn([idx2, 'second'], function (l) {
            return l.concat(series.iloc(idx2));
          });
        }
      });

      return seriesAlignment;
    }

    /**
     * Flexible comparison of an iterable or value to the `Series`. Returns a `Series` of booleans of
     * equivalent length
     *
     * pandas equivalent: [Series.where](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.where.html)
     *
     * @param {Series|Array|List|string|number} other
     *  Iterable or value compared to Series
     * @param {function} op
     *  Function which takes (a, b) values and returns a boolean
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([true, false, false])
     * ds.where(1, (v1, v2) => v1 === 1);
     *
     * // Returns Series([false, true, true])
     * ds.where(new Series([0, 2, 3]), (v1, v2) => v1 === v2);
     */

  }, {
    key: 'where',
    value: function where(other, op) {
      var name = this.name;
      var index = this.index;
      var kwargs = { name: name, index: index };

      if (!Array.isArray(other) && !(other instanceof _immutable2.default.List) && !(other instanceof Series)) return new Series(this.values.map(function (v) {
        return op(v, other);
      }), kwargs);

      if (Array.isArray(other)) {
        if (other.length !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other[idx]);
        }), kwargs);
      } else if (other instanceof _immutable2.default.List) {
        if (other.size !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other.get(idx));
        }), kwargs);
      } else if (other instanceof Series) {
        if (other.length !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other.iloc(idx));
        }), kwargs);
      }

      throw new Error('Must be scalar value, Array, Series, or Immutable.List');
    }

    /**
     * Equal to of `Series` and other, element wise
     *
     * pandas equivalent: Series == val
     *
     * @param {Series|Array|List|number|string} other
     *    Other `Series` or scalar value to check for equality
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([true, false, false])
     * ds.eq(1);
     *
     * // Returns Series([false, true, true])
     * ds.eq(new Series([0, 2, 3]));
     *
     * // Returns Series([false, true, true])
     * ds.eq(Immutable.List([0, 2, 3]));
     *
     * // Returns Series([false, true, true])
     * ds.eq([0, 2, 3]);
     */

  }, {
    key: 'eq',
    value: function eq(other) {
      return this.where(other, function (a, b) {
        return a === b;
      });
    }

    /**
     * Less than of `Series` and other, element wise
     *
     * pandas equivalent: Series < val
     *
     * @param {Series|Array|List|number|string} other
     *    Other `Series` or scalar value to check for less than
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([false, false, false])
     * ds.lt(1);
     *
     * // Returns Series([false, false, true])
     * ds.lt(new Series([0, 2, 4]));
     *
     * // Returns Series([false, false, true])
     * ds.lt(Immutable.List([0, 2, 5]));
     *
     * // Returns Series([false, false, true])
     * ds.lt([0, 2, 5]);
     */

  }, {
    key: 'lt',
    value: function lt(other) {
      return this.where(other, function (a, b) {
        return a < b;
      });
    }

    /**
     * Less than or equal to of `Series` and other, element wise
     *
     * pandas equivalent: Series <= val
     *
     * @param {Series|Array|List|number|string} other
     *    Other `Series` or scalar value to check for less than or equal to
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([false, false, false])
     * ds.lte(1);
     *
     * // Returns Series([false, false, true])
     * ds.lte(new Series([0, 2, 4]));
     *
     * // Returns Series([false, false, true])
     * ds.lte(Immutable.List([0, 2, 5]));
     *
     * // Returns Series([false, false, true])
     * ds.lte([0, 2, 5]);
     */

  }, {
    key: 'lte',
    value: function lte(other) {
      return this.where(other, function (a, b) {
        return a <= b;
      });
    }

    /**
     * Greater than of `Series` and other, element wise
     *
     * pandas equivalent: Series > val
     *
     * @param {Series|Array|List|number|string} other
     *    Other `Series` or scalar value to check for greater than
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([false, true, true])
     * ds.gt(1);
     *
     * // Returns Series([true, false, false])
     * ds.gt(new Series([0, 2, 3]));
     *
     * // Returns Series([true, false, false])
     * ds.gt(Immutable.List([0, 2, 3]));
     *
     * // Returns Series([true, false, false])
     * ds.gt([0, 2, 3]);
     */

  }, {
    key: 'gt',
    value: function gt(other) {
      return this.where(other, function (a, b) {
        return a > b;
      });
    }

    /**
     * Greater than or equal to of `Series` and other, element wise
     *
     * pandas equivalent: Series >= val
     *
     * @param {Series|Array|List|number|string} other
     *    Other `Series` or scalar value to check for greater than or equal to
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'})
     *
     * // Returns Series([true, true, true])
     * ds.gte(1);
     *
     * // Returns Series([true, true, false])
     * ds.gte(new Series([0, 2, 4]));
     *
     * // Returns Series([true, true, false])
     * ds.gte(Immutable.List([0, 2, 4]));
     *
     * // Returns Series([true, true, false])
     * ds.gte([0, 2, 4]);
     */

  }, {
    key: 'gte',
    value: function gte(other) {
      return this.where(other, function (a, b) {
        return a >= b;
      });
    }

    /**
     * Returns a boolean same-sized Series indicating if the values are not null
     *
     * pandas equivalent: [Series.notnull](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.notnull.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, null, null, 4]);
     *
     * // Returns Series([true, true, false, false, true])
     * ds.notnull();
     */

  }, {
    key: 'notnull',
    value: function notnull() {
      return this.where(null, function (a, b) {
        return a !== b;
      });
    }

    /**
     * Shift index by desired number of periods
     *
     * pandas equivalent:s [Series.shift](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.shift.html)
     *
     * @param {number} periods
     *  Number of periods to move, can be positive or negative
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3, 4]);
     *
     * // Returns Series([null, 1, 2, 3]);
     * ds.shift(1);
     *
     * // Returns Series([null, null, 1, 2]);
     * ds.shift(2);
     *
     * // Returns Series([3, 4, null, null]);
     * ds.shift(-2);
     */

  }, {
    key: 'shift',
    value: function shift() {
      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (!Number.isInteger(periods)) throw new Error('periods must be an integer');

      if (periods === 0) {
        return this.copy();
      } else if (periods < 0) {
        var absPeriods = Math.abs(periods);

        if (absPeriods > this.length) throw new Error('Periods greater than length of Series');

        var _values = this.values.slice(absPeriods, this.length).concat(_immutable2.default.Repeat(null, absPeriods).toList());

        return new Series(_values, { name: this.name, index: this.index });
      }

      // periods > 0
      if (periods > this.length) throw new Error('Periods greater than length of Series');

      var values = _immutable2.default.Repeat(null, periods).toList().concat(this.values.slice(0, this.length - periods));

      return new Series(values, { name: this.name, index: this.index });
    }

    /**
     * Returns `Immutable.List` of unique values in the `Series`. Preserves order of the original
     *
     * pandas equivalent: [Series.unique](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.unique.html)
     *
     * @returns {List}
     *
     * @example
     * const ds = new Series(['foo', 'bar', 'bar', 'foo', 'foo', 'test', 'bar', 'hi']);
     * // Returns ['foo', 'bar', 'test', 'hi']
     * ds.unique();
     */

  }, {
    key: 'unique',
    value: function unique() {
      return this.values.toSet().toList();
    }

    /**
     * Filter the Series by an Iterable (Series, Array, or List) of booleans and return the subset
     *
     * pandas equivalent: series[series condition]
     *
     * @param {Series|Array|List} iterBool
     *    Iterable of booleans
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3]);
     *
     * // Returns Series([2, 3]);
     * ds.filter(ds.gte(2));
     */

  }, {
    key: 'filter',
    value: function filter(iterBool) {
      var _this8 = this;

      if (!Array.isArray(iterBool) && !(iterBool instanceof _immutable2.default.List) && !(iterBool instanceof Series)) throw new Error('filter must be an Array, List, or Series');

      var valueIndexMap = { values: [], index: [] };
      if (iterBool instanceof Series) iterBool.values.forEach(function (v, idx) {
        if (v === true) {
          valueIndexMap.values.push(_this8.values.get(idx));
          valueIndexMap.index.push(_this8.index.get(idx));
        }
      });else {
        iterBool.forEach(function (v, idx) {
          if (v === true) {
            valueIndexMap.values.push(_this8.values.get(idx));
            valueIndexMap.index.push(_this8.index.get(idx));
          }
        });
      }

      return new Series(valueIndexMap.values, { name: this.name, index: valueIndexMap.index });
    }
  }, {
    key: '_cumulativeHelper',
    value: function _cumulativeHelper() {
      var operation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _utils.OP_CUMSUM;

      return new Series((0, _utils.generateCumulativeFunc)(operation)(this.values), this.kwargs);
    }

    /**
     * Return cumulative sum over requested axis
     *
     * pandas equivalent: [Series.cumsum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cumsum.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
     *
     * // Returns Series([1, 3, 6], {index: [2, 3, 4]});
     * ds.cumsum();
     */

  }, {
    key: 'cumsum',
    value: function cumsum() {
      return this._cumulativeHelper(_utils.OP_CUMSUM);
    }

    /**
     * Return cumulative mul over requested axis
     *
     * pandas equivalent: [Series.cummul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummul.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
     *
     * // Returns Series([1, 2, 6], {index: [2, 3, 4]});
     * ds.cummul();
     */

  }, {
    key: 'cummul',
    value: function cummul() {
      return this._cumulativeHelper(_utils.OP_CUMMUL);
    }

    /**
     * Return cumulative max over requested axis
     *
     * pandas equivalent: [Series.cummax](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummax.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([3, 2, 4], {index: [2, 3, 4]});
     *
     * // Returns Series([3, 3, 4], {index: [2, 3, 4]});
     * ds.cummax();
     */

  }, {
    key: 'cummax',
    value: function cummax() {
      return this._cumulativeHelper(_utils.OP_CUMMAX);
    }

    /**
     * Return cumulative min over requested axis
     *
     * pandas equivalent: [Series.cummin](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummin.html)
     *
     * @returns {Series}
     *
     * @example
     * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
     *
     * // Returns Series([1, 1, 1], {index: [2, 3, 4]});
     * ds.cummin();
     */

  }, {
    key: 'cummin',
    value: function cummin() {
      return this._cumulativeHelper(_utils.OP_CUMMIN);
    }

    /**
     * Convert the Series to a json object
     *
     * pandas equivalent: [Series.to_json](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.to_json.html)
     *
     * @param kwargs
     * @param {string} [kwargs.orient=columns] orientation of JSON
     *
     * @returns {*}
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'x'});
     *
     * // Returns {0: 1, 1: 2, 2: 3}
     * ds.to_json();
     *
     * // Returns [1, 2, 3]
     * ds.to_json({orient: 'records'});
     *
     * // Returns {index: [0, 1, 2], name: 'x', values: [1, 2, 3]}
     * ds.to_json({orient: 'split'});
     */

  }, {
    key: 'to_json',
    value: function to_json() {
      var _this9 = this;

      var kwargs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { orient: 'index' };

      var ALLOWED_ORIENT = ['records', 'split', 'index'];
      var orient = 'index';

      if (typeof kwargs.orient !== 'undefined') {
        if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0) // $FlowFixMe TODO
          throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
        orient = kwargs.orient;
      }

      var json = void 0;
      switch (orient) {
        case 'records':
          return this.values.toArray();
        case 'split':
          return { index: this.index.toArray(), name: this.name, values: this.values.toJS() };
        case 'index':
          json = {};
          this.values.forEach(function (v, idx) {
            json[_this9.index.get(idx)] = v;
          });
          return json;
        default:
          // $FlowFixMe TODO
          throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
      }
    }

    /**
     * Rename the `Series` and return a new `Series`
     *
     * pandas equivalent: [Series.rename](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.rename.html)
     *
     * @param {string} name
     *
     * @example
     * const ds = new Series([1, 2, 3], {name: 'Test name'});
     * ds.rename('New test name');
     * // returns 'New test name'
     * ds.name;
     */

  }, {
    key: 'rename',
    value: function rename(name) {
      return new Series(this._values, { name: name, index: this.index });
    }

    /**
     * Append another Series to this and return a new Series
     *
     * pandas equivalent: [Series.append](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.append.html)
     *
     * @param {Series} other
     * @param {boolean} ignore_index
     * @returns {Series}
     *
     * @example
     * const ds1 = new Series([1, 2, 3], {index: [1, 2, 3]});
     * const ds2 = new Series([2, 3, 4], {index: [3, 4, 5]});
     *
     * // Returns Series([1, 2, 3, 2, 3, 4], {index: [1, 2, 3, 3, 4, 5]});
     * ds1.append(ds2);
     *
     * // Returns Series([1, 2, 3, 2, 3, 4], {index: [0, 1, 2, 3, 4, 5]});
     * ds1.append(ds2, true);
     */

  }, {
    key: 'append',
    value: function append(other) {
      var ignore_index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      // eslint-disable-next-line
      return _concatSeries( // $FlowFixMe
      [this, other], { ignore_index: ignore_index });
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return {
        name: this.name,
        index: this.index
      };
    }

    /**
     * Return the dtype of the underlying data
     *
     * pandas equivalent [Series.dtype](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.dtype.html)
     *
     * @returns {DType}
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     * ds.dtype;    // dtype('float');
      */

  }, {
    key: 'dtype',
    get: function get() {
      return this._dtype;
    }

    /**
     * Return the index of the `Series`, an `Immutable.List`
     *
     * @returns {List}
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     *
     * // Returns List [0, 1, 2]
     * ds.index;
     */

  }, {
    key: 'index',
    get: function get() {
      return this._get_axis(0);
    }

    /**
     * Set the index of the `Series`, an `Immutable.List`
     *
     * @param {List|Array} index
     *    The next values for the index of the `Series`
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     * ds.index = [1, 2, 3];
     *
     * // Returns List [1, 2, 3]
     * ds.index;
     */
    ,
    set: function set(index) {
      this.set_axis(0, (0, _utils.parseIndex)(index, this.values));
    }

    /**
     * Return the length of the `Series`
     *
     * pandas equivalent: len(series);
     *
     * @returns {number}
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     *
     * // Returns 3
     * ds.length;
     */

  }, {
    key: 'length',
    get: function get() {
      return this.values.size;
    }

    /**
     * Return the values of the `Series` as an `Immutable.List`
     *
     * pandas equivalent: [Series.values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.values.html);
     *
     * @returns {List}
     *
     * @example
     * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
     *
     * // Returns List [1.5, 2, 3]
     * ds.values;
     */

  }, {
    key: 'values',
    get: function get() {
      return (0, _get3.default)(Series.prototype.__proto__ || Object.getPrototypeOf(Series.prototype), 'values', this);
    }

    /**
     * Return the name of the `Series`
     *
     * @returns {string}
     */

  }, {
    key: 'name',
    get: function get() {
      return this._name;
    }
  }]);
  return Series;
}(_generic2.default);

exports.default = Series;

var _concatSeriesValues = function _concatSeriesValues(objs) {
  var _Immutable$List;

  return (_Immutable$List = _immutable2.default.List([])).concat.apply(_Immutable$List, (0, _toConsumableArray3.default)(objs.map(function (series) {
    return series.values;
  })));
};
var _concatSeriesIndices = function _concatSeriesIndices(objs) {
  var _Immutable$List2;

  return (_Immutable$List2 = _immutable2.default.List([])).concat.apply(_Immutable$List2, (0, _toConsumableArray3.default)(objs.map(function (series) {
    return series.index;
  })));
};

var _concatSeries = exports._concatSeries = function _concatSeries(objs, kwargs) {
  if (objs instanceof _immutable2.default.List && objs.filter(function (series) {
    return series instanceof Series;
  }).size !== objs.size) throw new Error('Objects must all be Series');else if (Array.isArray(objs) && objs.filter(function (series) {
    return series instanceof Series;
  }).length !== objs.length) throw new Error('Objects must all be Series');

  if (!kwargs.ignore_index) return new Series(_concatSeriesValues(objs), { index: _concatSeriesIndices(objs) });else if (kwargs.ignore_index) {
    return new Series(_concatSeriesValues(objs), { index: _immutable2.default.Range(0, objs.reduce(function (a, b) {
        return a + b.length;
      }, 0)).toList() });
  }

  throw new Error('Not supported');
};

//# sourceMappingURL=series.js.map