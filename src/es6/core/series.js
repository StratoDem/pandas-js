/**
 * @flow
 * A pandas.Series one-dimensional array with axis labels, with an Immutable.List instead of
 * numpy.ndarray as the values
 */

import Immutable from 'immutable';

import NDFrame from './generic';
import {enumerate, sum, parseIndex, round10,
  OP_CUMSUM, OP_CUMMUL, OP_CUMMAX, OP_CUMMIN, generateCumulativeFunc} from './utils';
import {DType, arrayToDType} from './dtype';

declare type T_MF = (value: number, idx: number) => number | string;
declare type T_BF = (value1: number, value2: number) => boolean;


export default class Series extends NDFrame {
  /**
   * One dimensional array with axis labels. An `Immutable.List` serves as the numpy.ndarray for
   * values.
   *
   * Operations between `Series` (+, -, /, *, **) align values based on their associated index
   * values
   *
   * @param {Array|List} data
   *    Data to be stored in Series
   * @param {Object} kwargs
   *    Extra optional arguments for a Series
   * @param {string} [kwargs.name='']
   *    The _name to assign to the Series
   * @param {Array|List} [kwargs.index]
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'My test name', index: [2, 3, 4, 5]})
   * ds.toString()
   * // Returns:
   * // 2  1
   * // 3  2
   * // 4  3
   * // 5  4
   * // Name: My test name, dtype: dtype(int)
   */
  constructor(data: Array<Object> | Object, kwargs: Object = {}) {
    super(data, kwargs);

    if (Array.isArray(data)) {
      this._values = Immutable.List(data);
      this._dtype = arrayToDType(data);
    } else if (data instanceof Immutable.List) {
      this._values = data;
      this._dtype = arrayToDType(data);
    } else {
      this._values = Immutable.List.of(data);
      this._dtype = arrayToDType([data]);
    }

    this._name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';

    this.set_axis(0, parseIndex(kwargs.index, this.values));
    this._setup_axes(Immutable.List.of(0));

    // $FlowFixMe TODO
    this._sort_ascending = this._sort_ascending.bind(this);
    // $FlowFixMe TODO
    this._sort_descending = this._sort_descending.bind(this);
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    const values = this.values;
    let index = -1;

    return {
      next: () => {
        index += 1;
        return {value: values.get(index), done: !(index >= 0 && index < values.size)};
      },
    };
  }

  /**
   * Return a new `Series` created by a map along a `Series`
   *
   * pandas equivalent: [Series.map](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.map.html)
   *
   * @param {function} func
   *  Function to apply along the values
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
   *
   * // Returns Series([1, 4, 9, 16], {name: 'New Series', index: [1, 2]})
   * ds.map((val, idx) => val ** 2);
   */
  map(func: T_MF): Series {
    return new Series(
      this.values.map((val, idx) => func(val, idx)),
      {name: this.name, index: this.index});
  }

  /**
   * forEach applied along the `Series` values
   *
   * @param {function} func
   *  Function to apply along the values
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
   *
   * // Logs 1, 4, 9, 16
   * ds.forEach((val, idx) => console.log(val ** 2));
   */
  forEach(func: T_MF): void {
    this.values.forEach((val, idx) => func(val, idx));
  }

  /**
   * Return the `Series` as a string
   *
   * @returns {string}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'My test name', index: [2, 3, 4, 5]})
   * ds.toString()
   * // Returns:
   * // 2  1
   * // 3  2
   * // 4  3
   * // 5  4
   * // Name: My test name, dtype: dtype(int)
   */
  toString(): string {
    // $FlowFixMe TODO
    const vals = this.iloc(0, 10).values;

    let valString = '';
    vals.forEach((v, idx) => {
      valString += `${this.index.get(idx)}\t${v}\n`;
    });

    return `${valString}Name: ${this.name}, dtype: ${this.dtype}`;
  }

  /**
   * Return first n rows
   *
   * pandas equivalent: [Series.head](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.head.html)
   *
   * @param {number} n=5
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4, 5, 6, 7, 8]);
   *
   * // Returns Series([1, 2, 3, 4, 5])
   * ds.head();
   *
   * // Returns Series([1, 2, 3])
   * ds.head(3);
   */
  head(n: number = 5): Series {
    // $FlowFixMe TODO
    return this.iloc(0, n);
  }

  /**
   * Return last n rows
   *
   * pandas equivalent: [Series.tail](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.tail.html)
   *
   * @param {number} n=5
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4, 5, 6, 7, 8]);
   *
   * // Returns Series([4, 5, 6, 7, 8])
   * ds.tail();
   *
   * // Returns Series([6, 7, 8])
   * ds.tail(3);
   */
  tail(n: number = 5): Series {
    // $FlowFixMe TODO
    return this.iloc(this.length - n, this.length);
  }

