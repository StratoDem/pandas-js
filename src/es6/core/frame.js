/** @flow
 * DataFrame object
 */

import Immutable from 'immutable';
// import { saveAs } from 'file-saver'; TODO figure out if best way

import { InvalidAxisError } from './exceptions';
import NDFrame from './generic';
// import { MultiIndex } from './multiindex';
import Series, { _concatSeries } from './series';
// import { Workbook, Sheet } from './structs'; TODO
import { enumerate, nonMergeColumns, intersectingColumns, parseIndex,
  OP_CUMSUM, OP_CUMMUL, OP_CUMMIN, OP_CUMMAX, generateCumulativeFunc } from './utils';


declare type T_LIST = Immutable.List
declare type T_MAP = Immutable.Map;
declare type T_SK = string | number;
// eslint-disable-next-line
declare type T_COTHER = Array<T_SK> | T_LIST | Series | DataFrame | T_SK;
declare type T_PVINDEX = Array<T_SK> | T_LIST | T_SK;


const parseArrayToSeriesMap = (array: Array<Object>, index: T_LIST): T_MAP => {
  let dataMap = Immutable.Map({});

  array.forEach((el) => {
    if (el instanceof Immutable.Map) {
      el.keySeq().forEach((k) => {
        if (dataMap.has(k)) {
          dataMap = dataMap.set(k, dataMap.get(k).push(el.get(k)));
        } else {
          dataMap = dataMap.set(k, Immutable.List.of(el.get(k)));
        }
      });
    } else if (typeof el === 'object') {
      Object.keys(el).forEach((k) => {
        if (dataMap.has(k)) {
          dataMap = dataMap.set(k, dataMap.get(k).push(el[k]));
        } else {
          dataMap = dataMap.set(k, Immutable.List.of(el[k]));
        }
      });
    }
  });

  dataMap.keySeq().forEach((k) => {
    dataMap = dataMap.set(k, new Series(dataMap.get(k), {name: k, index}));
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
  constructor(data: Array<Object> | Object, kwargs: Object = {}) {
    super(data, kwargs);

    if (Array.isArray(data)) {
      this.set_axis(0, parseIndex(kwargs.index, Immutable.List(data)));
      this._data = parseArrayToSeriesMap(data, this.index);
      this.set_axis(1, this._data.keySeq());
    } else if (data instanceof Immutable.Map) {
      this._data = Immutable.OrderedMap(data.keySeq().map((k) => {
        if (data instanceof Immutable.Map && !(data.get(k) instanceof Series))
          throw new Error('Map must have [column, series] key-value pairs');

        if (data instanceof Immutable.Map)
          return [k, data.get(k).copy()];

        throw new Error('Data is not Map');
      }));
      this.set_axis(1, this._data.keySeq());
      this.set_axis(0, this._data.get(this.columns.get(0)).index);
    } else if (data instanceof Immutable.List) { // List of List of row values
      let columns;
      if (Array.isArray(kwargs.columns) || kwargs.columns instanceof Immutable.Seq)
        columns = Immutable.List(kwargs.columns);
      else if (kwargs.columns instanceof Immutable.List)
        columns = kwargs.columns;
      else if (typeof kwargs.columns === 'undefined')
        columns = Immutable.Range(0, data.get(0).size).toList();
      else
        throw new Error('Invalid columns');

      this._values = data; // Cache the values since we're in List of List or row data already
      this._data = Immutable.OrderedMap(columns.map((c, colIdx) =>
        ([c, new Series(data.map(row => row.get(colIdx)), {index: kwargs.index})])));

      this.set_axis(1, this._data.keySeq());
      this.set_axis(0, this._data.get(this.columns.get(0)).index);
    } else if (typeof data === 'undefined') {
      this._data = Immutable.Map({});
      this.set_axis(0, Immutable.List.of());
      this.set_axis(1, Immutable.Seq.of());
    }

    this._setup_axes(Immutable.List.of(0, 1));
  }

  toString(): string {
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
  copy(): DataFrame {
    return new DataFrame(this._data, {index: this.index});
  }

  // $FlowFixMe
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

  get kwargs(): Object {
    return {index: this.index, columns: this.columns};
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
  get values(): T_LIST {
    if (this._values instanceof Immutable.List)
      return super.values;

    let valuesList = Immutable.List([]);
    for (let idx = 0; idx < this.length; idx += 1) {
      valuesList = valuesList.concat(
        [Immutable.List(this.columns.map(k => this._data.get(k).iloc(idx)))]);
    }
    this._values = valuesList;

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
  get columns(): Immutable.Seq {
    return this._get_axis(1);
  }

  // noinspection JSAnnotator
  /**
   * Sets columns
   *
   * pandas equivalent: [DataFrame.columns](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.columns.html)
   *
   * @param {Seq.Indexed<string>|Array} columns
   *    Next column names
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * df.columns = ['a', 'b'];
   * // Returns Seq ['a', 'b']
   * df.columns;
   */
  set columns(columns: Immutable.Seq<T_SK> | Array<T_SK>) {
    if (!Array.isArray(columns) || columns.length !== this.columns.size)
      throw new Error('Columns must be array of same dimension');

    const nextData = {};
    columns.forEach((k, idx: number) => {
      const prevColumn: T_SK = this.columns.get(idx);
      const prevSeries: Series = this.get(prevColumn);

      nextData[k] = prevSeries.rename(k);
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
  get index(): T_LIST {
    return this._get_axis(0);
  }

  // noinspection JSAnnotator
  /**
   * Set the index values of the `DataFrame`
   *
   * @param {List|Array} index
   *  Next index values
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
  set index(index: Immutable.List<T_SK> | Array<T_SK>) {
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
  get length(): number {
    return Math.max(0, ...this.columns.map(k => this.get(k).length).toArray());
  }

  /**
   * Set a `Series` at `column`
   *
   * @param {string|number} column
   * @param {Series|List|Array} series
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1}, {x: 2}, {x: 3}]);
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   * df.set('y', new Series([2, 3, 4]));
   */
  set(column: T_SK, series: Series | Immutable.List<T_SK> | Array<T_SK>): DataFrame {
    if (series instanceof Series)
      return new DataFrame(this._data.set(column, series), this.kwargs);
    else if (series instanceof Immutable.List || Array.isArray(series))
      return new DataFrame(this._data.set(
        column, // $FlowFixMe TODO
        new Series(series, {index: this.index, name: column})), this.kwargs);
    throw new TypeError('series must be a Series!');
  }

  /**
   * Reset the index for a DataFrame
   *
   * pandas equivalent: [DataFrame.reset_index](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.reset_index.html)
   *
   * @param {object} args
   * @param {boolean} args.drop
   *  Drop the index when resetting? Otherwise, add as new column
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [1, 2]});
   *
   * // returns DataFrame([{index: 1, x: 1, y: 2}, {index: 2, x: 2, y: 3}], {index: [0, 1]})
   * df.reset_index();
   *
   * // returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [0, 1]});
   * df.reset_index({drop: true});
   *
   * const df2 = new DataFrame([{index: 1}, {index: 2}], {index: [1, 2]});
   * // returns DataFrame([{level_0: 1, index: 1}, {level_0: 1, index: 2}], {index: [1, 2]});
   * df2.reset_index();
   */
  reset_index(args: Object = {drop: false}): DataFrame {
    if (typeof args.drop !== 'undefined' && typeof args.drop !== 'boolean')
      throw new TypeError('drop must be a boolean');
    const drop = typeof args.drop === 'undefined' ? false : args.drop;

    let indexName = 'index';
    if (this.columnExists('index')) {
      let i = 0;
      while (this.columnExists(`level_${i}`)) {
        i += 1;
      }
      indexName = `level_${i}`;
    }

    let data = Immutable.Map(this.columns.map(c => ([c, new Series(this.get(c).values)])));
    if (!args.drop) data = data.set(indexName, new Series(this.index));

    return new DataFrame(data);
  }

  /**
   * Return new DataFrame subset at [rowIdx, colIdx]
   *
   * pandas equivalent: [DataFrame.iloc](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.iloc.html)
   *
   * @param {number|Array.<number>} rowIdx
   * @param {number|Array.<number>=} colIdx
   *
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2, z: 3}, {x: 2, y: 3, z: 4}, {x: 3, y: 4, z: 5}]);
   *
   * // Returns DataFrame([{y: 3}], {index: [1]})
   * df.iloc(1, 1);
   *
   * // Returns DataFrame([{y: 3, z: 4}}], {index: [1]})
   * df.iloc(1, [1, 3]);
   *
   * // Returns DataFrame([{y: 3, z: 4}, {y: 4, z: 5}], {index: [1, 2]})
   * df.iloc([1, 3], [1, 3]);
   *
   * // Returns DataFrame([{y: 3}, {y: 4}], {index: [1, 2]})
   * df.iloc([1, 3], 1);
   *
   * // Returns DataFrame([{y: 2}, {y: 3}, {y: 4}], {index: [0, 1, 2]})
   * df.iloc(1);
   */
  iloc(rowIdx: number | [number, number], colIdx?: number | [number, number]): any {
    if (typeof rowIdx === 'number') {
      if (typeof colIdx === 'number') {
        if (colIdx < 0 || colIdx >= this.shape[1])
          throw new Error('colIdx out of bounds');

        const getCol = this.columns.get(colIdx);
        return new DataFrame(
          Immutable.Map([[getCol, this.get(getCol).iloc(rowIdx, rowIdx + 1)]]),
          {index: this.index.slice(rowIdx, rowIdx + 1)});
      } else if (Array.isArray(colIdx)) {
        if (colIdx.length !== 2)
          throw new Error('colIdx must be length 2 (start and end positions)');
        if (colIdx[1] <= colIdx[0])
          throw new Error('colIdx end position cannot be less than or equal tostart position');
        if (colIdx[0] < 0 || colIdx[1] > this.shape[1])
          throw new Error('colIdx position out of bounds');

        return new DataFrame(
          Immutable.Map(
            Immutable.Range(colIdx[0], colIdx[1]).map((idx) => {
              const getCol = this.columns.get(idx);
              // $FlowFixMe TODO
              return [getCol, this.get(getCol).iloc(rowIdx, rowIdx + 1)];
            }).toArray()),
          {index: this.index.slice(rowIdx, rowIdx + 1)});
      } else if (typeof colIdx === 'undefined') {
        return new DataFrame(
          Immutable.Map(this.columns.map(c =>
            // $FlowFixMe TODO
            ([c, this.get(c).iloc(rowIdx, rowIdx + 1)])).toArray()),
          {index: this.index.slice(rowIdx, rowIdx + 1)});
      }

      throw new TypeError('colIdx must be either integer or Array of integers');
    } else if (Array.isArray(rowIdx)) {
      if (typeof colIdx === 'number') {
        if (colIdx < 0 || colIdx >= this.shape[1])
          throw new Error('colIdx out of bounds');

        const getCol = this.columns.get(colIdx);
        return new DataFrame(
          Immutable.Map([[getCol, this.get(getCol).iloc(rowIdx[0], rowIdx[1])]]),
          {index: this.index.slice(rowIdx[0], rowIdx[1])});
      } else if (Array.isArray(colIdx)) {
        if (colIdx.length !== 2)
          throw new Error('colIdx must be length 2 (start and end positions)');
        if (colIdx[1] <= colIdx[0])
          throw new Error('colIdx end position cannot be less than or equal tostart position');
        if (colIdx[0] < 0 || colIdx[1] > this.shape[1])
          throw new Error('colIdx position out of bounds');

        return new DataFrame(
          Immutable.Map(
            Immutable.Range(colIdx[0], colIdx[1]).map((idx) => {
              const getCol = this.columns.get(idx);
              // $FlowFixMe TODO
              return [getCol, this.get(getCol).iloc(rowIdx[0], rowIdx[1])];
            }).toArray()),
          {index: this.index.slice(rowIdx[0], rowIdx[1])});
      } else if (typeof colIdx === 'undefined') {
        return new DataFrame(
          Immutable.Map(this.columns.map(c =>
            // $FlowFixMe TODO
            ([c, this.get(c).iloc(rowIdx[0], rowIdx[1])])).toArray()),
          {index: this.index.slice(rowIdx[0], rowIdx[1])});
      }

      throw new TypeError('colIdx must be either integer or Array of integers');
    }

    throw new TypeError('rowIdx must be either integer or Array of integers');
  }

  /**
   * Return new DataFrame composed of first n rows of this DataFrame
   *
   * pandas equivalent: [DataFrame.head](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.head.html)
   *
   * @param {number} n=10
   *  Integer number of n rows to return from the DataFrame
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);
   *
   * // returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}])
   * df.head(2);
   */
  head(n: number = 10): DataFrame {
    return this.iloc([0, n]);
  }

  /**
   * Return new DataFrame composed of last n rows of this DataFrame
   *
   * pandas equivalent: [DataFrame.tail](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.tail.html)
   *
   * @param {number} n=10
   *  Integer number of n rows to return from the DataFrame
   * @returns {DataFrame}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);
   *
   * // returns DataFrame([{x: 3, y: 4}, {x: 4, y: 5}])
   * df.tail(2);
   */
  tail(n: number = 10): DataFrame {
    return this.iloc([this.length - n, this.length]);
  }

  _assertColumnExists(col: T_SK) {
    if (!this.columnExists(col))
      throw new Error(`Column ${col} not in DataFrame`);
  }

  columnExists(col: T_SK): boolean {
    return this.columns.indexOf(col) >= 0;
  }

  /**
   * Return the `Series` at the column
   *
   * pandas equivalent: df['column_name']
   *
   * @param {string|Array.<string>|Immutable.List.<string>|Immutable.Seq.<string>} columns
   *    Name of the column to retrieve or list of columns to retrieve
   *
   * @returns {Series}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns Series([1, 2, 3], {name: 'x', index: [0, 1, 2]})
   * df.get('x');
   *
   * // Returns DataFrame([{y: 2}, {y: 3}, {y: 4}])
   * df.get(['y']);
   */
  get(columns: T_SK | Array<T_SK>): Series | DataFrame {
    if ((typeof columns === 'string' || typeof columns === 'number') && this.columnExists(columns))
      return this._data.get(columns);
    else if (Array.isArray(columns) || columns instanceof Immutable.List
      || columns instanceof Immutable.Seq) {
      columns.forEach((c) => {
        if (!this.columnExists(c)) throw new Error(`KeyError: ${c} not found`);
      });
      return new DataFrame(
        Immutable.Map(columns.map(c => ([c, this.get(c)]))), this.kwargs);
    }
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
  where(other: T_COTHER, op: (a: any, b: any) => boolean): DataFrame {
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
        // $FlowFixMe TODO
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
  eq(other: T_COTHER): DataFrame {
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
  gt(other: T_COTHER): DataFrame {
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
  gte(other: T_COTHER): DataFrame {
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
  lt(other: T_COTHER): DataFrame {
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
  lte(other: T_COTHER): DataFrame {
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
  merge(df: DataFrame, on: Array<string | number>, how: string = 'inner'): DataFrame {
    // eslint-disable-next-line
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
  to_csv(): string {
    let csvString = '';
    this.columns.forEach((k) => {
      csvString += `${k},`;
    });
    csvString += '\r\n';

    const updateString = (idx) => {
      let s = ''; // $FlowFixMe TODO
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
   * Write the `DataFrame` to a Workbook object
   *
   * @param {string|Workbook} excel_writer
   *    File path or existing Workbook object
   * @param {string} sheetName
   *    Name of values which will contain DataFrame
   * @param {boolean} download
   *    Download the excel file?
   * @param {Object} kwargs
   * @param {boolean} kwargs.index=true
   *
   * @return {Workbook}
   *
   */ // eslint-disable-next-line
  to_excel(excel_writer: string, sheetName: string = 'Sheet1', // eslint-disable-next-line
           download: boolean = false, kwargs: Object = {index: true}) {
    throw new Error('to_excel not yet implemented');
    // let wb;
    //
    // const sheetObject = () => {
    //   if (kwargs.index) {
    //     const colRow = Immutable.List.of('').concat(this.columns.toList());
    //     return new Sheet(
    //       Immutable.List.of(colRow)
    //         .concat(this.values.map((v, idx) =>
    //  Immutable.List.of(this.index.get(idx)).concat(v))));
    //   }
    //
    //   return new Sheet(Immutable.List.of(this.columns.toList()).concat(this.values));
    // };
    //
    // if (excel_writer instanceof Workbook) {
    //   wb = excel_writer.copy();
    //   wb.addSheet(sheetName, sheetObject());
    // } else if (typeof excel_writer === 'string') {
    //   wb = new Workbook();
    //   wb.addSheet(sheetName, sheetObject());
    // } else throw new Error('excel_writer must be a file path or Workbook object');
    //
    // function s2ab(s) {
    //   const buf = new ArrayBuffer(s.length);
    //   const view = new Uint8Array(buf);
    //   for (let i = 0; i < s.length; i += 1) { // noinspection Eslint
    //     view[i] = s.charCodeAt(i) & 0xFF;
    //   }
    //   return buf;
    // }
    //
    // if (download) {
    //   saveAs(new Blob([s2ab(wb.writeWorkbook())],
    //     {type: "application/octet-stream"}),
    //     typeof excel_writer === 'string' ? excel_writer : 'StratoDem Download.xlsx');
    // }
    //
    // return wb;
  }

  /**
   * Convert the DataFrame to a json object
   *
   * pandas equivalent: [DataFrame.to_json](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.to_json.html)
   *
   * @param kwargs
   * @param {string} [kwargs.orient=columns] orientation of JSON
   *
   * @returns {*}
   *
   * @example
   * const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
   *
   * // Returns {x: {0: 1, 1: 2, 2: 3}, y: {0: 1, 1: 2, 2: 3}}
   * df.to_json();
   *
   * // Returns [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]
   * df.to_json({orient: 'records'});
   *
   * // Returns {0: {x: 1, y: 2}, 1: {x: 2, y: 3}, 2: {x: 3, y: 4}}
   * df.to_json({orient: 'index'});
   *
   * // Returns {index: [0, 1, 2], columns: ['x', 'y'], values: [[1, 2], [2, 3], [3, 4]]}
   * df.to_json({orient: 'split'});
   *
   * // Returns [[1, 2], [2, 3], [3, 4]]
   * df.to_json({orient: 'values'});
   */
  to_json(kwargs: Object = {orient: 'columns'}): Object {
    const ALLOWED_ORIENT = ['records', 'split', 'index', 'values', 'columns'];
    let orient = 'columns';

    if (typeof kwargs.orient !== 'undefined') {
      if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0)
        throw new TypeError(`orient must be in ${ALLOWED_ORIENT.toString()}`);
      orient = kwargs.orient;
    }

    let json;
    switch (orient) {
      case 'records':
        return this.values.map((row) => {
          const rowObj = {};
          row.forEach((val, idx) => { rowObj[this.columns.get(idx)] = val; });
          return rowObj;
        }).toArray();
      case 'split':
        return {
          index: this.index.toArray(),
          columns: this.columns.toArray(),
          values: this.values.toJS(),
        };
      case 'index':
        json = {};
        this.values.forEach((row, idx) => {
          const rowObj = {};
          row.forEach((val, idx2) => { rowObj[this.columns.get(idx2)] = val; });
          json[this.index.get(idx)] = rowObj;
        });
        return json;
      case 'values':
        return this.values.toJS();
      case 'columns':
        json = {};
        this.columns.forEach((c) => {
          json[c] = this.get(c).to_json({orient: 'index'});
        });
        return json;
      default:
        throw new TypeError(`orient must be in ${ALLOWED_ORIENT.toString()}`);
    }
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
  sum(axis: number = 0): DataFrame {
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
  mean(axis: number = 0): DataFrame {
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
  std(axis: number = 0): DataFrame {
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
  variance(axis: number = 0): DataFrame {
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

  _pairwiseDataFrame(func: (Series, Series) => Series): DataFrame {
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
  cov(): DataFrame { // $FlowFixMe TODO
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
  corr(): DataFrame {
    // noinspection Eslint
    const corrFunc = (ds1, ds2) => { // $FlowFixMe TODO
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
  diff(periods: number = 1, axis: number = 0): DataFrame {
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
          const compareCol = this.get(this.columns.get(idx - periods)); // $FlowFixMe TODO
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
  pct_change(periods: number = 1, axis: number = 0): DataFrame {
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
          // $FlowFixMe TODO
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
  filter(iterBool: Array<boolean> | Series | Immutable.List<boolean>): DataFrame {
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

  /**
   * Reshape data (produce a 'pivot' table) based on column values. Uses unique values from
   * index / columns to form axes of the resulting DataFrame.
   *
   * pandas equivalent: [DataFrame.pivot](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.pivot.html)
   *
   * @param {string|number} index
   *  Name of the column to use as index
   * @param {string|number} columns
   *  Name of the column to use as column values
   * @param {string|number} values
   *  Name of the column to use as the value
   *
   * @returns {DataFrame}
   */
  pivot(index: T_SK, columns: T_SK, values: T_SK): DataFrame {
    let uniqueVals = Immutable.Map({});
    let uniqueCols = Immutable.List([]);

    this.index.forEach((v: T_SK, idx: number) => {
      const idxVal = this.get(index).iloc(idx);
      const colVal = this.get(columns).iloc(idx);

      if (uniqueVals.hasIn([idxVal, colVal]))
        throw new Error('pivot index and column must be unique');

      const val = this.get(values).iloc(idx);

      uniqueVals = uniqueVals.setIn([idxVal, colVal], val);
      if (!uniqueCols.has(colVal))
        uniqueCols = uniqueCols.push(colVal);
    });
    const sortedIndex = uniqueVals.keySeq().sort().toArray();
    const sortedColumns = uniqueCols.sort();

    const data = Immutable.OrderedMap(
      sortedColumns.map((col: T_SK) =>
        ([
          col,
          new Series(
            sortedIndex.map((idx) => {
              const val = uniqueVals.getIn([idx, col]);
              return typeof val === 'undefined' ? null : val;
            }),
            {name: col, index: sortedIndex}),
        ])));

    return new DataFrame(data, {index: sortedIndex});
  }

  /**
   * Reshape data (produce a 'pivot' table) based on a set of index, columns, or values
   * columns from the original DataFrame
   *
   * @param {Array<string>|Immutable.List|string|number} index
   *  Name(s) of column(s) to use as the index for the pivoted DataFrame
   * @param {Array<string>|Immutable.List|string|number} columns
   *  Name(s) of column(s) to use as the columns for the pivoted DataFrame
   * @param {Array<string>|Immutable.List|string|number} values
   *  Name(s) of column(s) to use as the values for the pivoted DataFrame
   * @param {string} aggfunc
   *  Name of aggregation function
   */
  // eslint-disable-next-line
  pivot_table(index: T_PVINDEX, columns: T_PVINDEX, values: T_PVINDEX, // eslint-disable-next-line
              aggfunc: string = 'sum'): any {
    throw new Error('Not implemented');
    // const validateCols = (cols: T_PVINDEX): Immutable.List => {
    //   if (Array.isArray(cols)) {
    //     cols.forEach(c => this._assertColumnExists(c));
    //     return Immutable.List(cols);
    //   } else if (cols instanceof Immutable.List) {
    //     cols.forEach(c => this._assertColumnExists(c));
    //     return cols;
    //   } else if (typeof cols === 'string') {
    //     this._assertColumnExists(cols);
    //     return Immutable.List.of(cols);
    //   }
    //
    //   throw new TypeError('cols must be Array, Immutable.List, or string');
    // };
    //
    // // Validate types and cast to Immutable.List of column names
    // const indexCols = validateCols(index);
    // const columnCols = validateCols(columns);
    // const valuesCols = validateCols(values);
    //
    // let pivotMap = Immutable.Map({});
    //
    // this.index.map((indexVal, idx) => {
    //   const key = indexCols.map(c => this.get(c).iloc(idx))
    //     .concat(columnCols.map(c => this.get(c).iloc(idx)));
    //   let val = this.get(valuesCols.get(0)).iloc(idx);
    //   if (pivotMap.has(key)) {
    //     switch (aggfunc) {
    //       case 'sum':
    //         val += pivotMap.get(key);
    //         break;
    //       default:
    //         throw new Error('not implemented for aggs');
    //     }
    //   }
    //
    //   // This pivotMap has indexCols.size keys then columnCols.size keys which point to the value
    //   pivotMap = pivotMap.set(key, val);
    // });
    //
    // let indexMap = Immutable.OrderedMap({});
    // let columnsMap = Immutable.OrderedMap({});
    //
    // pivotMap.entrySeq().forEach(([k, v]) => {
    //   const indexKey = k.slice(0, indexCols.size - 1);
    //   console.log(k);
    //   console.log(indexKey);
    //   if (indexMap.hasIn(indexKey))
    //     indexMap = indexMap.setIn(
    //       indexKey, indexMap.getIn(indexKey).concat([k[indexCols.size - 1]]));
    //   else indexMap = indexMap.setIn(
    //     indexKey, Immutable.List.of(k[indexCols.size - 1]));
    //   columnsMap = columnsMap.setIn(k.slice(indexCols.size, k.length));
    // });
    //
    // console.log(indexMap);
    // console.log(columnsMap);
    // return pivotMap;
  }

  _cumulativeHelper(operation: string = OP_CUMSUM, axis: number = 0): DataFrame {
    if (axis === 0) {
      return new DataFrame(
        Immutable.Map(this.columns.map(
          c => ([c, this.get(c)._cumulativeHelper(operation)]))), this.kwargs);
    } else if (axis === 1) {
      return new DataFrame(
        this.values.map(row => generateCumulativeFunc(operation)(row)),
        this.kwargs);
    }
    throw new Error('invalid axis');
  }

  /**
   * Return cumulative sum over requested axis
   *
   * pandas equivalent: [DataFrame.cumsum](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cumsum.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 3, y: 5}, {x: 6, y: 9}], {index: [2, 3, 4]});
   * ds.cumsum();
   *
   * // Returns DataFrame([{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 7}], {index: [2, 3 ,4]});
   * ds.cumsum(1);
   */
  cumsum(axis: number = 0): DataFrame {
    return this._cumulativeHelper(OP_CUMSUM, axis);
  }

  /**
   * Return cumulative multiple over requested axis
   *
   * pandas equivalent: [DataFrame.cummul](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummul.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 6}, {x: 6, y: 24}], {index: [2, 3, 4]});
   * ds.cummul();
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 6}, {x: 3, y: 12}], {index: [2, 3 ,4]});
   * ds.cummul(1);
   */
  cummul(axis: number = 0): DataFrame {
    return this._cumulativeHelper(OP_CUMMUL, axis);
  }

  /**
   * Return cumulative maximum over requested axis
   *
   * pandas equivalent: [DataFrame.cummax](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummax.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
   * ds.cummax();
   *
   * // Returns DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3 ,4]});
   * ds.cummax(1);
   */
  cummax(axis: number = 0): DataFrame {
    return this._cumulativeHelper(OP_CUMMAX, axis);
  }

  /**
   * Return cumulative minimum over requested axis
   *
   * pandas equivalent: [DataFrame.cummin](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.cummin.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const ds = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [2, 3, 4]});
   *
   * // Returns DataFrame([{x: 1, y: 1}, {x: 1, y: 1}, {x: 1, y: 1}], {index: [2, 3, 4]});
   * ds.cummin();
   *
   * // Returns DataFrame([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}], {index: [2, 3 ,4]});
   * ds.cummin(1);
   */
  cummin(axis: number = 0): DataFrame {
    return this._cumulativeHelper(OP_CUMMIN, axis);
  }

  /**
   * Rename the `DataFrame` and return a new DataFrame
   *
   * pandas equivalent: [DataFrame.rename](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.rename.html)
   *
   * @param {Immutable.Map} columns
   * @returns {DataFrame}
   */
  rename({ columns }: {columns: Immutable.Map}): DataFrame {
    return new DataFrame(Immutable.OrderedMap(this.columns.map((prevCol) => {
      const nextCol = columns.get(prevCol);
      if (typeof nextCol === 'undefined')
        return [prevCol, this._data.get(prevCol)];
      return [nextCol, this._data.get(prevCol).rename(nextCol)];
    })), {index: this.index});
  }

  /**
   * Append another DataFrame to this and return a new DataFrame
   *
   * pandas equivalent: [DataFrame.append](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.append.html)
   *
   * @param {DataFrame} other
   * @param {boolean} ignore_index
   * @returns {DataFrame}
   *
   * @example
   * const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}], {index: [1, 2]});
   * const df2 = new DataFrame([{x: 2, y: 2}, {x: 3, y: 3}], {index: [2, 3]});
   *
   * // Returns DataFrame(
   * //  [{x: 1, y: 2}, {x: 2, y: 3}, {x: 2, y: 2}, {x: 3, y: 3}],
   * //  {index: [1, 2, 2, 3]});
   * df1.append(df2);
   *
   * // Returns DataFrame(
   * //  [{x: 1, y: 2}, {x: 2, y: 3}, {x: 2, y: 2}, {x: 3, y: 3}],
   * //  {index: [0, 1, 2, 3]});
   * df1.append(df2, true);
   */
  append(other: DataFrame, ignore_index: boolean = false): DataFrame {
    // eslint-disable-next-line
    return _concatDataFrame(// $FlowFixMe
      [this, other],
      {ignore_index});
  }

  /**
   * Transpose the DataFrame by switching the index and columns
   *
   * pandas equivalent: [DataFrame.transpose](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.transpose.html)
   *
   * @returns {DataFrame}
   *
   * @example
   * const df1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}], {index: [1, 2, 3]});
   *
   * // Returns DataFrame(
   * //  [{1: 1, 2: 2, 3: 3}, {1: 2, 2: 3, 3: 4}], {index: ['x', 'y']});
   * df1.transpose();
   */
  transpose(): DataFrame {
    return new DataFrame(
      Immutable.OrderedMap(
        this.index.map((index, idx) =>
          ([index, new Series(this.values.get(idx), {index: this.columns.toList()})]))));
  }
}

const innerMerge = (df1: DataFrame, df2: DataFrame, on: Array<string | number>): DataFrame => {
  const data = [];

  const cols1 = nonMergeColumns(df1.columns, on);
  const cols2 = nonMergeColumns(df2.columns, on);

  const intersectCols = intersectingColumns(cols1, cols2);
  intersectCols.count(); // Cache intersectCols size

  const cols1Rename = cols1.map(k => (
    intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
      ? `${k}_x`
      : k));

  const cols2Rename = cols2.map(k => (
    intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
      ? `${k}_y`
      : k));

  // eslint-disable-next-line
  for (const [row1, _1] of df1.iterrows()) { // eslint-disable-next-line
    for (const [row2, _2] of df2.iterrows()) {
      let match = true; // eslint-disable-next-line
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

const outerMerge = (df1: DataFrame, df2: DataFrame, on: Array<string | number>): DataFrame => {
  const data = [];

  const cols1 = nonMergeColumns(df1.columns, on);
  const cols2 = nonMergeColumns(df2.columns, on);

  const intersectCols = intersectingColumns(cols1, cols2);
  intersectCols.count(); // Cache intersectCols size

  const matched1 = new Array(df1.length).fill(false);
  const matched2 = new Array(df2.length).fill(false);

  // eslint-disable-next-line
  for (const [row1, idx_1] of df1.iterrows()) { // eslint-disable-next-line
    for (const [row2, idx_2] of df2.iterrows()) {
      let match = true; // eslint-disable-next-line
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

export const mergeDataFrame = (df1: DataFrame, df2: DataFrame, on: Array<string | number>,
                               how: string = 'inner'): DataFrame => {
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

// Concat
type T_KWARGS = {ignore_index: boolean, axis?: 0 | 1};
export const _concatDataFrame = (objs: Array<DataFrame> | Immutable.List<DataFrame>,
                                 kwargs: T_KWARGS): DataFrame => {
  if (!(objs instanceof Immutable.List || Array.isArray(objs)))
    throw new Error('objs must be List or Array');

  if (objs instanceof Immutable.List
    && objs.filter(frame => frame instanceof DataFrame).size !== objs.size)
    throw new Error('Objects must all be DataFrame');
  else if (Array.isArray(objs)
    && objs.filter(frame => frame instanceof DataFrame).length !== objs.length)
    throw new Error('Objects must all be DataFrame');

  if (Array.isArray(objs) && objs.length === 1)
    return objs[0];
  else if (objs instanceof Immutable.List && objs.size === 1)
    return objs.get(0);

  let seriesOrderedMap = Immutable.OrderedMap({});
  if (kwargs.axis === 1) {
    objs.forEach((df: DataFrame) => {
      df.columns.forEach((column: string) => {
        const columnExists = seriesOrderedMap.has(column);
        seriesOrderedMap = seriesOrderedMap.set(
          columnExists ? `${column}.x` : column, // $FlowFixMe
          columnExists ? df.get(column).rename(`${column}.x`) : df.get(column));
      });
    });
  } else {
    objs.forEach((df: DataFrame) => {
      const lenSeriesInMap = seriesOrderedMap.keySeq().size === 0
        ? 0
        : seriesOrderedMap.first().length;
      const nextLength = df.length + lenSeriesInMap;

      seriesOrderedMap = Immutable.OrderedMap(
        // Get entries already concated (already in seriesOrderedMap)
        seriesOrderedMap.entrySeq().map(([column, series]) => {
          if (df.columnExists(column))
            return [
              column, // $FlowFixMe
              _concatSeries([series, df.get(column)], kwargs)];
          return [
            column, // $FlowFixMe
            _concatSeries([
              series,
              new Series(Immutable.Repeat(NaN, df.length).toList(), {index: df.index})],
            kwargs)]; // Now merge with columns only in the "right" DataFrame
        })).merge(Immutable.OrderedMap(
        df.columns
          .filter(column => !seriesOrderedMap.has(column))
          .map(column => // $FlowFixMe
            ([column, lenSeriesInMap === 0 ? df.get(column) : _concatSeries([
              new Series(Immutable.Repeat(NaN, nextLength)),
              df.get(column)],
            kwargs)]))));
    });
  }

  return new DataFrame(seriesOrderedMap);
};
