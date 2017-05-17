'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _multiindex = require('../../core/multiindex');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('multiindex', function () {
  describe('Index', function () {
    it('initializes with an Array or List', function () {
      var index = new _multiindex.Index([1, 2, 3, 4]);
      expect(index.values).toBeInstanceOf(_immutable2.default.List);
      expect(index.values.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('throws a TypeError otherwise', function () {
      expect(function () {
        return new _multiindex.Index('hi');
      }).toThrow(TypeError);
    });
  });

  describe('MultiIndex', function () {
    it('initializes with an Immutable.OrderedMap', function () {
      var multiindex = new _multiindex.MultiIndex(_immutable2.default.OrderedMap({ 1: _immutable2.default.OrderedMap({ 2: new _multiindex.Index([1, 2, 3]) }) }));

      expect(multiindex.values).toBeInstanceOf(_immutable2.default.OrderedMap);
      expect(multiindex.values.size).toEqual(1);
      expect(multiindex.values.get('1')).toBeInstanceOf(_immutable2.default.OrderedMap);
      expect(multiindex.values.get('1').size).toEqual(1);
      expect(multiindex.values.get('1').get('2')).toBeInstanceOf(_immutable2.default.List);
      expect(multiindex.values.get('1').get('2').toArray()).toEqual([1, 2, 3]);
    });

    it('throws a TypeError otherwise', function () {
      expect(function () {
        return new _multiindex.MultiIndex('1');
      }).toThrow(TypeError);
    });

    it('get returns the Index or MultiIndex at the key', function () {
      var multiindex = new _multiindex.MultiIndex(_immutable2.default.OrderedMap({ 1: _immutable2.default.OrderedMap({ 2: new _multiindex.Index([1, 2, 3]) }) }));

      var multiindex1 = multiindex.get('1');
      expect(multiindex1).toBeInstanceOf(_multiindex.MultiIndex);

      var multiindex2 = multiindex1.get('2');
      expect(multiindex2).toBeInstanceOf(_multiindex.Index);
      expect(multiindex2.values.toArray()).toEqual([1, 2, 3]);

      var index = multiindex2.get(1);
      expect(index).toEqual(2);
    });
  });
});