  /**
   * Return a new deep copy of the `Series`
   *
   * pandas equivalent: [Series.copy](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.copy.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test 1'});
   * const ds2 = ds.copy();
   * ds2.index = [1, 2, 3];
   * ds.index   // [0, 1, 2];
   * ds2.index  // [1, 2, 3];
   */
  copy(): Series {
    return new Series(this.values, {index: this.index, name: this.name});
  }

  get kwargs(): Object {
    return {
      name: this.name,
      index: this.index,
    };
  }

  /**
   * Return the dtype of the underlying data
   *
   * pandas equivalent [Series.dtype](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.dtype.html)
   *
   * @returns {DType}
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   * ds.dtype;    // dtype('float');

   */
  get dtype(): DType {
    return this._dtype;
  }

  /**
   * Return the index of the `Series`, an `Immutable.List`
   *
   * @returns {List}
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   *
   * // Returns List [0, 1, 2]
   * ds.index;
   */
  get index(): Immutable.List {
    return this._get_axis(0);
  }

  /**
   * Set the index of the `Series`, an `Immutable.List`
   *
   * @param {List|Array} index
   *    The next values for the index of the `Series`
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   * ds.index = [1, 2, 3];
   *
   * // Returns List [1, 2, 3]
   * ds.index;
   */
  set index(index: Immutable.List | Array<number | string>) {
    this.set_axis(0, parseIndex(index, this.values));
  }

  /**
   * Return the length of the `Series`
   *
   * pandas equivalent: len(series);
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   *
   * // Returns 3
   * ds.length;
   */
  get length(): number {
    return this.values.size;
  }

  /**
   * Return the values of the `Series` as an `Immutable.List`
   *
   * pandas equivalent: [Series.values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.values.html);
   *
   * @returns {List}
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   *
   * // Returns List [1.5, 2, 3]
   * ds.values;
   */
  get values(): Immutable.List {
    return super.values;
  }

  /**
   * Return the name of the `Series`
   *
   * @returns {string}
   */
  get name(): string {
    return this._name;
  }

  /**
   * Convert the series to the desired type
   *
   * pandas equivalent: [Series.astype](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.astype.html)
   *
   * @param {DType} nextType
   *
   * @example
   * const ds = new Series([1.5, 2, 3], {name: 'Series name'});
   *
   * // dtype('float')
   * ds.dtype;
   *
   * // Series([1, 2, 3])
   * ds.astype(new DType('int'))
   */
  astype(nextType: DType): Series {
    if (!(nextType instanceof DType))
      throw new Error('Next type must be a DType');

    if (nextType.dtype === this.dtype)
      return this;

    switch (nextType.dtype) {
      case 'int': {
        if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to int');
        const kwargs = {name: this.name, index: this.index};
        return new Series(this.values.map(v => Math.floor(v)), kwargs);
      }
      case 'float': {
        if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to float');
        const kwargs = {name: this.name, index: this.index};
        return new Series(this.values.map(v => parseFloat(v)), kwargs);
      }
      default:
        throw new Error(`Invalid dtype ${nextType}`);
    }
  }

  /**
   * Return the Series between [startVal, endVal), or at startVal if endVal is undefined
   *
   * pandas equivalent: [Series.iloc](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.iloc.html)
   *
   * @param {int} startVal
   * @param {int} [endVal]
   *
   * @returns {Series|number|string}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
   * ds.iloc(1)      // 2
   * ds.iloc(1, 3)   // Series([2, 3], {name: 'New Series', index: [1, 2]})
   */
  iloc(startVal: number, endVal: ?number): Series | number | string {
    if (typeof endVal === 'undefined')
      return this.values.get(startVal);

    const {name} = this.kwargs;
    const index = this.index.slice(startVal, endVal);

    return new Series(this.values.slice(startVal, endVal), {name, index});
  }

  /**
   * Return the sum of the values in the `Series`
   *
   * pandas equivalent: [Series.sum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sum.html)
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
   *
   * // Returns 10
   * ds.sum();
   */
  sum(): number {
    return sum(this.values);
  }

  /**
   * Return the mean of the values in the `Series`
   *
   * pandas equivalent: [Series.mean](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.mean.html)
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4], {name: 'New Series'})
   *
   * // Returns 2.5
   * ds.mean();
   */
  mean(): number {
    return this.sum() / this.length;
  }

