'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _series = require('./core/series');

Object.defineProperty(exports, 'Series', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_series).default;
  }
});

var _frame = require('./core/frame');

Object.defineProperty(exports, 'DataFrame', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_frame).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }