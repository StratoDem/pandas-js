
import Immutable from 'immutable';
import * as series from '../../core/series';


describe('series', () => {
  describe('Series', () => {
    it('initializes properly with an Array', () => {
      expect(new series.Series([1, 2, 3]).values).toBeInstanceOf(Immutable.List);
      expect(new series.Series([1, 2, 3]).values.toArray()).toEqual([1, 2, 3]);
    });

    describe('sum()', () => {
      it('returns the sum of the Series', () => {
        expect(new series.Series([1, 2, 3]).sum()).toEqual(6);
      });
    });

    describe('mean()', () => {
      it('returns the mean of the Series', () => {
        expect(new series.Series([1, 2, 3]).mean()).toEqual(2);
      });
    });
  });
});