  /**
   * Return the median of the values in the `Series`
   *
   * pandas equivalent: [Series.median](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.median.html)
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([2, 3, 1, 4, 5], {name: 'New Series'})
   *
   * // Returns 3
   * ds.median();
   */
  median(): number {
    const sortedVals = this.values.sort();

    if (this.length % 2 === 1)
      return sortedVals.get(Math.floor(this.length / 2));

    const halfLength = this.length / 2;
    return (sortedVals.get(halfLength - 1) + sortedVals.get(halfLength)) / 2;
  }

  /**
   * Return the variance of the values in the `Series`
   *
   * pandas equivalent: [Series.var](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.var.html)
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * // Returns 1
   * ds.variance();
   */
  variance(): number {
    const mean = this.mean();

    return this.values.reduce((s, v) => {
      const diff = v - mean;
      return s + ((diff * diff) / (this.length - 1));
    }, 0);
  }

  /**
   * Return the standard deviation of the values in the `Series`
   *
   * pandas equivalent: [Series.std](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.std.html)
   *
   * @returns {number}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * // Returns 1
   * ds.std();
   */
  std(): number {
    return Math.sqrt(this.variance());
  }

  /**
   * Return Series with absolute value of all values
   *
   * pandas equivalent: [Series.abs](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.abs.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([-1, 2, -4, 5, -1, -2]);
   *
   * // Returns Series([1, 2, 4, 5, 1, 2]);
   * ds.abs();
   */
  abs(): Series {
    if (['bool', 'string', 'object'].indexOf(this.dtype.dtype) >= 0) return this.copy();

    return new Series(this.values.map(v => Math.abs(v)), {name: this.name, index: this.index});
  }

  _combineOp(other: any, op: (a: number, b: number) => number, opName: string = ''): Series {
    if (typeof other === 'number')
      return this.map((val: number) => op(val, other));
    else if (other instanceof Series)
      return this.map((val: number, idx: number) => op(val, other.iloc(idx)));
    else if (Array.isArray(other))
      return this.map((val: number, idx: number) => op(val, other[idx]));
    else if (other instanceof Immutable.List)
      return this.map((val: number, idx: number) => op(val, other.get(idx)));

    throw new Error(`${opName} only supports numbers, Arrays, Immutable List and pandas.Series`);
  }

  /**
   * Add another Iterable, `Series`, or number to the `Series`
   *
   * pandas equivalent: [Series.add](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.add.html)
   *
   * @param {Iterable|Series|number} other
   *  Value to add to the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   * ds.add(5)                           // Series([6, 7, 8], {name: 'New Series'})
   * ds.add(new Series([2, 3, 4]))       // Series([3, 5, 7], {name: 'New Series'})
   * ds.add([2, 3, 4])                   // Series([3, 5, 7], {name: 'New Series'})
   * ds.add(Immutable.List([2, 3, 4]))   // Series([3, 5, 7], {name: 'New Series'})
   */
  add(other: any): Series {
    return this._combineOp(other, (a: number, b: number) => a + b, 'add');
  }

  /**
   * Subtract another Iterable, `Series`, or number from the `Series`
   *
   * pandas equivalent: [Series.sub](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sub.html)
   *
   * @param {Iterable|Series|number} other
   *  Value to subtract from the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * ds.sub(5)                           // Series([-4, -3, -2], {name: 'New Series'})
   * ds.sub(new Series([2, 3, 4]))       // Series([-1, -1, -1], {name: 'New Series'})
   * ds.sub([2, 3, 4])                   // Series([-1, -1, -1], {name: 'New Series'})
   * ds.sub(Immutable.List([2, 3, 4]))   // Series([-1, -1, -1], {name: 'New Series'})
   */
  sub(other: any): Series {
    return this._combineOp(other, (a: number, b: number) => a - b, 'sub');
  }

  /**
   * Multiply by another Iterable, `Series`, or number from the `Series`
   *
   * pandas equivalent: [Series.mul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.mul.html)
   *
   * @param {Iterable|Series|number} other
   *  Value to multiply by the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * ds.mul(5)                           // Series([5, 10, 15], {name: 'New Series'})
   * ds.mul(new Series([2, 3, 4]))       // Series([2, 6, 12], {name: 'New Series'})
   * ds.mul([2, 3, 4])                   // Series([2, 6, 12], {name: 'New Series'})
   * ds.mul(Immutable.List([2, 3, 4]))   // Series([2, 6, 12], {name: 'New Series'})
   */
  mul(other: any): Series {
    return this._combineOp(other, (a: number, b: number) => a * b);
  }

