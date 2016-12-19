
import Immutable from 'immutable';
import Series from '../../core/series';
import * as dtype from '../../core/dtype';
import { IndexMismatchError } from '../../core/exceptions';


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

    it('copy', () => {
      const ds1 = new Series([1, 2, 3, 4], {index: [2, 3, 4, 5], name: 'Test name'});
      const ds2 = ds1.copy();

      expect(ds2).toBeInstanceOf(Series);
      expect(ds2.values.toArray()).toEqual([1, 2, 3, 4]);

      ds2.name = 'test';
      expect(ds1.name).toEqual('Test name');
      expect(ds2.name).toEqual('test');

      ds2.index = [1, 2, 3, 4];
      expect(ds1.index.toArray()).toEqual([2, 3, 4, 5]);
      expect(ds2.index.toArray()).toEqual([1, 2, 3, 4]);
    });

    describe('astype', () => {
      it('converts a float Series to an integer Series', () => {
        const ds1 = new Series([1.5, 2.1, 3.9]);
        expect(ds1.dtype.dtype).toEqual('float');

        const ds2 = ds1.astype(new dtype.DType('int'));
        expect(ds2.values.toArray()).toEqual([1, 2, 3]);
      });
    });

    describe('index', () => {
      it('index is set properly as the [0, ..., length - 1] if not passed in constructor', () => {
        const ds1 = new Series([1.5, 2.1, 3.9]);
        expect(ds1.index.toArray()).toEqual([0, 1, 2]);
      });

      it('index is set properly as the index array passed in in constructor', () => {
        const ds1 = new Series([1.5, 2.1, 3.9], {index: [1, 2, 3]});
        expect(ds1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('index is set properly as the index List passed in in constructor', () => {
        const ds1 = new Series([1.5, 2.1, 3.9], {index: Immutable.List([1, 2, 3])});
        expect(ds1.index.toArray()).toEqual([1, 2, 3]);
      });

      it('throws IndexMismatchError if the index does not match', () => {
        const f = () => new Series([1.5, 2.1, 3.9], {index: Immutable.List([1, 2, 3, 4])});
        expect(f).toThrowError(IndexMismatchError);
      });

      it('index setter updates the index if proper length array passed in', () => {
        const ds1 = new Series([1.5, 2.1, 3.9], {index: Immutable.List([1, 2, 3])});
        ds1.index = Immutable.List([2, 3, 4]);

        expect(ds1.index.toArray()).toEqual([2, 3, 4]);
      });

      it('throws IndexMismatchError in setter if index does not match', () => {
        const ds1 = new Series([1.5, 2.1, 3.9], {index: Immutable.List([1, 2, 3])});
        const f = () => { ds1.index = Immutable.List([2, 3, 4, 5]); };
        expect(f).toThrowError(IndexMismatchError);
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

    describe('pct_change', () => {
      it('calculates the percent change for 1 period', () => {
        const ds = new Series([1, 2, 3, 4, 5]);
        expect(ds.pct_change(1).values.toArray()).toEqual([null, 1, 0.5, (4 / 3) - 1, 0.25]);
      });

      it('calculates the percent change for 2 periods', () => {
        const ds = new Series([1, 2, 3, 4, 5]);
        expect(ds.pct_change(2).values.toArray()).toEqual([null, null, 2, 1, (5 / 3) - 1]);
      });
    });

    describe('sort_values', () => {
      it('sorts the Series by the values in ascending order', () => {
        const ds1 = new Series([2, 3, 4, 1]).sort_values();

        expect(ds1.values.toArray()).toEqual([1, 2, 3, 4]);
        expect(ds1.index.toArray()).toEqual([3, 0, 1, 2]);
      });

      it('sorts the Series by the values in descending order', () => {
        const ds = new Series([2, 3, 4, 1]);
        const ds1 = ds.sort_values(false);

        expect(ds1.values.toArray()).toEqual([4, 3, 2, 1]);
        expect(ds1.index.toArray()).toEqual([2, 1, 0, 3]);
      });

      it('sorts the Series by the values in ascending order for strings', () => {
        const ds = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds1 = ds.sort_values(true);

        expect(ds1.values.toArray()).toEqual(['bar', 'bye', 'foo', 'hi', 'test']);
        expect(ds1.index.toArray()).toEqual([4, 1, 3, 0, 2]);
      });

      it('sorts the Series by the values in descending order for strings', () => {
        const ds = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds1 = ds.sort_values(false);

        expect(ds1.values.toArray()).toEqual(['test', 'hi', 'foo', 'bye', 'bar']);
        expect(ds1.index.toArray()).toEqual([2, 0, 3, 1, 4]);
      });
    });
  });
});
