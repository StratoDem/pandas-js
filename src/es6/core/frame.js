
import Immutable from 'immutable';

import { InvalidAxisError } from './exceptions';
import NDFrame from './generic';
import Series from './series';
import { enumerate, nonMergeColumns, intersectingColumns, parseIndex } from './utils';


const parseArrayToSeriesMap = (array, index) => {
  const dataMap = {};

  array.forEach((el) => {
    if (typeof el === 'object') {
      Object.keys(el).forEach((k) => {
        if (k in dataMap) {
          dataMap[k] = dataMap[k].push(el[k]);
        } else {
          dataMap[k] = Immutable.List.of(el[k]);
        }
      });
    }
  });

  Object.keys(dataMap).forEach((k) => {
    dataMap[k] = new Series(dataMap[k], {name: k, index});
  });

  return Immutable.Map(dataMap);
};

export default class DataFrame extends NDFrame {
  /**
   * Two-dimensional size-mutable, potentially heterogeneous tabular data
   * structure with labeled axes (rows and columns). Arithmetic operations
   * align on both row and column labels. Can be thought of as a Immutable.Map-like
   * container for Series objects. The primary pandas data structure
   *
   * @param data {Array|Object}
   *    Data to be stored in DataFrame
   * @param {Object} kwargs
   *    Extra optional arguments for a DataFrame
   * @param {Array|Object} [kwargs.index]
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}])
   *
   * // Returns:
   * //    x  |  y
   * // 0  1  |  2
   * // 1  2  |  3
   * // 2  3  |  4
   * df.toString();
   */
  constructor(data, kwargs = {}) {
    super(data, kwargs);

    if (Array.isArray(data)) {
      this.set_axis(0, parseIndex(kwargs.index, Immutable.List(data)));
      this._data = parseArrayToSeriesMap(data, this.index);
      this.set_axis(1, this._data.keySeq());
    } else if (data instanceof Immutable.Map) {
      this._data = Immutable.Map(data.keySeq().map((k) => {
        if (!(data.get(k) instanceof Series))
          throw new Error('Map must have [column, series] key-value pairs');

        return [k, data.get(k).copy()];
      }));
      this.set_axis(1, this._data.keySeq());
      this.set_axis(0, this._data.get(this.columns.get(0)).index);
    } else if (typeof data === 'undefined') {
      this._data = Immutable.Map({});
      this.set_axis(0, Immutable.List.of());
      this.set_axis(1, Immutable.Seq.of());
    }

    // TODO this is a slow operation
    let valuesList = Immutable.List([]);
    for (let idx = 0; idx < this.length; idx += 1) {
      valuesList = valuesList.concat(
        [Immutable.List(this.columns.map(k => this._data.get(k).iloc(idx)))]);
    }
    this._values = valuesList;
    this._setup_axes(Immutable.List.of(0, 1));
  }

  toString() {
    let string = '\t|';
    this.columns.forEach((k) => { string += `  ${k}  |`; });
    const headerRow = '-'.repeat(string.length);

    string += `\n${headerRow}\n`;

    const stringUpdate = (idx) => {
      let s = '';
      this.columns.forEach((k) => { s += `  ${this._data.get(k).iloc(idx)}  |`; });
      return s;
    };

    for (let idx = 0; idx < this.length; idx += 1) {
      string += `${this.index.get(idx)}\t|`;
      string += stringUpdate(idx);
      string += '\n';
    }

    return string;
  }

  /**
   * Return a new deep copy of the `DataFrame`
   *
   * pandas equivalent: [DataFrame.copy](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.copy.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   * const df2 = df.copy();
   * df2.index = [1, 2, 3];
   * df.index   // [0, 1, 2];
   * df2.index  // [1, 2, 3];
   */
  copy() {
    return new DataFrame(this._data, {index: this.index});
  }

  kwargs() {
    this.kwargs = {
      index: this.index,
    };
  }

  [Symbol.iterator]() {
    let index = -1;

    return {
      next: () => {
        index += 1;
        const done = !(index >= 0 && index < this.length);
        const value = done
          ? undefined
          : Immutable.Map(this.columns.map((k, idx) => [k, this.values.get(index).get(idx)]));
        return {value, done};
      },
    };
  }

