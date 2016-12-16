
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

    describe('std()', () => {
      it('returns the standard deviation of the Series', () => {
        expect(new series.Series([1, 2, 3]).std()).toBeCloseTo(0.8164965809277, 12);
      });
    });

    describe('plus()', () => {
      it('adds a second Series and returns a new Series', () => {
        const ds1 = new series.Series([1, 2, 3]);
        const ds2 = new series.Series([2, 3, 4]);

        const ds3 = ds1.plus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('minus()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new series.Series([1, 2, 3]);
        const ds2 = new series.Series([2, 3, 5]);

        const ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('minus()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new series.Series([1, 2, 3]);
        const ds2 = new series.Series([2, 3, 5]);

        const ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('times()', () => {
      it('multiplies by a second Series and returns a new Series', () => {
        const ds1 = new series.Series([1, 2, 3]);
        const ds2 = new series.Series([2, 3, 5]);

        const ds3 = ds1.times(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('dividedBy()', () => {
      it('divides by a second Series and returns a new Series', () => {
        const ds1 = new series.Series([1, 2, 3]);
        const ds2 = new series.Series([2, 3, 5]);

        const ds3 = ds1.dividedBy(ds2);
        expect(ds3).toBeInstanceOf(series.Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });
  });
});
