'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _utils = require('./utils');

var _dtype = require('./dtype');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Series = function () {
  /**
   * One dimensional array with axis labels. An `Immutable.List` serves as the numpy.ndarray for
   * values.
   *
   * Operations between `Series` (+, -, /, *, **) align values based on their associated index
   * values
   *
   * @param data {Array|List}
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
  function Series() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Series);

    if (Array.isArray(data)) {
      this._values = _immutable2.default.List(data);
      this._dtype = (0, _dtype.arrayToDType)(data);
    } else if (data instanceof _immutable2.default.List) {
      this._values = data;
      this._dtype = (0, _dtype.arrayToDType)(data);
    } else {
      this._values = _immutable2.default.List.of(data);
    }

    this.name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';

    this._index = (0, _utils.parseIndex)(kwargs.index, this.values);

    this._sort_ascending = this._sort_ascending.bind(this);
    this._sort_descending = this._sort_descending.bind(this);
  }

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
     * ds.map((val, idx) => val ** 2;
     */

  }, {
    key: 'map',
    value: function map(func) {
      var array = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _utils.enumerate)(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              val = _step$value[0],
              idx = _step$value[1];

          array.push(func(val, idx));
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

      return new Series(array);
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
      var _this = this;

      var vals = this.iloc(0, 10).values;

      var valString = '';
      vals.forEach(function (v, idx) {
        valString += _this.index.get(idx) + '\t' + v + '\n';
      });

      return valString + 'Name: ' + this.name + ', dtype: ' + this.dtype;
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
      var _this2 = this;

      var mean = this.mean();

      return this.values.reduce(function (s, v) {
        var diff = v - mean;
        return s + diff * diff / (_this2.length - 1);
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
     * Add another Iterable, `Series`, or number to the `Series`
     *
     * pandas equivalent: [Series.add](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.add.html)
     *
     * @param {Iterable|Series|number} val
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
    value: function add(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v + val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v + val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v + val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v + val.get(idx);
      }));

      throw new Error('add only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Subtract another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.sub](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sub.html)
     *
     * @param {Iterable|Series|number} val
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
    value: function sub(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v - val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v - val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v - val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v - val.get(idx);
      }));

      throw new Error('sub only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Multiply by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.mul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.mul.html)
     *
     * @param {Iterable|Series|number} val
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
    value: function mul(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v * val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v * val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v * val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v * val.get(idx);
      }));

      throw new Error('mul only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Divide by another Iterable, `Series`, or number from the `Series`
     *
     * pandas equivalent: [Series.div](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.div.html)
     *
     * @param {Iterable|Series|number} val
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
    value: function div(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v / val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v / val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v / val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v / val.get(idx);
      }));

      throw new Error('div only supports numbers, Arrays, Immutable List and pandas.Series');
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
      var _this3 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      return new Series(_immutable2.default.Repeat(null, periods).toList().concat(_immutable2.default.Range(periods, this.length).map(function (idx) {
        return _this3.values.get(idx) / _this3.values.get(idx - periods) - 1;
      }).toList()), { index: this.index, name: this.name });
    }
  }, {
    key: '_sort_ascending',
    value: function _sort_ascending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      if (valA < valB) return -1;else if (valA > valB) return 1;
      return 0;
    }
  }, {
    key: '_sort_descending',
    value: function _sort_descending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      if (valA > valB) return -1;else if (valA < valB) return 1;
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
      var _this4 = this;

      var ascending = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var sortedIndex = ascending ? this.index.sort(this._sort_ascending) : this.index.sort(this._sort_descending);

      return new Series(sortedIndex.map(function (i) {
        return _this4.iloc(i);
      }), { name: this.name, index: sortedIndex });
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return {
        name: this.name,
        index: this._index
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
      return this._index;
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
      this._index = (0, _utils.parseIndex)(index, this.values);
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
      return this._values;
    }
  }]);
  return Series;
}(); /**
      * A pandas.Series one-dimensional array with axis labels, with an Immutable.List instead of
      * numpy.ndarray as the values
      */

exports.default = Series;
