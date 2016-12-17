
import Immutable from 'immutable';
import Series from '../../core/series';
import * as dtype from '../../core/dtype';


describe('series', () => {
  describe('Series', () => {
    it('initializes properly with an Array', () => {
      expect(new Series([1, 2, 3]).values).toBeInstanceOf(Immutable.List);
      expect(new Series([1, 2, 3]).values.toArray()).toEqual([1, 2, 3]);

      expect(new Series([1, 2, 3], {name: 'Test name'}).name).toEqual('Test name');
    });

    it('toString', () => {
      const ds1 = new Series([1.5, 2.1, 3.9]);

      expect(ds1.toString()).toEqual('0\t1.5\n1\t2.1\n2\t3.9\nName: , dtype: dtype(float)');
    });

    describe('astype', () => {
      it('converts a float Series to an integer Series', () => {
        const ds1 = new Series([1.5, 2.1, 3.9]);
        expect(ds1.dtype.dtype).toEqual('float');

        const ds2 = ds1.astype(new dtype.DType('int'));
        expect(ds2.values.toArray()).toEqual([1, 2, 3]);
      });
    });

    describe('iloc()', () => {
      it('gets the value in a pandas.Series at the index', () => {
        const ds1 = new Series([1.5, 2.1, 3.9]);

        expect(ds1.iloc(0)).toEqual(1.5);
        expect(ds1.iloc(1)).toEqual(2.1);
        expect(ds1.iloc(2)).toEqual(3.9);
      });

      it('gets a Series between startVal and endVal', () => {
        const ds1 = new Series([1.5, 2.1, 3.9]);

        expect(ds1.iloc(0, 2)).toBeInstanceOf(Series);
        expect(ds1.iloc(0, 1).values.toArray()).toEqual([1.5]);
        expect(ds1.iloc(0, 2).values.toArray()).toEqual([1.5, 2.1]);
        expect(ds1.iloc(1, 3).values.toArray()).toEqual([2.1, 3.9]);
      });
    });

    describe('map()', () => {
      it('applies a function over the series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = ds1.map(v => v * 2);

        expect(ds2).toBeInstanceOf(Series);
        expect(ds2.values.toArray()).toEqual([2, 4, 6]);
      });
    });

    describe('sum()', () => {
      it('returns the sum of the Series', () => {
        expect(new Series([1, 2, 3]).sum()).toEqual(6);
      });
    });

    describe('mean()', () => {
      it('returns the mean of the Series', () => {
        expect(new Series([1, 2, 3]).mean()).toEqual(2);
      });
    });

    describe('std()', () => {
      it('returns the standard deviation of the Series', () => {
        expect(new Series([1, 2, 3]).std()).toBeCloseTo(1, 12);
      });
    });

    describe('plus()', () => {
      it('adds a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 4]);

        const ds3 = ds1.plus(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('minus()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('minus()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.minus(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('times()', () => {
      it('multiplies by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.times(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('dividedBy()', () => {
      it('divides by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.dividedBy(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });
  });
});
