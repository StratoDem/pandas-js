
import Immutable from 'immutable';

import { sum } from './utils';
import * as dtype from './dtype';


export class Series {
  /**
   * One dimensional array with axis labels
   *
   * Operations between Series (+, -, /, *, **) align values based on their associated index values
   *
   * @param data {Array|Object}
   *    Data to be stored in Series
   * @param {Object} kwargs
   *    Extra optional arguments for a Series
   * @param {string} [kwargs.name='']
   *    The _name to assign to the Series
   * @param {Array|Object} [kwargs.index]
   */
  constructor(data = null, kwargs = {}) {
    if (Array.isArray(data)) {
      this._data = Immutable.List(data);
      this._dtype = dtype.arrayToDType(data);
    } else if (data instanceof Immutable.List) {
      this._data = data;
      this._dtype = dtype.arrayToDType(data);
    } else {
      this._data = Immutable.List.of(data);
    }

    this._name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';
    this._index = kwargs.index;
  }

  [Symbol.iterator]() {
    const values = this._data;
    let index = -1;

    return {
      next: () => {
        index += 1;
        return {value: values.get(index), done: !(index >= 0 && index < values.size)};
      },
    };
  };

  get dtype() {
    return this._dtype;
  }

  get index() {
    return this._index;
  }

  get length() {
    return this._data.size;
  }

  get loc() {
    throw 'loc not implemented!';
  }

  get iloc() {
    throw 'iloc not implemented!';
  }

  get values() {
    return this._data;
  }

  /**
   * Convert the series to the desired type
   *
   * @param {DType} nextType
   */
  astype(nextType) {
    if (!(nextType instanceof dtype.DType))
      throw new Error('Next type must be a DType');

    if (nextType.dtype === this.dtype)
      return this;

    switch (nextType.dtype) {
      case 'int':
        if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to int');
        return new Series(this.values.map(v => Math.floor(v)), {name: this._name, index: this.index});
      case 'float':
        if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to float');
        return this;
      default:
        throw new Error(`Invalid dtype ${nextType}`);
    }
  }

  sum() {
    return sum(this._data);
  }

  mean() {
    return this.sum() / this.length;
  }

  std() {
    const mean = this.mean();

    let meanSqDiff = 0;
    this._data.forEach((v) => {
      const diff = v - mean;
      meanSqDiff += ((diff * diff) / this.length);
    });

    return Math.sqrt(meanSqDiff);
  }

  /**
   * Add another Iterable, Series, or number to the Series
   * @param {Iterable|Series|number} val
   *
   * @returns {Series}
   */
  plus(val) {
    if (typeof val === 'number')
      return new Series(this._data.map(v => v + val));
    else if (val instanceof Series)
      return new Series(this._data.map((v, idx) => v + val.values.get(idx)));
    else if (Array.isArray(val))
      return new Series(this._data.map((v, idx) => v + val[idx]));
    else if (val instanceof Immutable.List)
      return new Series(this._data.map((v, idx) => v + val.get(idx)));

    throw new Error('plus only supports numbers, Arrays, Immutable List and pandas.Series');
  }

  /**
   * Subtract another Iterable, Series, or number from the Series
   *
   * @param {Iterable|Series|number} val
   *
   * @returns {Series}
   */
  minus(val) {
    if (typeof val === 'number')
      return new Series(this._data.map(v => v - val));
    else if (val instanceof Series)
      return new Series(this._data.map((v, idx) => v - val.values.get(idx)));
    else if (Array.isArray(val))
      return new Series(this._data.map((v, idx) => v - val[idx]));
    else if (val instanceof Immutable.List)
      return new Series(this._data.map((v, idx) => v - val.get(idx)));

    throw new Error('minus only supports numbers, Arrays, Immutable List and pandas.Series');
  }

  /**
   * Multiply by another Iterable, Series, or number
   *
   * @param {Iterable|Series|number} val
   *
   * @returns {Series}
   */
  times(val) {
    if (typeof val === 'number')
      return new Series(this._data.map(v => v * val));
    else if (val instanceof Series)
      return new Series(this._data.map((v, idx) => v * val.values.get(idx)));
    else if (Array.isArray(val))
      return new Series(this._data.map((v, idx) => v * val[idx]));
    else if (val instanceof Immutable.List)
      return new Series(this._data.map((v, idx) => v * val.get(idx)));

    throw new Error('plus only supports numbers, Arrays, Immutable List and pandas.Series');
  }

  /**
   * Divide by another Iterable, Series, or number
   *
   * @param {Iterable|Series|number} val
   *
   * @returns {Series}
   */
  dividedBy(val) {
    if (typeof val === 'number')
      return new Series(this._data.map(v => v / val));
    else if (val instanceof Series)
      return new Series(this._data.map((v, idx) => v / val.values.get(idx)));
    else if (Array.isArray(val))
      return new Series(this._data.map((v, idx) => v / val[idx]));
    else if (val instanceof Immutable.List)
      return new Series(this._data.map((v, idx) => v / val.get(idx)));

    throw new Error('minus only supports numbers, Arrays, Immutable List and pandas.Series');
  }
}
