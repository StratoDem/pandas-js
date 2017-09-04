'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiIndex = exports.Index = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Index = exports.Index = function () {
  function Index(indexVals) {
    (0, _classCallCheck3.default)(this, Index);

    if (Array.isArray(indexVals)) this._values = _immutable2.default.List(indexVals);else if (indexVals instanceof _immutable2.default.List) this._values = indexVals;else throw new TypeError('Index values must be Immutable.List or Array');
  }

  (0, _createClass3.default)(Index, [{
    key: 'get',
    value: function get(idx) {
      return this._values.get(idx);
    }
  }, {
    key: 'iloc',
    value: function iloc(idx) {
      return this.get(idx);
    }
  }, {
    key: 'values',
    get: function get() {
      return this._values;
    }
  }]);
  return Index;
}();

var MultiIndex = exports.MultiIndex = function () {
  function MultiIndex(indexVals) {
    (0, _classCallCheck3.default)(this, MultiIndex);

    if (indexVals instanceof _immutable2.default.OrderedMap) this._multiindex = MultiIndex._parseOrderedMap(indexVals);else if (indexVals instanceof _immutable2.default.List || Array.isArray(indexVals)) this._multiindex = MultiIndex._parseArrayList(indexVals);else throw new TypeError('index values must be OrderedMap or Iterable of Iterables');
    this._values = MultiIndex._parseMultiIndex(indexVals);
  }

  (0, _createClass3.default)(MultiIndex, [{
    key: 'get',
    value: function get(key) {
      if (!(typeof key === 'string' || typeof key === 'number')) throw new TypeError('key must be string or number');

      return this._multiindex.get(key);
    }
  }, {
    key: 'getIn',
    value: function getIn(keys) {
      if (!(Array.isArray(keys) || keys instanceof _immutable2.default.List)) throw new TypeError('keys must be Array or List');

      var idx = this._multiindex;
      keys.forEach(function (k) {
        idx = idx.get(k);
      });
      return idx;
    }
  }, {
    key: 'values',
    get: function get() {
      return this._values;
    }
  }], [{
    key: '_parseArrayList',
    value: function _parseArrayList(indexVals) {
      if (!(indexVals instanceof _immutable2.default.List || Array.isArray(indexVals))) throw new TypeError('indexVals in parser must be Iterable');

      throw new Error('Not implemented');
    }
  }, {
    key: '_parseOrderedMap',
    value: function _parseOrderedMap(indexVals) {
      if (!(indexVals instanceof _immutable2.default.OrderedMap)) throw new TypeError('indexVals in parser must be an Immutable.OrderedMap');

      return _immutable2.default.OrderedMap(indexVals.entrySeq().map(function (_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        if (v instanceof Index || v instanceof MultiIndex) return [k, v];else if (Array.isArray(v) || v instanceof _immutable2.default.List) return [k, new Index(v)];else if (v instanceof _immutable2.default.OrderedMap) return [k, new MultiIndex(v)];

        throw new Error('Invalid value');
      }));
    }
  }, {
    key: '_parseMultiIndex',
    value: function _parseMultiIndex(multiindex) {
      if (!(multiindex instanceof _immutable2.default.OrderedMap)) throw new TypeError('multiindex in parser must be an Immutable.OrderedMap');

      return _immutable2.default.OrderedMap(multiindex.entrySeq().map(function (_ref3) {
        var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
            k = _ref4[0],
            v = _ref4[1];

        if (v instanceof Index) return [k, v.values];else if (v instanceof _immutable2.default.OrderedMap) return [k, MultiIndex._parseMultiIndex(v)];

        throw new TypeError('invalid value');
      }));
    }
  }]);
  return MultiIndex;
}();