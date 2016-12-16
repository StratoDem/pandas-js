'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Series = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _utils = require('./utils');

var _dtype = require('./dtype');

var dtype = _interopRequireWildcard(_dtype);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Series = exports.Series = function () {
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
      this._dtype = dtype.arrayToDType(data);
    } else if (data instanceof _immutable2.default.List) {
      this._data = data;
      this._dtype = dtype.arrayToDType(data);
    } else {
      this._data = _immutable2.default.List.of(data);
    }

    this._name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';
    this._index = kwargs.index;
  }

  _createClass(Series, [{
    key: Symbol.iterator,
    value: function value() {
      var values = this._data;
      var index = -1;

      return {
        next: function next() {
          index += 1;
          return { value: values.get(index), done: !(index >= 0 && index < values.size) };
        }
      };
    }
  }, {
    key: 'astype',


    /**
     * Convert the series to the desired type
     *
     * @param {DType} nextType
     */
    value: function astype(nextType) {
      if (!(nextType instanceof dtype.DType)) throw new Error('Next type must be a DType');

      if (nextType.dtype === this.dtype) return this;

      switch (nextType.dtype) {
        case 'int':
          if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to int');
          var kwargs = { name: this.name, index: this.index };
          return new Series(this.values.map(function (v) {
            return Math.floor(v);
          }), kwargs);
        case 'float':
          if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to float');
          this._dtype = new dtype.DType('float');
          return this;
        default:
          throw new Error('Invalid dtype ' + nextType);
      }
    }
  }, {
    key: 'sum',
    value: function sum() {
      return (0, _utils.sum)(this._data);
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
      this._data.forEach(function (v) {
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
      if (typeof val === 'number') return new Series(this._data.map(function (v) {
        return v + val;
      }));else if (val instanceof Series) return new Series(this._data.map(function (v, idx) {
        return v + val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this._data.map(function (v, idx) {
        return v + val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this._data.map(function (v, idx) {
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
      if (typeof val === 'number') return new Series(this._data.map(function (v) {
        return v - val;
      }));else if (val instanceof Series) return new Series(this._data.map(function (v, idx) {
        return v - val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this._data.map(function (v, idx) {
        return v - val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this._data.map(function (v, idx) {
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
      if (typeof val === 'number') return new Series(this._data.map(function (v) {
        return v * val;
      }));else if (val instanceof Series) return new Series(this._data.map(function (v, idx) {
        return v * val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this._data.map(function (v, idx) {
        return v * val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this._data.map(function (v, idx) {
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
      if (typeof val === 'number') return new Series(this._data.map(function (v) {
        return v / val;
      }));else if (val instanceof Series) return new Series(this._data.map(function (v, idx) {
        return v / val.values.get(idx);
      }));else if (Array.isArray(val)) return new Series(this._data.map(function (v, idx) {
        return v / val[idx];
      }));else if (val instanceof _immutable2.default.List) return new Series(this._data.map(function (v, idx) {
        return v / val.get(idx);
      }));

      throw new Error('minus only supports numbers, Arrays, Immutable List and pandas.Series');
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
    key: 'name',
    get: function get() {
      return this._name;
    }
  }, {
    key: 'length',
    get: function get() {
      return this._data.size;
    }
  }, {
    key: 'loc',
    get: function get() {
      throw 'loc not implemented!';
    }
  }, {
    key: 'iloc',
    get: function get() {
      throw 'iloc not implemented!';
    }
  }, {
    key: 'values',
    get: function get() {
      return this._data;
    }
  }]);

  return Series;
}();