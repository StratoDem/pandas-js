'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.to_datetime = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _index = require('../core/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Series|DataFrame|List|Array|string} arg
 */
var to_datetime = exports.to_datetime = function to_datetime(arg) {
  if (arg instanceof _index.Series) {
    return new _index.Series(arg.values.map(function (v) {
      return to_datetime(v);
    }), arg.kwargs);
  } else if (arg instanceof _index.DataFrame) {
    return new _index.DataFrame(_immutable2.default.Map(arg.columns.map(function (c) {
      return [c, to_datetime(arg.get(c))];
    })), arg.kwargs);
  } else if (arg instanceof _immutable2.default.List || Array.isArray(arg)) {
    return arg.map(function (v) {
      return to_datetime(v);
    });
  } else if (typeof arg === 'string') {
    return new Date(arg);
  }
  throw new Error('Must be Series, DataFrame, List or Array');
};

//# sourceMappingURL=tools.js.map