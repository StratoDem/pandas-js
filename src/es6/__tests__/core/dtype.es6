
import * as dtype from '../../core/dtype';

describe('dtype', () => {
  describe('DType', () => {
    it('initializes a object dtype', () => {
      expect(new dtype.DType('object').dtype).toEqual('object');
    });

    it('initializes a float dtype', () => {
      expect(new dtype.DType('float').dtype).toEqual('float');
    });

    it('initializes a int dtype', () => {
      expect(new dtype.DType('int').dtype).toEqual('int');
    });

  });
  describe('elementToDType', () => {
    it('string has dtype object', () => {
      expect(dtype.elementToDType('1').dtype).toEqual('object');
    });

    it('object has dtype object', () => {
      expect(dtype.elementToDType({}).dtype).toEqual('object');
    });

    it('Array has dtype object', () => {
      expect(dtype.elementToDType([]).dtype).toEqual('object');
    });

    it('Integer has dtype int', () => {
      expect(dtype.elementToDType(1).dtype).toEqual('int');
    });

    it('Float has dtype float', () => {
      expect(dtype.elementToDType(1.5).dtype).toEqual('float');
    });
  });

  describe('arrayToDType', () => {
    it('array of strings has dtype object', () => {
      expect(dtype.arrayToDType(['1', '2', 'hi']).dtype).toEqual('object');
    });

    it('array of objects has dtype object', () => {
      expect(dtype.arrayToDType([{}, {a: 'hi'}, {b: 'test'}]).dtype).toEqual('object');
    });

    it('array of objects and strings has dtype object', () => {
      expect(dtype.arrayToDType(['test', {a: 'hi'}, {b: 'test'}]).dtype).toEqual('object');
    });

    it('array of floats has dtype float', () => {
      expect(dtype.arrayToDType([1.5, 2.3, 5.3]).dtype).toEqual('float');
    });

    it('array of ints has dtype int', () => {
      expect(dtype.arrayToDType([5, 3, 5, 1]).dtype).toEqual('int');
    });

    it('array of floats and ints has dtype float', () => {
      expect(dtype.arrayToDType([5, 3, 5, 1.5]).dtype).toEqual('float');
    });
  });
});
