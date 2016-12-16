'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _utils = require('./utils.es6');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Series = function () {
  /**
   * One dimensional array with axis labels
   *
   * Operations between Series (+, -, /, *, **) align values based on their associated index values
   *
   * @param {Array|Object} data
   *    Data to be stored in Series
   * @param {Array|Object} index
   *    Values must be unique, with the same length as _immutable
   * @param {string} name
   *    Name of the pandas.Series
   */
  function Series() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    _classCallCheck(this, Series);

    if (Array.isArray(data)) {
      this._immutable = _immutable2.default.List(data);
    }

    this.dtype = name;
  }

  _createClass(Series, [{
    key: Symbol.iterator,
    value: function value() {
      var immutable = this._immutable;
      var index = -1;

      return {
        next: function next() {
          index += 1;
          return { value: immutable.get(index), done: !(index >= 0 && index < immutable.size) };
        }
      };
    }
  }, {
    key: 'sum',
    value: function sum() {
      return (0, _utils.sum)(this._immutable);
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
      this._immutable.forEach(function (v) {
        var diff = v - mean;
        meanSqDiff += diff * diff / _this.length;
      });

      return Math.sqrt(meanSqDiff);
    }

    /**
     * Add another Iterable, Series, or number to the Series
     * @param {Iterable|Series|number} val
     */

  }, {
    key: 'plus',
    value: function plus(val) {
      if (typeof val === 'number') return this._immutable.map(function (v) {
        return v + val;
      });else if (val instanceof Series) return this._immutable.map(function (v, idx) {
        return v + val.values[idx];
      });else if (Array.isArray(val)) return this._immutable.map(function (v, idx) {
        return v + val[idx];
      });

      throw new Error('plus only supports numbers, Arrays and pandas.Series');
    }
  }, {
    key: 'length',
    get: function get() {
      return this._immutable.size;
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
      return this._immutable;
    }
  }]);

  return Series;
}();

exports.default = Series;