  /**
   * Multiply by another Iterable, `Series`, or number from the `Series`
   *
   * pandas equivalent: [Series.multiply](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.multiply.html)
   *
   * @param {Iterable|Series|number} other
   *  Value to multiply by the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * ds.multiply(5)                           // Series([5, 10, 15], {name: 'New Series'})
   * ds.multiply(new Series([2, 3, 4]))       // Series([2, 6, 12], {name: 'New Series'})
   * ds.multiply([2, 3, 4])                   // Series([2, 6, 12], {name: 'New Series'})
   * ds.multiply(Immutable.List([2, 3, 4]))   // Series([2, 6, 12], {name: 'New Series'})
   */
  multiply(other: any): Series {
    return this.mul(other);
  }

  /**
   * Divide by another Iterable, `Series`, or number from the `Series`
   *
   * pandas equivalent: [Series.div](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.div.html)
   *
   * @param {Iterable|Series|number} other
   *  Value by which to divide the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * ds.div(5)                           // Series([0.2, 0.4, 0.6], {name: 'New Series'})
   * ds.div(new Series([4, 2, 1]))       // Series([0.25, 1, 3], {name: 'New Series'})
   * ds.div([4, 2, 1])                   // Series([0.25, 1, 3], {name: 'New Series'})
   * ds.div(Immutable.List([4, 2, 1]))   // Series([0.25, 1, 3], {name: 'New Series'})
   */
  div(other: any): Series {
    return this._combineOp(other, (a: number, b: number) => a / b, 'div');
  }

  /**
   * Divide by another Iterable, `Series`, or number from the `Series`
   *
   * pandas equivalent: [Series.divide](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.divide.html)
   *
   * @param {Iterable|Series|number} other
   *  Value by which to divide the `Series`
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'New Series'})
   *
   * ds.divide(5)                           // Series([0.2, 0.4, 0.6], {name: 'New Series'})
   * ds.divide(new Series([4, 2, 1]))       // Series([0.25, 1, 3], {name: 'New Series'})
   * ds.divide([4, 2, 1])                   // Series([0.25, 1, 3], {name: 'New Series'})
   * ds.divide(Immutable.List([4, 2, 1]))   // Series([0.25, 1, 3], {name: 'New Series'})
   */
  divide(other: any): Series {
    return this.div(other);
  }

  /**
   * Calculate the covariance between this `Series` and another `Series` or iterable
   *
   * pandas equivalent: [Series.cov](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cov.html)
   *
   * @param {Series} ds
   *    Series with which to calculate covariance
   *
   * @returns {number}
   *
   * @example
   * const ds1 = new Series([1, 2, 3, 4, 5]);
   * const ds2 = new Series([2, 4, 6, 8, 10]);
   *
   * // Returns 5
   * ds1.cov(ds2);
   *
   * // Also returns 5
   * ds2.cov(ds1);
   */
  cov(ds: Series): number {
    if (!(ds instanceof Series))
      throw new Error('ds must be a Series');

    if (ds.length !== this.length)
      throw new Error('Series must be of equal length');

    let n = 0;
    let mean1 = 0;
    let mean2 = 0;
    let m12 = 0;

    this.values.forEach((v1, idx) => {
      n += 1;
      const d1 = (v1 - mean1) / n;
      mean1 += d1;
      const d2 = (ds.values.get(idx) - mean2) / n;
      mean2 += d2;

      m12 += ((((n - 1) * d1) * d2) - (m12 / n));
    });

    return (n / (n - 1)) * m12;
  }

  /**
   * Calculate the correlation between this `Series` and another `Series` or iterable
   *
   * pandas equivalent: [Series.corr](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.corr.html)
   *
   * @param {Series} ds
   *    Series with which to calculate correlation
   *
   * @returns {number}
   *
   * @example
   * const ds1 = new Series([1, 2, 3, 4, 5]);
   * const ds2 = new Series([2, 4, 6, 8, 10]);
   *
   * // Returns 1
   * ds1.corr(ds2);
   *
   * // Also returns 1
   * ds2.corr(ds1);
   */
  corr(ds: Series): number {
    if (!(ds instanceof Series))
      throw new Error('ds must be a Series');

    if (ds.length !== this.length)
      throw new Error('Series must be of equal length');

    return this.cov(ds) / (this.std() * ds.std());
  }

  /**
   * Return the difference over a given number of periods
   *
   * pandas equivalent: [Series.diff](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.diff.html)
   *
   * @param {number} periods=1
   *  Number of periods to use for difference calculation
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 6, 5])
   *
   * // Returns Series([null, 1, 4, -1])
   * ds.diff();
   *
   * // Returns Series([null, null, 5, 3])
   * ds.diff(2);
   */
  diff(periods: number = 1): Series {
    if (typeof periods !== 'number' || !Number.isInteger(periods))
      throw new Error('periods must be an integer');
    if (periods <= 0)
      throw new Error('periods must be positive');

    return new Series(
      Immutable.Repeat(null, periods).toList().concat(
        Immutable.Range(periods, this.length).map(idx =>
          (this.values.get(idx) - this.values.get(idx - periods))).toList()),
      {index: this.index, name: this.name});
  }