  /**
   * A generator which returns [row, index location] tuples
   *
   * pandas equivalent: [DataFrame.iterrows](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.iterrows.html)
   *
   * @returns {*}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Logs 2 4 6
   * for(const [row, idx] of df) {
   *   console.log(row.get('x') * 2);
   * }
   */
  iterrows() {
    return enumerate(this);
  }

  /**
   * Immutable.List of Immutable.List, with [row][column] indexing
   *
   * pandas equivalent: [DataFrame.values](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.values.html)
   *
   * @returns {List.<List>}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns List [ List[1, 2, 3], List[2, 3, 4]]
   * df.values;
   */
  get values() {
    return super.values;
  }

  /**
   * Returns the indexed Immutable.Seq of columns
   *
   * pandas equivalent: [DataFrame.columns](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.columns.html)
   *
   * @returns {Seq.Indexed<string>}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns Seq ['x', 'y']
   * df.columns;
   */
  get columns() {
    return this._get_axis(1);
  }

  /**
   * Sets columns
   *
   * pandas equivalent: [DataFrame.columns](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.columns.html)
   *
   * @param {Array} columns
   *    Next column names
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * df.columns = ['a', 'b'];
   * // Returns Seq ['a', 'b']
   * df.columns;
   */
  set columns(columns) {
    if (!Array.isArray(columns) || columns.length !== this.columns.size)
      throw new Error('Columns must be array of same dimension');

    const nextData = {};
    columns.forEach((k, idx) => {
      const prevColumn = this.columns.get(idx);
      const prevSeries = this.get(prevColumn);

      prevSeries.name = k;
      nextData[k] = prevSeries;
    });

    this._data = Immutable.Map(nextData);
    this.set_axis(1, Immutable.Seq(columns));
  }

  /**
   * Return the index values of the `DataFrame`
   *
   * @returns {List}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns List [0, 1, 2, 3]
   * df.index;
   */
  get index() {
    return this._get_axis(0);
  }

  /**
   * Set the index values of the `DataFrame`
   *
   * @param {List|Array} index
   *    Next index values
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns List [0, 1, 2, 3]
   * df.index;
   * df.index = Immutable.List([2, 3, 4, 5]);
   * // Returns List [2, 3, 4, 5]
   * df.index;
   */
  set index(index) {
    this.set_axis(0, parseIndex(index, this._data.get(this.columns.get(0)).values));

    // noinspection Eslint
    this._data.mapEntries(([k, v]) => { // noinspection Eslint
      v.index = this.index;
    });
  }

  /**
   * Return the length of the `DataFrame`
   *
   * pandas equivalent: len(df);
   *
   * @returns {number}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns 3
   * df.length;
   */
  get length() {
    return Math.max(...this._data.keySeq().map(k => this.get(k).length).toArray());
  }

  columnExists(col) {
    return this.columns.indexOf(col) >= 0;
  }

  /**
   * Return the `Series` at the column
   *
   * pandas equivalent: df['column_name']
   *
   * @param {string} columns
   *    Name of the column to retrieve
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns Series([1, 2, 3], {name: 'x', index: [0, 1, 2]})
   * df.get('x');
   */
  get(columns) {
    if ((typeof columns === 'string' || typeof columns === 'number') && this.columnExists(columns))
      return this._data.get(columns);
    throw new Error(`KeyError: ${columns} not found`);
  }

  /**
   * Return an object of same shape as self and whose corresponding entries are from self
   * where cond is True and otherwise are from other.
   *
   * pandas equivalent [DataFrame.where](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.where.html)
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Iterable or value to compare to DataFrame
   * @param {function} op
   *  Function which takes (a, b) values and returns a boolean
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}]);
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
   * df.where(new Series([1, 3]), (a, b) => a === b);
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
   * df.where(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([3, 3])})),
   *    (a, b) => a === b);
   */
  where(other, op) {
    if (!(Array.isArray(other))
      && !(other instanceof Immutable.List)
      && !(other instanceof Series)
      && !(other instanceof DataFrame)) {
      // noinspection Eslint
      return new DataFrame(Immutable.Map(this._data.mapEntries(([k, v]) => {
        return [k, v.where(other, op)];
      })));
    } else if (Array.isArray(other) || other instanceof Series || other instanceof Immutable.List) {
      if ((Array.isArray(other) || other instanceof Series) && other.length !== this.length)
        throw new Error('Array or Series must be same length as DataFrame');
      if (other instanceof Immutable.List && other.size !== this.length)
        throw new Error('Immutable List must be same size as DataFrame');
      // noinspection Eslint
      return new DataFrame(Immutable.Map(this._data.mapEntries(([k, v]) => {
        return [k, v.where(other, op)];
      })));
    } else if (other instanceof DataFrame) {
      if (!other.shape.equals(this.shape))
        throw new Error('DataFrame must have the same shape');
      // noinspection Eslint
      return new DataFrame(Immutable.Map(this._data.mapEntries(([k, v], idx) => {
        return [k, v.where(other.get(other.columns.get(idx)), op)];
      })));
    }

    throw new Error('Unsupported comparison value, or non-matching lengths');
  }

