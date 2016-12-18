"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortDescendingComparator = exports.sortAscendingComparator = exports.intersectingColumns = exports.nonMergeColumns = exports.sum = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.enumerate = enumerate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [enumerate].map(_regenerator2.default.mark);

/**
 * Calculate the sum of values in an iterable
 *
 * @param {Iterable} iterable
 */
var sum = exports.sum = function sum(iterable) {
  return iterable.reduce(function (s, v) {
    return s + v;
  }, 0);
};

/**
 * enumerate an iterable
 * Inspired by: http://stackoverflow.com/a/10179849
 *
 * @param iterable
 */
function enumerate(iterable) {
  var i, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, x;

  return _regenerator2.default.wrap(function enumerate$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          i = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 4;
          _iterator = iterable[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 14;
            break;
          }

          x = _step.value;
          _context.next = 10;
          return [x, i];

        case 10:
          i += 1;

        case 11:
          _iteratorNormalCompletion = true;
          _context.next = 6;
          break;

        case 14:
          _context.next = 20;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](4);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 20:
          _context.prev = 20;
          _context.prev = 21;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 23:
          _context.prev = 23;

          if (!_didIteratorError) {
            _context.next = 26;
            break;
          }

          throw _iteratorError;

        case 26:
          return _context.finish(23);

        case 27:
          return _context.finish(20);

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, _marked[0], this, [[4, 16, 20, 28], [21,, 23, 27]]);
}

// Merge utils
/**
 * Columns in DataFrame that will not be used as merge keys
 *
 * @param {Array<string>} columns
 * @param {Array<string>} on
 * @returns {Array<string>}
 */
var nonMergeColumns = exports.nonMergeColumns = function nonMergeColumns(columns, on) {
  return columns.filter(function (k) {
    return on.indexOf(k) < 0;
  });
};

/**
 * Columns appearing in both
 *
 * @param {Array<string>} cols1
 * @param {Array<string>} cols2
 * @returns {Array<string>}
 */
var intersectingColumns = exports.intersectingColumns = function intersectingColumns(cols1, cols2) {
  return cols1.filter(function (k) {
    return cols2.indexOf(k) >= 0;
  });
};

/**
 * Compares valueA and valueB for an Immutable.List sort ascending
 * Returns 0 if valueA and valueB should not be swapped
 * Returns -1 if valueA should come before valueB
 * Returns 1 if valueA should come after valueB
 *
 * @param valueA
 * @param valueB
 * @returns {number}
 */
var sortAscendingComparator = exports.sortAscendingComparator = function sortAscendingComparator(valueA, valueB) {
  if (valueA < valueB) return -1;else if (valueA === valueB) return 0;
  return 1;
};

/**
 * Compares valueA and valueB for an Immutable.List sort descending
 * Returns 0 if valueA and valueB should not be swapped
 * Returns -1 if valueA should come before valueB
 * Returns 1 if valueA should come after valueB
 *
 * @param valueA
 * @param valueB
 * @returns {number}
 */
var sortDescendingComparator = exports.sortDescendingComparator = function sortDescendingComparator(valueA, valueB) {
  if (valueA > valueB) return -1;else if (valueA === valueB) return 0;
  return -1;
};