  /**
   * Return the percentage change over a given number of periods
   *
   * pandas equivalent: [Series.pct_change](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.pct_change.html)
   *
   * @param {number} periods=1
   *  Number of periods to use for percentage change calculation
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4, 5], {name: 'New Series'})
   *
   * ds.pct_change(1)    // Series([null, 1, 0.5, 0.333, 0.25], {name: 'New Series'})
   * ds.pct_change(2)    // Series([null, null, 2, 1, 0.66666], {name: 'New Series'})
   */
  pct_change(periods: number = 1): Series {
    if (typeof periods !== 'number' || !Number.isInteger(periods))
      throw new Error('periods must be an integer');
    if (periods <= 0)
      throw new Error('periods must be positive');

    return new Series(
      Immutable.Repeat(null, periods).toList().concat(
        Immutable.Range(periods, this.length).map(idx =>
          (this.values.get(idx) / this.values.get(idx - periods)) - 1).toList()),
      {index: this.index, name: this.name});
  }

  _sort_ascending(valueA: number, valueB: number) {
    const valA = this.iloc(valueA);
    const valB = this.iloc(valueB);

    // $FlowFixMe
    if (valA < valB) return -1;
    // $FlowFixMe
    else if (valA > valB) return 1;
    return 0;
  }

  _sort_descending(valueA: number, valueB: number) {
    const valA = this.iloc(valueA);
    const valB = this.iloc(valueB);

    // $FlowFixMe
    if (valA > valB) return -1;
    // $FlowFixMe
    else if (valA < valB) return 1;
    return 0;
  }

  /**
   * Return a sorted `Series` in either ascending or descending order
   *
   * pandas equivalent: [Series.sort_values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.sort_values.html)
   *
   * @param {boolean} ascending
   *    Sort in ascending (true) or descending (false) order
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([2, 1, 0, 3], {name: 'New Series', index: [0, 1, 2, 3]})
   *
   * ds.sort_values(true)    // Series([0, 1, 2, 3], {name: 'New Series', index: [2, 1, 0, 3]})
   * ds.sort_values(false)   // Series([3, 2, 1, 0], {name: 'New Series', index: [3, 0, 1, 2]})
   */
  sort_values(ascending: boolean = true): Series {
    const sortedIndex = ascending
      ? this.index.sort(this._sort_ascending)
      : this.index.sort(this._sort_descending);

    return new Series(sortedIndex.map(i => this.iloc(i)), {name: this.name, index: sortedIndex});
  }

  /**
   * Return a `Series` with all values rounded to the nearest precision specified by decimals
   *
   * pandas equivalent: [Series.round](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.round.html)
   *
   * @param {number} decimals=0
   *  Number of decimals to round to
   *
   * @example
   * const ds = new Series([1.25, 1.47, 1.321])
   *
   * // Returns Series([1.3, 1.5, 1.3])
   * ds.round(1);
   */
  round(decimals: number = 0): Series {
    return new Series(this.values.map(v => round10(v, -1 * decimals)));
  }

  // Filtering methods

  _alignSeries(series: Series): Immutable.Map {
    // Align two series by index values, returning a Map with index values as keys and
    // values as Maps with 1: List [value locations at index], 2: [value locations at index]

    let seriesAlignment = Immutable.Map({});

    this.index.forEach((idx1) => {
      if (!(seriesAlignment.has(idx1))) {
        seriesAlignment = seriesAlignment
          .set(idx1, Immutable.Map({
            first: Immutable.List.of(this.iloc(idx1)),
            second: Immutable.List([]),
          }));
      } else {
        seriesAlignment = seriesAlignment.updateIn([idx1, 'first'], l => l.concat(this.iloc(idx1)));
      }
    });

    series.index.forEach((idx2) => {
      if (!(seriesAlignment.has(idx2))) {
        seriesAlignment = seriesAlignment
          .set(idx2, Immutable.Map({
            first: Immutable.List([]),
            second: Immutable.List.of(series.iloc(idx2)),
          }));
      } else {
        seriesAlignment = seriesAlignment.updateIn([idx2, 'second'],
          l => l.concat(series.iloc(idx2)));
      }
    });

    return seriesAlignment;
  }

