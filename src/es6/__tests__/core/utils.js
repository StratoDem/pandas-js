
import * as utils from '../../core/utils';


describe('utils', () => {
  describe('sum', () => {
    it('adds an array properly', () => {
      expect(utils.sum([1, 2, 3, 4, 5])).toEqual(15);
      expect(utils.sum([5, 4, 3, 2])).toEqual(14);
    });
  });

  describe('enumerate', () => {
    it('enumerates with [element, index]', () => {
      const vals = [1, 2, 3, 4];

      for (const [v, idx] of utils.enumerate(vals)) {
        expect(v).toEqual(vals[idx]);
      }
    });
  });

  describe('round10', () => {
    it('rounds a decimal to the nearest tenth', () => {
      const val = 1.14;
      expect(utils.round10(val, -1)).toEqual(1.1);


      const val2 = 1.16;
      expect(utils.round10(val2, -1)).toEqual(1.2);
    });

    it('rounds a decimal to the nearest hundredth', () => {
      const val = 1.144;
      expect(utils.round10(val, -2)).toEqual(1.14);

      const val2 = 1.146;
      expect(utils.round10(val2, -2)).toEqual(1.15);
    });
  });
});