  /**
   * Equal to `DataFrame` and other, element wise
   *
   * pandas equivalent: df == val
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Other Iterable or scalar value to check for equal to
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, true])})
   * df.eq(new Series([1, 3]));
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, false])})
   * df.gt(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([1, 2])})));
   */
  eq(other) {
    return this.where(other, (a, b) => a === b);
  }

  /**
   * Greater than of `DataFrame` and other, element wise
   *
   * pandas equivalent: df > val
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Other Iterable or scalar value to check for greater than
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Map({x: Series([false, false]), y: Series([true, false])})
   * df.gt(new Series([1, 3]));
   *
   * // Returns DataFrame(Map({x: Series([false, true]), y: Series([true, true])})
   * df.gt(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([1, 2])})));
   */
  gt(other) {
    return this.where(other, (a, b) => a > b);
  }

  /**
   * Greater than or equal to of `DataFrame` and other, element wise
   *
   * pandas equivalent: df >= val
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Other Iterable or scalar value to check for greater than or equal to
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([true, true])})
   * df.gte(new Series([1, 3]));
   *
   * // Returns DataFrame(Map({x: Series([true, true]), y: Series([true, true])})
   * df.gte(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([1, 2])})));
   */
  gte(other) {
    return this.where(other, (a, b) => a >= b);
  }

  /**
   * Less than of `DataFrame` and other, element wise
   *
   * pandas equivalent: df < val
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Other Iterable or scalar value to check for less than
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Map({x: Series([false, true]), y: Series([false, false])})
   * df.lt(new Series([1, 3]));
   *
   * // Returns DataFrame(Map({x: Series([false, false]), y: Series([false, false])})
   * df.lt(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([1, 2])})));
   */
  lt(other) {
    return this.where(other, (a, b) => a < b);
  }

  /**
   * Less than or equal to of `DataFrame` and other, element wise
   *
   * pandas equivalent: df <= val
   *
   * @param {Array|List|Series|DataFrame|number|string} other
   *  Other Iterable or scalar value to check for less than or equal to
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Map({x: Series([true, true]), y: Series([false, true])})
   * df.lte(new Series([1, 3]));
   *
   * // Returns DataFrame(Map({x: Series([true, false]), y: Series([false, false])})
   * df.lte(new DataFrame(Map({
   *    a: new Series([1, 1]),
   *    b: new Series([1, 2])})));
   */
  lte(other) {
    return this.where(other, (a, b) => a <= b);
  }

  /**
   * Merge this `DataFrame` with another `DataFrame`, optionally on some set of columns
   *
   * pandas equivalent: `DataFrame.merge`
   *
   * @param {DataFrame} df
   *    `DataFrame` with which to merge this `DataFrame`
   * @param {Array} on
   *    Array of columns on which to merge
   * @param {string} how='inner'
   *    Merge method, either 'inner' or 'outer'
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   * const df2 = new DataFrame([{x: 1, z: 3}, {x: 3, z: 5}, {x: 2, z: 10}]);
   *
   * // Returns
   * //    x  |  y  |  z
   * // 0  1  |  2  |  3
   * // 1  2  |  3  |  10
   * // 2  3  |  4  |  5
   * df.merge(df2, ['x'], 'inner');
   */
  merge(df, on, how = 'inner') {
    return mergeDataFrame(this, df, on, how);
  }

  /**
   * Convert the `DataFrame` to a csv string
   *
   * pandas equivalent: [DataFrame.to_csv](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.to_csv.html)
   *
   * @returns {string}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns x,y,\r\n1,2,\r\n2,3\r\n3,4\r\n
   * df.to_csv();
   */
  to_csv() {
    let csvString = '';
    this.columns.forEach((k) => {
      csvString += `${k},`;
    });
    csvString += '\r\n';

    const updateString = (idx) => {
      let s = '';
      this.columns.forEach((k) => { s += `${this.get(k).iloc(idx)},`; });
      return s;
    };
    for (let idx = 0; idx < this.length; idx += 1) {
      csvString += updateString(idx);
      csvString += '\r\n';
    }

    return csvString;
  }

