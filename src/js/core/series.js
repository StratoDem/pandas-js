'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A pandas.Series one-dimensional array with axis labels, with an Immutable.List instead of
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * numpy.ndarray as the values
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _utils = require('./utils');

var _dtype = require('./dtype');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Series = function () {
  /**
   * One dimensional array with axis labels
   *
   * Operations between Series (+, -, /, *, **) align values based on their associated index values
   *
   * @param data {Array|Object}
   *    Data to be stored in Series
   * @param {Object} kwargs
   *    Extra optional arguments for a Series
   * @param {string} [kwargs.name='']
   *    The _name to assign to the Series
   * @param {Array|Object} [kwargs.index]
   */
  function Series() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Series);

    if (Array.isArray(data)) {
      this._data = _immutable2.default.List(data);
      this._dtype = (0, _dtype.arrayToDType)(data);
    } else if (data instanceof _immutable2.default.List) {
      this._data = data;
      this._dtype = (0, _dtype.arrayToDType)(data);
    } else {
      this._data = _immutable2.default.List.of(data);
    }

    this.name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';
    this._index = kwargs.index;
  }

  _createClass(Series, [{
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
  }, {
    key: 'toString',
    value: function toString() {
      var vals = this.iloc(0, 10).values;

      var valString = '';
      vals.forEach(function (v, idx) {
        valString += idx + '\t' + v + '\n';
      });

      return valString + 'Name: ' + this.name + ', dtype: ' + this.dtype;
    }
  }, {
    key: 'astype',


    /**
     * Convert the series to the desired type
     *
     * @param {DType} nextType
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
            this._dtype = new dtype.DType('float');
            return this;
          }
        default:
          throw new Error('Invalid dtype ' + nextType);
      }
    }

    /**
     * Return the Series between [startVal, endVal), or at startVal if endVal is undefined
     *
     * @param {int} startVal
     * @param {int} [endVal]
     *
     * @returns {Series}
     */

  }, {
    key: 'iloc',
    value: function iloc(startVal, endVal) {
      if (typeof endVal === 'undefined') return this.values.get(startVal);

      return new Series(this.values.slice(startVal, endVal), this.kwargs);
    }
  }, {
    key: 'sum',
    value: function sum() {
      return (0, _utils.sum)(this.values);
    }
  }, {
    key: 'mean',
    value: function mean() {
      return this.sum() / this.length;
    }
  }, {
    key: 'std',
    value: function std() {
      var _this = this;

      var mean = this.mean();

      var meanSqDiff = 0;
      this.values.forEach(function (v) {
        var diff = v - mean;
        meanSqDiff += diff * diff / _this.length;
      });

      return Math.sqrt(meanSqDiff);
    }

    /**
     * Add another Iterable, Series, or number to the Series
     * @param {Iterable|Series|number} val
     *
     * @returns {Series}
     */

  }, {
    key: 'plus',
    value: function plus(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v + val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v + val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v + val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v + val.get(idx);
      }));

      throw new Error('plus only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Subtract another Iterable, Series, or number from the Series
     *
     * @param {Iterable|Series|number} val
     *
     * @returns {Series}
     */

  }, {
    key: 'minus',
    value: function minus(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v - val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v - val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v - val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v - val.get(idx);
      }));

      throw new Error('minus only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Multiply by another Iterable, Series, or number
     *
     * @param {Iterable|Series|number} val
     *
     * @returns {Series}
     */

  }, {
    key: 'times',
    value: function times(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v * val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v * val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v * val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v * val.get(idx);
      }));

      throw new Error('plus only supports numbers, Arrays, Immutable List and pandas.Series');
    }

    /**
     * Divide by another Iterable, Series, or number
     *
     * @param {Iterable|Series|number} val
     *
     * @returns {Series}
     */

  }, {
    key: 'dividedBy',
    value: function dividedBy(val) {
      if (typeof val === 'number') return new Series(this.values.map(function (v) {
        return v / val;
      }));else if (val instanceof Series) return new Series(this.values.map(function (v, idx) {
        return v / val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this.values.map(function (v, idx) {
        return v / val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this.values.map(function (v, idx) {
        return v / val.get(idx);
      }));

      throw new Error('minus only supports numbers, Arrays, Immutable List and pandas.Series');
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return {
        name: this.name,
        index: this._index
      };
    }
  }, {
    key: 'dtype',
    get: function get() {
      return this._dtype;
    }
  }, {
    key: 'index',
    get: function get() {
      return this._index;
    }
  }, {
    key: 'length',
    get: function get() {
      return this.values.size;
    }
  }, {
    key: 'values',
    get: function get() {
      return this._data;
    }
  }]);

  return Series;
}();

exports.default = Series;
