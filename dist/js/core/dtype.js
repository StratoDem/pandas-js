'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var int = 'int';
var float = 'float';
var object = 'object';

var ALLOWED_DTYPES = [int, float, object];

var DType = exports.DType = function () {
  function DType(name) {
    _classCallCheck(this, DType);

    if (ALLOWED_DTYPES.indexOf(name) < 0) throw new Error('dtype ' + name + ' not allowed');

    this._name = name;
  }

  _createClass(DType, [{
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

  if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object') {
    arrayDType = object;
  } else if (typeof el === 'string') {
    arrayDType = object;
  } else if (!Number.isInteger(el)) {
    arrayDType = float;
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

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var el = _step.value;

      arrayDType = elementToDType(el);

      if (arrayDType.dtype !== int && arrayDType.dtype !== float) break;
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