  /**
   * Flexible comparison of an iterable or value to the `Series`. Returns a `Series` of booleans of
   * equivalent length
   *
   * pandas equivalent: [Series.where](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.where.html)
   *
   * @param {Series|Array|List|string|number} other
   *  Iterable or value compared to Series
   * @param {function} op
   *  Function which takes (a, b) values and returns a boolean
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([true, false, false])
   * ds.where(1, (v1, v2) => v1 === 1);
   *
   * // Returns Series([false, true, true])
   * ds.where(new Series([0, 2, 3]), (v1, v2) => v1 === v2);
   */
  where(other: any, op: T_BF) {
    const name = this.name;
    const index = this.index;
    const kwargs = {name, index};

    if (!(Array.isArray(other)) && !(other instanceof Immutable.List) && !(other instanceof Series))
      return new Series(this.values.map(v => op(v, other)), kwargs);

    if (Array.isArray(other)) {
      if (other.length !== this.length) throw new Error('Must be equal length for comparison');
      return new Series(this.values.map((v, idx) => op(v, other[idx])), kwargs);
    } else if (other instanceof Immutable.List) {
      if (other.size !== this.length) throw new Error('Must be equal length for comparison');
      return new Series(this.values.map((v, idx) => op(v, other.get(idx))), kwargs);
    } else if (other instanceof Series) {
      if (other.length !== this.length) throw new Error('Must be equal length for comparison');
      return new Series(this.values.map((v, idx) => op(v, other.iloc(idx))), kwargs);
    }

    throw new Error('Must be scalar value, Array, Series, or Immutable.List');
  }

  /**
   * Equal to of `Series` and other, element wise
   *
   * pandas equivalent: Series == val
   *
   * @param {Series|Array|List|number|string} other
   *    Other `Series` or scalar value to check for equality
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([true, false, false])
   * ds.eq(1);
   *
   * // Returns Series([false, true, true])
   * ds.eq(new Series([0, 2, 3]));
   *
   * // Returns Series([false, true, true])
   * ds.eq(Immutable.List([0, 2, 3]));
   *
   * // Returns Series([false, true, true])
   * ds.eq([0, 2, 3]);
   */
  eq(other: any): Series {
    return this.where(other, (a, b) => a === b);
  }

  /**
   * Less than of `Series` and other, element wise
   *
   * pandas equivalent: Series < val
   *
   * @param {Series|Array|List|number|string} other
   *    Other `Series` or scalar value to check for less than
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([false, false, false])
   * ds.lt(1);
   *
   * // Returns Series([false, false, true])
   * ds.lt(new Series([0, 2, 4]));
   *
   * // Returns Series([false, false, true])
   * ds.lt(Immutable.List([0, 2, 5]));
   *
   * // Returns Series([false, false, true])
   * ds.lt([0, 2, 5]);
   */
  lt(other: any): Series {
    return this.where(other, (a, b) => a < b);
  }

  /**
   * Less than or equal to of `Series` and other, element wise
   *
   * pandas equivalent: Series <= val
   *
   * @param {Series|Array|List|number|string} other
   *    Other `Series` or scalar value to check for less than or equal to
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([false, false, false])
   * ds.lte(1);
   *
   * // Returns Series([false, false, true])
   * ds.lte(new Series([0, 2, 4]));
   *
   * // Returns Series([false, false, true])
   * ds.lte(Immutable.List([0, 2, 5]));
   *
   * // Returns Series([false, false, true])
   * ds.lte([0, 2, 5]);
   */
  lte(other: any): Series {
    return this.where(other, (a, b) => a <= b);
  }

  /**
   * Greater than of `Series` and other, element wise
   *
   * pandas equivalent: Series > val
   *
   * @param {Series|Array|List|number|string} other
   *    Other `Series` or scalar value to check for greater than
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([false, true, true])
   * ds.gt(1);
   *
   * // Returns Series([true, false, false])
   * ds.gt(new Series([0, 2, 3]));
   *
   * // Returns Series([true, false, false])
   * ds.gt(Immutable.List([0, 2, 3]));
   *
   * // Returns Series([true, false, false])
   * ds.gt([0, 2, 3]);
   */
  gt(other: any): Series {
    return this.where(other, (a, b) => a > b);
  }

  /**
   * Greater than or equal to of `Series` and other, element wise
   *
   * pandas equivalent: Series >= val
   *
   * @param {Series|Array|List|number|string} other
   *    Other `Series` or scalar value to check for greater than or equal to
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'})
   *
   * // Returns Series([true, true, true])
   * ds.gte(1);
   *
   * // Returns Series([true, true, false])
   * ds.gte(new Series([0, 2, 4]));
   *
   * // Returns Series([true, true, false])
   * ds.gte(Immutable.List([0, 2, 4]));
   *
   * // Returns Series([true, true, false])
   * ds.gte([0, 2, 4]);
   */
  gte(other: any): Series {
    return this.where(other, (a, b) => a >= b);
  }

