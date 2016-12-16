
import * as utils from '../../core/utils';


describe('utils', () => {
  describe('sum', () => {
    it('adds an array properly', () => {
      expect(utils.sum([1, 2, 3, 4, 5])).toEqual(15);
      expect(utils.sum([5, 4, 3, 2])).toEqual(14);
    });
  });
});