  /**
   * Return the sum of the values in the `DataFrame` along the axis
   *
   * pandas equivalent: [DataFrame.sum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.sum.html)
   *
   * @param {number} axis=0
   *    Axis along which to sum values
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // x  6
   * // y  9
   * // Name: , dtype: dtype(int)
   * df.sum().toString();
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // 0  3
   * // 1  5
   * // 2  7
   * // Name: , dtype: dtype('int')
   * df.sum(1).toString();
   */
  sum(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).sum()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.values.get(idx).reduce((s, k) => s + k, 0)).toList(),
        {index: this.index});
    }

    throw new InvalidAxisError();
  }

  /**
   * Return the mean of the values in the `DataFrame` along the axis
   *
   * pandas equivalent: [DataFrame.mean](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.mean.html)
   *
   * @param {number} axis=0
   *    Axis along which to average values
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // x  2
   * // y  3
   * // Name: , dtype: dtype('int')
   * df.mean().toString();
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // 0  1.5
   * // 1  2.5
   * // 2  3.5
   * // Name: , dtype: dtype('float')
   * df.mean(1).toString();
   */
  mean(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).mean()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.values.get(idx).reduce((s, k) =>
            s + (k / this.columns.size), 0)).toList(),
          {index: this.index});
    }

    throw new InvalidAxisError();
  }

  /**
   * Return the standard deviation of the values in the `DataFrame` along the axis
   *
   * pandas equivalent: [DataFrame.std](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.std.html)
   *
   * @param {number} axis=0
   *    Axis along which to calculate the standard deviation
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // x  1
   * // y  1
   * // Name: , dtype: dtype('int')
   * df.std().toString();
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
   *
   * // Returns
   * // 0  0
   * // 1  0
   * // 2  0
   * // Name: , dtype: dtype('int')
   * df.std(1).toString();
   */
  std(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).std()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      return this.variance(axis).map(v => Math.sqrt(v));
    }

    throw new InvalidAxisError();
  }

  /**
   * Return the variance of the values in the `DataFrame` along the axis
   *
   * pandas equivalent: [DataFrame.var](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.var.html)
   *
   * @param {number} axis=0
   *    Axis along which to calculate the variance
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * // x  1
   * // y  1
   * // Name: , dtype: dtype('int')
   * df.std().toString();
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
   *
   * // Returns
   * // 0  0
   * // 1  0
   * // 2  0
   * // Name: , dtype: dtype('int')
   * df.std(1).toString();
   */
  variance(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).variance()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      const means = this.mean(axis).values;
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.values.get(idx).reduce((s, k) => {
            const diff = k - means.get(idx);
            return s + ((diff * diff) / (this.columns.size - 1));
          }, 0)).toArray(),
        {index: this.index});
    }

    throw new InvalidAxisError();
  }

  _pairwiseDataFrame(func) {
    // Apply the func between all Series in the DataFrame, takes two series and returns a value
    const valArray = [];

    // Calculate upper triangle
    for (let idx1 = 0; idx1 < this.columns.size; idx1 += 1) {
      valArray.push({});
      const ds1 = this.get(this.columns.get(idx1));

      for (let idx2 = idx1; idx2 < this.columns.size; idx2 += 1) {
        const col2 = this.columns.get(idx2);
        const ds2 = this.get(col2);
        valArray[idx1][col2] = func(ds1, ds2);
      }
    }

    // Take upper triangle and fill in lower triangle
    for (let idx1 = 0; idx1 < this.columns.size; idx1 += 1) {
        const col1 = this.columns.get(idx1);
      for (let idx2 = idx1 + 1; idx2 < this.columns.size; idx2 += 1) {
        const col2 = this.columns.get(idx2);
        valArray[idx2][col1] = valArray[idx1][col2];
      }
    }

    return new DataFrame(valArray, {index: this.columns.toList()});
  }

  /**
   * Calculate the covariance between all `Series` in the `DataFrame`
   *
   * pandas equivalent: [DataFrame.cov](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cov.html)
   *
   * @return {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);
   *
   * // Returns DataFrame([{x: 1, y: -1, z: 2}, {x: -1, y: 1, z: -2}, {x: 2, y: -2, z: 4}])
   * df.cov();
   */
  cov() {
    return this._pairwiseDataFrame((ds1, ds2) => ds1.cov(ds2));
  }

  /**
   * Calculate the correlation between all `Series` in the `DataFrame`
   *
   * pandas equivalent: [DataFrame.corr](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.corr.html)
   *
   * @return {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 1, z: 5}, {x: 3, y: 0, z: 7}]);
   *
   * // Returns DataFrame([{x: 1, y: -1, z: 1}, {x: -1, y: 1, z: -1}, {x: 1, y: -1, z: 1}])
   * df.corr();
   */
  corr() {
    // noinspection Eslint
    const corrFunc = (ds1, ds2) => {
      return ds1.values === ds2.values ? 1 : ds1.corr(ds2);
    };
    return this._pairwiseDataFrame(corrFunc);
  }

  /**
   * Return the difference over a given number of periods along the axis
   *
   * pandas equivalent: [DataFrame.diff](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.diff.html)
   *
   * @param {number} periods=1
   *    Number of periods to use for difference calculation
   * @param {number} axis=0
   *    Axis along which to calculate difference
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * //    x    |  y
   * // 0  null |  null
   * // 1  1    |  1
   * // 2  1  |  1
   * df.diff().toString();
   */
  diff(periods = 1, axis = 0) {
    if (typeof periods !== 'number' || !Number.isInteger(periods))
      throw new Error('periods must be an integer');
    if (periods <= 0)
      throw new Error('periods must be positive');

    if (axis === 0) {
      return new DataFrame(
        Immutable.Map(this.columns.map(k => [k, this._data.get(k).diff(periods)])),
        {index: this.index});
    } else if (axis === 1) {
      return new DataFrame(
        Immutable.Map(this.columns.map((k, idx) => {
          if (idx < periods)
            return [k, new Series(Immutable.Repeat(null, this.length).toList(),
              {name: k, index: this.index})];
          const compareCol = this.get(this.columns.get(idx - periods));
          return [k, this.get(k).map((v, vIdx) => v - compareCol.iloc(vIdx))];
        })), {index: this.index});
    }

    throw new InvalidAxisError();
  }

  /**
   * Return the percentage change over a given number of periods along the axis
   *
   * pandas equivalent: [DataFrame.pct_change](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.pct_change.html)
   *
   * @param {number} periods=1
   *    Number of periods to use for percentage change calculation
   * @param {number} axis=0
   *    Axis along which to calculate percentage change
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns
   * //    x    |  y
   * // 0  null |  null
   * // 1  1    |  0.5
   * // 2  0.5  |  0.3333
   * df.pct_change().toString();
   */
  pct_change(periods = 1, axis = 0) {
    if (typeof periods !== 'number' || !Number.isInteger(periods))
      throw new Error('periods must be an integer');
    if (periods <= 0)
      throw new Error('periods must be positive');

    if (axis === 0) {
      return new DataFrame(
        Immutable.Map(this.columns.map(k => [k, this._data.get(k).pct_change(periods)])),
        {index: this.index});
    } else if (axis === 1) {
      return new DataFrame(
        Immutable.Map(this.columns.map((k, idx) => {
          if (idx < periods)
            return [k, new Series(Immutable.Repeat(null, this.length).toList(),
              {name: k, index: this.index})];
          const compareCol = this.get(this.columns.get(idx - periods));
          return [k, this.get(k).map((v, vIdx) => (v / compareCol.iloc(vIdx)) - 1)];
        })), {index: this.index});
    }

    throw new InvalidAxisError();
  }

  /**
   * Filter the DataFrame by an Iterable (Series, Array, or List) of booleans and return the subset
   *
   * pandas equivalent: df[df condition]
   *
   * @param {Series|Array|List} iterBool
   *    Iterable of booleans
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame(Immutable.Map({x: new Series([1, 2]), y: new Series([2, 3])}));
   *
   * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
   * df.filter(df.get('x').gt(1));
   *
   * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
   * df.filter([false, true]);
   *
   * // Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
   * df.filter(Immutable.Map([false, true]));
   */
  filter(iterBool) {
    if (!Array.isArray(iterBool)
      && !(iterBool instanceof Immutable.List)
      && !(iterBool instanceof Series))
      throw new Error('filter must be an Array, List, or Series');

    if (Array.isArray(iterBool) && iterBool.length !== this.length)
      throw new Error('Array must be of equal length to DataFrame');
    else if (iterBool instanceof Immutable.List && iterBool.size !== this.length)
      throw new Error('List must be of equal length to DataFrame');
    else if (iterBool instanceof Series && iterBool.length !== this.length)
      throw new Error('Series must be of equal length to DataFrame');

    // noinspection Eslint
    return new DataFrame(Immutable.Map(this._data.mapEntries(([k, v]) => {
      return [k, v.filter(iterBool)];
    })));
  }
}