  /**
   * Returns a boolean same-sized Series indicating if the values are not null
   *
   * pandas equivalent: [Series.notnull](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.notnull.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, null, null, 4]);
   *
   * // Returns Series([true, true, false, false, true])
   * ds.notnull();
   */
  notnull(): Series {
    return this.where(null, (a, b) => a !== b);
  }

  /**
   * Shift index by desired number of periods
   *
   * pandas equivalent:s [Series.shift](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.shift.html)
   *
   * @param {number} periods
   *  Number of periods to move, can be positive or negative
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3, 4]);
   *
   * // Returns Series([null, 1, 2, 3]);
   * ds.shift(1);
   *
   * // Returns Series([null, null, 1, 2]);
   * ds.shift(2);
   *
   * // Returns Series([3, 4, null, null]);
   * ds.shift(-2);
   */
  shift(periods: number = 1): Series {
    if (!Number.isInteger(periods)) throw new Error('periods must be an integer');

    if (periods === 0) {
      return this.copy();
    } else if (periods < 0) {
      const absPeriods = Math.abs(periods);

      if (absPeriods > this.length) throw new Error('Periods greater than length of Series');

      const values = this.values.slice(absPeriods, this.length)
        .concat(Immutable.Repeat(null, absPeriods).toList());

      return new Series(values, {name: this.name, index: this.index});
    }

    // periods > 0
    if (periods > this.length) throw new Error('Periods greater than length of Series');

    const values = Immutable.Repeat(null, periods).toList()
      .concat(this.values.slice(0, this.length - periods));

    return new Series(values, {name: this.name, index: this.index});
  }

  /**
   * Returns `Immutable.List` of unique values in the `Series`. Preserves order of the original
   *
   * pandas equivalent: [Series.unique](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.unique.html)
   *
   * @returns {List}
   *
   * @example
   * const ds = new Series(['foo', 'bar', 'bar', 'foo', 'foo', 'test', 'bar', 'hi']);
   * // Returns ['foo', 'bar', 'test', 'hi']
   * ds.unique();
   */
  unique(): Immutable.List {
    return this.values.toSet().toList();
  }

  /**
   * Filter the Series by an Iterable (Series, Array, or List) of booleans and return the subset
   *
   * pandas equivalent: series[series condition]
   *
   * @param {Series|Array|List} iterBool
   *    Iterable of booleans
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3]);
   *
   * // Returns Series([2, 3]);
   * ds.filter(ds.gte(2));
   */
  filter(iterBool: Series | Array<boolean> | Immutable.List): Series {
    if (!Array.isArray(iterBool)
      && !(iterBool instanceof Immutable.List)
      && !(iterBool instanceof Series))
      throw new Error('filter must be an Array, List, or Series');

    const valueIndexMap = {values: [], index: []};
    if (iterBool instanceof Series)
      iterBool.values.forEach((v, idx) => {
        if (v === true) {
          valueIndexMap.values.push(this.values.get(idx));
          valueIndexMap.index.push(this.index.get(idx));
        }
      });
    else {
      iterBool.forEach((v, idx) => {
        if (v === true) {
          valueIndexMap.values.push(this.values.get(idx));
          valueIndexMap.index.push(this.index.get(idx));
        }
      });
    }

    return new Series(valueIndexMap.values, {name: this.name, index: valueIndexMap.index});
  }

  _cumulativeHelper(operation: string = OP_CUMSUM): Series {
    return new Series(generateCumulativeFunc(operation)(this.values), this.kwargs);
  }

  /**
   * Return cumulative sum over requested axis
   *
   * pandas equivalent: [Series.cumsum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cumsum.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
   *
   * // Returns Series([1, 3, 6], {index: [2, 3, 4]});
   * ds.cumsum();
   */
  cumsum(): Series {
    return this._cumulativeHelper(OP_CUMSUM);
  }

  /**
   * Return cumulative mul over requested axis
   *
   * pandas equivalent: [Series.cummul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummul.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
   *
   * // Returns Series([1, 2, 6], {index: [2, 3, 4]});
   * ds.cummul();
   */
  cummul(): Series {
    return this._cumulativeHelper(OP_CUMMUL);
  }

  /**
   * Return cumulative max over requested axis
   *
   * pandas equivalent: [Series.cummax](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummax.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([3, 2, 4], {index: [2, 3, 4]});
   *
   * // Returns Series([3, 3, 4], {index: [2, 3, 4]});
   * ds.cummax();
   */
  cummax(): Series {
    return this._cumulativeHelper(OP_CUMMAX);
  }

