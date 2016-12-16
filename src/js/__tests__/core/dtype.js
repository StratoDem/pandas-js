'use strict';

var _dtype = require('../../core/dtype');

var dtype = _interopRequireWildcard(_dtype);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('dtype', function () {
  describe('DType', function () {
    it('initializes a object dtype', function () {
      expect(new dtype.DType('object').dtype).toEqual('object');
    });

    it('initializes a float dtype', function () {
      expect(new dtype.DType('float').dtype).toEqual('float');
    });

    it('initializes a int dtype', function () {
      expect(new dtype.DType('int').dtype).toEqual('int');
    });
  });
  describe('elementToDType', function () {
    it('string has dtype object', function () {
      expect(dtype.elementToDType('1').dtype).toEqual('object');
    });

    it('object has dtype object', function () {
      expect(dtype.elementToDType({}).dtype).toEqual('object');
    });

    it('Array has dtype object', function () {
      expect(dtype.elementToDType([]).dtype).toEqual('object');
    });

    it('Integer has dtype int', function () {
      expect(dtype.elementToDType(1).dtype).toEqual('int');
    });

    it('Float has dtype float', function () {
      expect(dtype.elementToDType(1.5).dtype).toEqual('float');
    });
  });

  describe('arrayToDType', function () {
    it('array of strings has dtype object', function () {
      expect(dtype.arrayToDType(['1', '2', 'hi']).dtype).toEqual('object');
    });

    it('array of objects has dtype object', function () {
      expect(dtype.arrayToDType([{}, { a: 'hi' }, { b: 'test' }]).dtype).toEqual('object');
    });

    it('array of objects and strings has dtype object', function () {
      expect(dtype.arrayToDType(['test', { a: 'hi' }, { b: 'test' }]).dtype).toEqual('object');
    });

    it('array of floats has dtype float', function () {
      expect(dtype.arrayToDType([1.5, 2.3, 5.3]).dtype).toEqual('float');
    });

    it('array of ints has dtype int', function () {
      expect(dtype.arrayToDType([5, 3, 5, 1]).dtype).toEqual('int');
    });

    it('array of floats and ints has dtype float', function () {
      expect(dtype.arrayToDType([5, 3, 5, 1.5]).dtype).toEqual('float');
    });
  });
});
