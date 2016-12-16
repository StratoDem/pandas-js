"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataFrame =
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
function DataFrame() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, DataFrame);
};

exports.default = DataFrame;
