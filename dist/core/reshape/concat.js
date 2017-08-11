'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _frame = require('../frame');

var _frame2 = _interopRequireDefault(_frame);

var _series = require('../series');

var _series2 = _interopRequireDefault(_series);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var concat = function concat(objs) {
  var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { ignore_index: false, axis: 0 };

  if (Array.isArray(objs) && objs[0] instanceof _series2.default || objs instanceof _immutable2.default.List && objs.get(0) instanceof _series2.default) return (0, _series._concatSeries)(objs, { ignore_index: kwargs.ignore_index });else if (Array.isArray(objs) && objs[0] instanceof _frame2.default || objs instanceof _immutable2.default.List && objs.get(0) instanceof _frame2.default) return (0, _frame._concatDataFrame)(objs, { ignore_index: kwargs.ignore_index, axis: kwargs.axis });
  throw new Error('Not supported');
};

exports.default = concat;