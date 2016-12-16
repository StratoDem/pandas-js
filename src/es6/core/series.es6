
import Immutable from 'immutable';

import { sum } from './utils';
import * as dtype from './dtype';


export class Series {
  /**
   * One dimensional array with axis labels
   *
   * Operations between Series (+, -, /, *, **) align values based on their associated index values
   *
   * @param {Array|Object} data
   *    Data to be stored in Series
   * @param {Array|Object} index
   *    Values must be unique, with the same length as _data
   * @param {string} name
   *    Name of the pandas.Series
   */
  constructor(data = null, index = null, name = '') {
    if (Array.isArray(data)) {
      this._data = Immutable.List(data);
      this._dtype = dtype.arrayToDType(data);
    } else if (data instanceof Immutable.List) {
      this._data = data;
      this._dtype = dtype.arrayToDType(data);
    } else {
      this._data = Immutable.List.of(data);
    }

    this.name = name;
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

  astype() {
    throw new Object('astype not implemented');
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
