'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NDFrame = function () {
  function NDFrame(data) {
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, NDFrame);

    this._data = data;

    this._axes = {};
    this._AXIS_ORDERS = null;
    this._values = null;
  }

  (0, _createClass3.default)(NDFrame, [{
    key: 'set_axis',
    value: function set_axis(axis, labels) {
      this._axes[axis] = labels;
    }
  }, {
    key: '_setup_axes',
    value: function _setup_axes(axes) {
      this._AXIS_ORDERS = axes;
      this._AXIS_LEN = axes.size;
    }
  }, {
    key: '_get_axis',
    value: function _get_axis(axis) {
      return this._axes[axis];
    }
  }, {
    key: 'shape',
    get: function get() {
      var _this = this;

      return _immutable2.default.Seq(this._AXIS_ORDERS.map(function (axis) {
        return _this._get_axis(axis).size;
      }));
    }
  }, {
    key: 'values',
    get: function get() {
      return this._values;
    }
  }]);
  return NDFrame;
}();

exports.default = NDFrame;