  /**
   * Return cumulative min over requested axis
   *
   * pandas equivalent: [Series.cummin](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.cummin.html)
   *
   * @returns {Series}
   *
   * @example
   * const ds = new Series([1, 2, 3], {index: [2, 3, 4]});
   *
   * // Returns Series([1, 1, 1], {index: [2, 3, 4]});
   * ds.cummin();
   */
  cummin(): Series {
    return this._cumulativeHelper(OP_CUMMIN);
  }

  /**
   * Convert the Series to a json object
   *
   * pandas equivalent: [Series.to_json](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.to_json.html)
   *
   * @param kwargs
   * @param {string} [kwargs.orient=columns] orientation of JSON
   *
   * @returns {*}
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'x'});
   *
   * // Returns {0: 1, 1: 2, 2: 3}
   * ds.to_json();
   *
   * // Returns [1, 2, 3]
   * ds.to_json({orient: 'records'});
   *
   * // Returns {index: [0, 1, 2], name: 'x', values: [1, 2, 3]}
   * ds.to_json({orient: 'split'});
   */
  to_json(kwargs: Object = {orient: 'index'}): Object {
    const ALLOWED_ORIENT = ['records', 'split', 'index'];
    let orient = 'index';

    if (typeof kwargs.orient !== 'undefined') {
      if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0) // $FlowFixMe TODO
        throw new TypeError(`orient must be in ${ALLOWED_ORIENT}`);
      orient = kwargs.orient;
    }

    let json;
    switch (orient) {
      case 'records':
        return this.values.toArray();
      case 'split':
        return {index: this.index.toArray(), name: this.name, values: this.values.toJS()};
      case 'index':
        json = {};
        this.values.forEach((v, idx) => {
          json[this.index.get(idx)] = v;
        });
        return json;
      default:
        // $FlowFixMe TODO
        throw new TypeError(`orient must be in ${ALLOWED_ORIENT}`);
    }
  }

  /**
   * Rename the `Series` and return a new `Series`
   *
   * pandas equivalent: [Series.rename](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.rename.html)
   *
   * @param {string} name
   *
   * @example
   * const ds = new Series([1, 2, 3], {name: 'Test name'});
   * ds.rename('New test name');
   * // returns 'New test name'
   * ds.name;
   */
  rename(name: string | number): Series {
    return new Series(this._values, {name, index: this.index});
  }

  /**
   * Append another Series to this and return a new Series
   *
   * pandas equivalent: [Series.append](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.append.html)
   *
   * @param {Series} other
   * @param {boolean} ignore_index
   * @returns {Series}
   *
   * @example
   * const ds1 = new Series([1, 2, 3], {index: [1, 2, 3]});
   * const ds2 = new Series([2, 3, 4], {index: [3, 4, 5]});
   *
   * // Returns Series([1, 2, 3, 2, 3, 4], {index: [1, 2, 3, 3, 4, 5]});
   * ds1.append(ds2);
   *
   * // Returns Series([1, 2, 3, 2, 3, 4], {index: [0, 1, 2, 3, 4, 5]});
   * ds1.append(ds2, true);
   */
  append(other: Series, ignore_index: boolean = false): Series {
    // eslint-disable-next-line
    return _concatSeries( // $FlowFixMe
      [this, other],
      {ignore_index});
  }
}


type T_ITER_SERIES = Array<Series> | Immutable.List<Series>;
type T_KWARGS = {ignore_index: boolean, axis?: 0 | 1};
const _concatSeriesValues = (objs: T_ITER_SERIES) =>
  Immutable.List([]).concat(...objs.map(series => series.values));
const _concatSeriesIndices = (objs: T_ITER_SERIES) =>
  Immutable.List([]).concat(...objs.map(series => series.index));

export const _concatSeries = (objs: Array<Series> | Immutable.List<Series>,
                              kwargs: T_KWARGS): Series => {
  if (objs instanceof Immutable.List
    && objs.filter(series => series instanceof Series).size !== objs.size)
    throw new Error('Objects must all be Series');
  else if (Array.isArray(objs)
    && objs.filter(series => series instanceof Series).length !== objs.length)
    throw new Error('Objects must all be Series');

  if (!kwargs.ignore_index)
    return new Series(_concatSeriesValues(objs), {index: _concatSeriesIndices(objs)});
  else if (kwargs.ignore_index) {
    return new Series(
      _concatSeriesValues(objs),
      {index: Immutable.Range(0, objs.reduce((a, b: Series) => a + b.length, 0)).toList()});
  }

  throw new Error('Not supported');
};