const innerMerge = (df1, df2, on) => {
  const data = [];

  const cols1 = nonMergeColumns(df1.columns, on);
  const cols2 = nonMergeColumns(df2.columns, on);

  const intersectCols = intersectingColumns(cols1, cols2);
  intersectCols.count();  // Cache intersectCols size

  const cols1Rename = cols1.map(k => (
    intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
    ? `${k}_x`
    : k));

  const cols2Rename = cols2.map(k => (
    intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
    ? `${k}_y`
    : k));

  for (const [row1, _1] of df1.iterrows()) {
    for (const [row2, _2] of df2.iterrows()) {
      let match = true;
      for (const c of on) {
        if (row1.get(c) !== row2.get(c)) {
          match = false;
          break;
        }
      }

      if (match) {
        const rowData = {};

        on.forEach((k) => {
          rowData[k] = row1.get(k);
        });

        cols1.forEach((k, idx) => {
          rowData[cols1Rename.get(idx)] = row1.get(k);
        });

        cols2.forEach((k, idx) => {
          rowData[cols2Rename.get(idx)] = row2.get(k);
        });

        data.push(rowData);
      }
    }
  }

  return new DataFrame(data);
};

const outerMerge = (df1, df2, on) => {
  const data = [];

  const cols1 = nonMergeColumns(df1.columns, on);
  const cols2 = nonMergeColumns(df2.columns, on);

  const intersectCols = intersectingColumns(cols1, cols2);
  intersectCols.count();  // Cache intersectCols size

  const matched1 = new Array(df1.length).fill(false);
  const matched2 = new Array(df2.length).fill(false);

  for (const [row1, idx_1] of df1.iterrows()) {
    for (const [row2, idx_2] of df2.iterrows()) {
      let match = true;
      for (const c of on) {
        if (row1.get(c) !== row2.get(c)) {
          match = false;
          break;
        }
      }
      const rowData = {};

      on.forEach((k) => {
        rowData[k] = row1.get(k);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = row1.get(k);
      });

      if (match) {
        cols2.forEach((k) => {
          const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_y`
            : k;
          rowData[nextColName] = row2.get(k);
        });
        data.push(rowData);
        matched1[idx_1] = true;
        matched2[idx_2] = true;
      }
    }
  }

  matched1.forEach((m, idx) => {
    if (!m) {
      const rowData = {};
      on.forEach((k) => {
        rowData[k] = df1.get(k).iloc(idx);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = df1.get(k).iloc(idx);
      });

      cols2.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_y`
          : k;
        rowData[nextColName] = null;
      });
      data.push(rowData);
    }
  });

  matched2.forEach((m, idx) => {
    if (!m) {
      const rowData = {};
      on.forEach((k) => {
        rowData[k] = df2.get(k).iloc(idx);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = null;
      });

      cols2.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_y`
          : k;
        rowData[nextColName] = df2.get(k).iloc(idx);
      });
      data.push(rowData);
    }
  });

  return new DataFrame(data);
};

export const mergeDataFrame = (df1, df2, on, how = 'inner') => {
  let mergeOn;
  if (typeof on === 'undefined') {
    mergeOn = df1.columns.filter(c1 => df2.columns.filter(c2 => c1 === c2).size > 0);
    if (mergeOn.size === 0)
      throw new Error('No common keys');
  } else {
    on.forEach((col) => {
      if (!df1.columnExists(col) || !df2.columnExists(col))
        throw new Error(`KeyError: ${col} not found`);
    });
    mergeOn = on;
  }

  switch (how) {
    case 'inner':
      return innerMerge(df1, df2, mergeOn);
    case 'outer':
      return outerMerge(df1, df2, mergeOn);
    default:
      throw new Error(`MergeError: ${how} not a supported merge type`);
  }
};
