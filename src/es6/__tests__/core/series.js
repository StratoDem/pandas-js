
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

    it('head', () => {
      const ds = new Series([1, 2, 3, 4, 5]);
      expect(ds.head(3).values.toArray()).toEqual([1, 2, 3]);
    });

    it('tail', () => {
      const ds = new Series([1, 2, 3, 4, 5]);
      expect(ds.tail(3).values.toArray()).toEqual([3, 4, 5]);
    });

    it('copy', () => {
      const ds1 = new Series([1, 2, 3, 4], {index: [2, 3, 4, 5], name: 'Test name'});
      const ds2 = ds1.copy();

      expect(ds2).toBeInstanceOf(Series);
      expect(ds2.values.toArray()).toEqual([1, 2, 3, 4]);

      expect(ds1.name).toEqual('Test name');

      ds2.index = [1, 2, 3, 4];
      expect(ds1.index.toArray()).toEqual([2, 3, 4, 5]);
      expect(ds2.index.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('shape', () => {
      const ds = new Series([1, 2, 3, 4, 5]);
      expect(ds.shape).toBeInstanceOf(Immutable.Seq);
      expect(ds.shape.toArray()).toEqual([5]);
    });

    it('rename', () => {
      const ds = new Series([1, 2, 3], {name: 'test name'});
      expect(ds.name).toEqual('test name');
      const ds2 = ds.rename('test name 2');
      expect(ds.name).toEqual('test name');
      expect(ds2.name).toEqual('test name 2');
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

    describe('forEach()', () => {
      const ds = new Series([1, 2, 3, 4]);

      let a = 0;
      ds.forEach((val) => { a += val; });
      expect(a).toEqual(10);
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

    describe('median()', () => {
      it('returns the median of the even-length Series', () => {
        expect(new Series([3, 2, 1, 4]).median()).toEqual(2.5);
      });

      it('returns the median of the odd-length Series', () => {
        expect(new Series([4, 2, 1, 4, 7]).median()).toEqual(4);
      });
    });

    describe('std()', () => {
      it('returns the standard deviation of the Series', () => {
        expect(new Series([1, 2, 3]).std()).toBeCloseTo(1, 12);
      });
    });

    describe('abs()', () => {
      it('returns the absolute value of a numeric Series', () => {
        const ds = new Series([-1, 2, -3]);
        const dsAbs = ds.abs();
        expect(dsAbs).toBeInstanceOf(Series);
        expect(dsAbs.values.toArray()).toEqual([1, 2, 3]);
      });

      it('returns copy of Series if it is not numeric', () => {
        const ds = new Series(['hi', 2, 4]);
        const dsAbs = ds.abs();
        expect(dsAbs).toBeInstanceOf(Series);
        expect(dsAbs.values.toArray()).toEqual(['hi', 2, 4]);
      });
    });

    describe('add()', () => {
      it('adds a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 4]);

        const ds3 = ds1.add(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([3, 5, 7]);
      });
    });

    describe('sub()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.sub(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('sub()', () => {
      it('subtracts a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.sub(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([-1, -1, -2]);
      });
    });

    describe('mul()', () => {
      it('multiplies by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.mul(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('multiply()', () => {
      it('multiplies by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.multiply(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([2, 6, 15]);
      });
    });

    describe('div()', () => {
      it('divides by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.div(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });

    describe('divide()', () => {
      it('divides by a second Series and returns a new Series', () => {
        const ds1 = new Series([1, 2, 3]);
        const ds2 = new Series([2, 3, 5]);

        const ds3 = ds1.divide(ds2);
        expect(ds3).toBeInstanceOf(Series);
        expect(ds3.values.size).toEqual(3);
        expect(ds3.values.toJS()).toEqual([0.5, 2 / 3, 0.6]);
      });
    });

    describe('diff', () => {
      it('calculates the difference for 1 period', () => {
        const ds = new Series([1, 2, 4, 8, 16]);
        expect(ds.diff(1).values.toArray()).toEqual([null, 1, 2, 4, 8]);
      });

      it('calculates the difference for 2 periods', () => {
        const ds = new Series([1, 2, 4, 8, 16]);
        expect(ds.diff(2).values.toArray()).toEqual([null, null, 3, 6, 12]);
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

    describe('round', () => {
      it('rounds a Series to 1 digit', () => {
        const ds = new Series([1.1, 2.13, 2.25, 2.76]);
        const dsRound = ds.round(1);

        expect(dsRound).toBeInstanceOf(Series);
        expect(dsRound.values.toArray()).toEqual([1.1, 2.1, 2.3, 2.8]);
      });

      it('rounds a Series to 2 digits', () => {
        const ds = new Series([1.1, 2.137, 2.255, 2.761]);
        const dsRound = ds.round(2);

        expect(dsRound).toBeInstanceOf(Series);
        expect(dsRound.values.toArray()).toEqual([1.10, 2.14, 2.26, 2.76]);
      });
    });

    describe('_alignSeries', () => {
      it('properly aligns Series with the same index values', () => {
        const ds1 = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds2 = new Series(['bye', 'hi', 'foo', 'test', 'bar']);

        const aligned = ds1._alignSeries(ds2);
        expect(aligned.size).toEqual(5);
        expect(aligned.getIn([0, 'first']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([0, 'second']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'first']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'second']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([2, 'first']).toArray()).toEqual(['test']);
        expect(aligned.getIn([2, 'second']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'first']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'second']).toArray()).toEqual(['test']);
        expect(aligned.getIn([4, 'first']).toArray()).toEqual(['bar']);
        expect(aligned.getIn([4, 'second']).toArray()).toEqual(['bar']);
      });

      it('properly aligns Series with the differing index values', () => {
        const ds1 = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds2 = new Series(['bye', 'hi', 'foo', 'test', 'bar']);

        const aligned = ds1._alignSeries(ds2);
        expect(aligned.size).toEqual(5);
        expect(aligned.getIn([0, 'first']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([0, 'second']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'first']).toArray()).toEqual(['bye']);
        expect(aligned.getIn([1, 'second']).toArray()).toEqual(['hi']);
        expect(aligned.getIn([2, 'first']).toArray()).toEqual(['test']);
        expect(aligned.getIn([2, 'second']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'first']).toArray()).toEqual(['foo']);
        expect(aligned.getIn([3, 'second']).toArray()).toEqual(['test']);
        expect(aligned.getIn([4, 'first']).toArray()).toEqual(['bar']);
        expect(aligned.getIn([4, 'second']).toArray()).toEqual(['bar']);
      });
    });

    describe('where', () => {
      it('checks for equality of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds2 = ds1.where('hi', (a, b) => a === b);

        expect(ds2.values.toArray()).toEqual([true, false, false, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for equality of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series(['hi', 'bye', 'test']);
        const ds2 = ds1.where(new Series(['bye', 'bye', 'test']), (a, b) => a === b);

        expect(ds2.values.toArray()).toEqual([false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('eq', () => {
      it('checks for equality of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series(['hi', 'bye', 'test', 'foo', 'bar']);
        const ds2 = ds1.eq('hi');

        expect(ds2.values.toArray()).toEqual([true, false, false, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for equality of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series(['hi', 'bye', 'test']);
        const ds2 = ds1.eq(new Series(['bye', 'bye', 'test']));

        expect(ds2.values.toArray()).toEqual([false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('lt', () => {
      it('checks for less than of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.lt(3);

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for less than of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.lt(new Series([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('lte', () => {
      it('checks for less than or equal to of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.lte(3);

        expect(ds2.values.toArray()).toEqual([true, true, true, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for less than or equal to of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series([2, 2, 3, 4]);
        const ds2 = ds1.lte(new Series([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, true, false, false]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('gt', () => {
      it('checks for greater than of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.gt(3);

        expect(ds2.values.toArray()).toEqual([false, false, false, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for greater than of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.gt(new Series([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([false, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('gte', () => {
      it('checks for greater than or equal of a scalar and returns a Series of dtype bool', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = ds1.gte(3);

        expect(ds2.values.toArray()).toEqual([false, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });

      it('checks for greater than or equal of a Series and returns a Series of dtype bool', () => {
        const ds1 = new Series([2, 2, 3, 4]);
        const ds2 = ds1.gte(new Series([2, 3, 2, 2]));

        expect(ds2.values.toArray()).toEqual([true, false, true, true]);
        expect(ds2.dtype.dtype).toEqual('bool');
      });
    });

    describe('notnull', () => {
      it('returns a Series with true if value is not null, false otherwise', () => {
        const ds = new Series([1, 2, null, null, 4]);
        expect(ds.notnull()).toBeInstanceOf(Series);
        expect(ds.notnull().values.toArray()).toEqual([true, true, false, false, true]);
      });
    });

    describe('shift', () => {
      it('returns a copy of the Series if the periods === 0', () => {
        const ds1 = new Series([2, 2, 3, 4]);
        expect(ds1.shift(0).values.toArray()).toEqual([2, 2, 3, 4]);
      });

      it('returns a shifted array if the periods > 0', () => {
        const ds1 = new Series([2, 2, 3, 4]);
        expect(ds1.shift(1).values.toArray()).toEqual([null, 2, 2, 3]);
      });

      it('returns a shifted array if the periods < 0', () => {
        const ds1 = new Series([2, 2, 3, 4]);
        expect(ds1.shift(-1).values.toArray()).toEqual([2, 3, 4, null]);
      });
    });

    describe('unique', () => {
      it('returns unique floats', () => {
        const ds1 = new Series([2, 3.1, 2.1, 3.1, 3.1, 4.3]);
        expect(ds1.unique().toArray()).toEqual([2, 3.1, 2.1, 4.3]);
      });

      it('returns unique strings', () => {
        const ds1 = new Series(['foo', 'bar', 'bar', 'foo', 'foo', 'test', 'bar', 'hi']);
        expect(ds1.unique().toArray()).toEqual(['foo', 'bar', 'test', 'hi']);
      });
    });

    describe('filter', () => {
      it('filters with a simple eq check', () => {
        const ds = new Series([1, 2, 3, 4, 1]);
        const dsFilter = ds.filter(ds.eq(1));

        expect(dsFilter.length).toEqual(2);
        expect(dsFilter.values.toArray()).toEqual([1, 1]);
        expect(dsFilter.index.toArray()).toEqual([0, 4]);
      });

      it('filters with a custom where', () => {
        const ds = new Series([1, 2, 3, 4, 1]);
        const dsFilter = ds.filter(ds.where(2, (a, b) => a * 2 > b));

        expect(dsFilter.length).toEqual(3);
        expect(dsFilter.values.toArray()).toEqual([2, 3, 4]);
        expect(dsFilter.index.toArray()).toEqual([1, 2, 3]);
      });
    });

    describe('cov', () => {
      it('calculates the covariance between this Series and another', () => {
        const ds1 = new Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const ds2 = new Series([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8]);

        const cov = ds1.cov(ds2);
        expect(cov).toBeCloseTo(18.3333333, 6);
      });

      it('throws an error if the Series are not equal length', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = new Series([2, 3, 4]);

        expect(() => { ds1.cov(ds2); }).toThrow();
      });
    });

    describe('corr', () => {
      it('calculates the correlation between this Series and another', () => {
        const ds1 = new Series([1, 2, 3, 4, 5]);
        const ds2 = new Series([-10, -8, -6, -4, -2]);

        const corr = ds1.corr(ds2);
        expect(corr).toBeCloseTo(1, 8);
      });

      it('throws an error if the Series are not equal length', () => {
        const ds1 = new Series([1, 2, 3, 4]);
        const ds2 = new Series([2, 3, 4]);

        expect(() => { ds1.corr(ds2); }).toThrow();
      });
    });

    describe('to_json', () => {
      it('converts a pandas Series to a json object', () => {
        const ds = new Series([1, 2, 3, 4], {name: 'x'});

        const dsJSON = ds.to_json();
        expect(dsJSON).toEqual({0: 1, 1: 2, 2: 3, 3: 4});
      });

      it('converts a pandas Series to a json object when orient="records"', () => {
        const ds = new Series([1, 2, 3, 4], {name: 'x'});

        const dsJSON = ds.to_json({orient: 'records'});
        expect(dsJSON).toEqual([1, 2, 3, 4]);
      });

      it('converts a pandas Series to a json object when orient="split"', () => {
        const ds = new Series([1, 2, 3, 4], {name: 'x'});

        const dsJSON = ds.to_json({orient: 'split'});
        expect(dsJSON).toEqual({name: 'x', index: [0, 1, 2, 3], values: [1, 2, 3, 4]});
      });
    });

    describe('cumulative functions', () => {
      it('cumsum', () => {
        const ds = new Series([1, 2, 3, 4, 5], {index: [2, 3, 4, 5, 6]});
        const ds2 = ds.cumsum();
        expect(ds2).toBeInstanceOf(Series);
        expect(ds2.values.toArray()).toEqual([1, 3, 6, 10, 15]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummul', () => {
        const ds = new Series([1, 2, 3, 4, 5], {index: [2, 3, 4, 5, 6]});
        const ds2 = ds.cummul();
        expect(ds2).toBeInstanceOf(Series);
        expect(ds2.values.toArray()).toEqual([1, 2, 6, 24, 120]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummax', () => {
        const ds = new Series([1, 2, 6, 4, 5], {index: [2, 3, 4, 5, 6]});
        const ds2 = ds.cummax();
        expect(ds2).toBeInstanceOf(Series);
        expect(ds2.values.toArray()).toEqual([1, 2, 6, 6, 6]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });

      it('cummin', () => {
        const ds = new Series([3, 2, 6, 1, 5], {index: [2, 3, 4, 5, 6]});
        const ds2 = ds.cummin();
        expect(ds2).toBeInstanceOf(Series);
        expect(ds2.values.toArray()).toEqual([3, 2, 2, 1, 1]);
        expect(ds2.index.toArray()).toEqual([2, 3, 4, 5, 6]);
      });
    });
  });

  describe('append', () => {
    it('Appends a Series to another when ignore_index is false', () => {
      const ds1 = new Series([1, 2, 3], {index: [1, 2, 3]});
      const ds2 = new Series([2, 3, 4], {index: [2, 3, 4]});
      const ds3 = ds1.append(ds2);
      expect(ds3.values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(ds3.index.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
    });

    it('Appends a Series to another when ignore_index is true', () => {
      const ds1 = new Series([1, 2, 3], {index: [1, 2, 3]});
      const ds2 = new Series([2, 3, 4], {index: [2, 3, 4]});
      const ds3 = ds1.append(ds2, true);
      expect(ds3.values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(ds3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });
  });
});
