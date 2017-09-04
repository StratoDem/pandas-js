'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayToDType = exports.elementToDType = exports.DType = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var int = 'int';
var float = 'float';
var object = 'object';
var bool = 'bool';
var datetime = 'datetime';

var ALLOWED_DTYPES = [int, float, object, bool, datetime];

var DType = exports.DType = function () {
  function DType(name) {
    (0, _classCallCheck3.default)(this, DType);

    if (ALLOWED_DTYPES.indexOf(name) < 0) throw new Error('dtype ' + name + ' not allowed');

    this._name = name;
  }

  (0, _createClass3.default)(DType, [{
    key: 'toString',
    value: function toString() {
      return 'dtype(' + this.dtype + ')';
    }
  }, {
    key: 'dtype',
    get: function get() {
      return this._name;
    }
  }]);
  return DType;
}();

/**
 *
 * @param el
 * @returns {DType}
 */


var elementToDType = exports.elementToDType = function elementToDType(el) {
  var arrayDType = int;

  if (typeof el === 'string') {
    arrayDType = object;
  } else if (!Number.isInteger(el) && typeof el === 'number') {
    arrayDType = float;
  } else if (typeof el === 'boolean') {
    arrayDType = bool;
  } else if (el instanceof Date) {
    arrayDType = datetime;
  } else if ((typeof el === 'undefined' ? 'undefined' : (0, _typeof3.default)(el)) === 'object') {
    arrayDType = object;
  }

  return new DType(arrayDType);
};

/**
 * Returns the DType of an array
 *
 * @param array
 * @returns {DType}
 */
var arrayToDType = exports.arrayToDType = function arrayToDType(array) {
  var arrayDType = void 0;

  // eslint-disable-next-line
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var el = _step.value;

      arrayDType = elementToDType(el);

      if (arrayDType.dtype !== int && arrayDType.dtype !== float && arrayDType.dtype !== datetime) break;
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

  return arrayDType;
};

//# sourceMappingURL=dtype.js.map