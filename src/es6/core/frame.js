
import Immutable from 'immutable';

import { InvalidAxisError } from './exceptions';
import Series from './series';
import { enumerate, nonMergeColumns, intersectingColumns, parseIndex } from './utils';


/**
 * Parse an array of data [{k1: v1, k2: v2}, ... ] into an Immutable.Map
 *
 * @param {Array} array
 * @param {List} index
 * @returns {Map<string, List>}
 */
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

export default class DataFrame {
  /**
   * Two-dimensional size-mutable, potentially heterogeneous tabular data
   * structure with labeled axes (rows and columns). Arithmetic operations
   * align on both row and column labels. Can be thought of as a Immutable.Map-like
   * container for Series objects. The primary pandas data structure
   *
   * * @param data {Array|Object}
   *    Data to be stored in DataFrame
   * @param {Object} kwargs
   *    Extra optional arguments for a DataFrame
   * @param {Array|Object} [kwargs.index]
   */
  constructor(data, kwargs = {}) {
    if (Array.isArray(data)) {
      this._index = parseIndex(kwargs.index, Immutable.List(data));
      this._data = parseArrayToSeriesMap(data, this._index);
      this._columns = this._data.keySeq();
    } else if (data instanceof Immutable.Map) {
      data.keySeq().forEach((k) => {
        if (!(data.get(k) instanceof Series))
          throw new Error('Map must have Series as values');
        data.set(k, data.get(k).copy());
      });
      this._data = data;
      this._columns = data.keySeq();
      this._index = data.get(data.keySeq().get(0)).index;
    } else if (typeof data === 'undefined') {
      this._data = Immutable.Map({});
      this._columns = Immutable.Seq.of();
      this._index = Immutable.List.of();
    }

    this._values = Immutable.List(this._columns.map(k => this._data.get(k).values));
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
   * @returns {DataFrame}
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
        const row = {};
        this.columns.forEach((k) => {
          row[k] = this._data.get(k).iloc(index);
        });
        return {
          value: new DataFrame([row], {name: this.name}),
          done: !(index >= 0 && index < this.length)};
      },
    };
  }

  iterrows() {
    return enumerate(this);
  }

  /**
   * Immutable.List of Immutable.List, with [row][column] indexing
   *
   * @returns {List.<List>}
   */
  get values() {
    return this._values;
  }

  /**
   * Returns the indexed Immutable.Seq of columns
   *
   * @returns {Seq.Indexed<string>}
   */
  get columns() {
    return this._columns;
  }

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
    this._columns = Immutable.Seq(columns);
  }

  /**
   * @returns {List}
   */
  get index() {
    return this._index;
  }

  set index(index) {
    this._index = parseIndex(index, this._data.get(this._columns.get(0)).values);
  }

  get length() {
    return Math.max(...this._data.keySeq().map(k => this.get(k).length).toArray());
  }

  columnExists(col) {
    return this._columns.indexOf(col) >= 0;
  }

  get(columns) {
    if (typeof columns === 'string' && this.columnExists(columns))
      return this._data.get(columns);
    throw new Error(`KeyError: ${columns} not found`);
  }

  filter() {
    throw new Error('not implemented');
  }

  /**
   * Merge this DataFrame with another DataFrame, optionally on some set of columns
   *
   * @param {DataFrame} df
   * @param {Array} on
   * @param {string} how='inner'
   *
   * @returns {DataFrame}
   */
  merge(df, on, how = 'inner') {
    return mergeDataFrame(this, df, on, how);
  }

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

  sum(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).sum()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.columns.toArray().reduce((s, k) => s + this.get(k).iloc(idx), 0)).toList(),
        {index: this.index});
    }

    throw new InvalidAxisError();
  }

  mean(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).mean()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.columns.toArray().reduce((s, k) =>
            s + (this.get(k).iloc(idx) / this.columns.size), 0)).toList(),
          {index: this.index});
    }

    throw new InvalidAxisError();
  }

  std(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).std()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      const variances = this.variance(axis);
      return new Series(variances.values.map(v => Math.sqrt(v)), {index: this.index});
    }

    throw new InvalidAxisError();
  }

  variance(axis = 0) {
    if (axis === 0) {
      return new Series(
        this.columns.toArray().map(k => this.get(k).variance()),
        {index: this.columns.toArray()});
    } else if (axis === 1) {
      const means = this.mean(axis).values;
      return new Series(
        Immutable.Range(0, this.length).map(idx =>
          this.columns.toArray().reduce((s, k) => {
            const diff = this.get(k).iloc(idx) - means.get(idx);
            return s + ((diff * diff) / (this.columns.size - 1));
          }, 0)).toArray(),
        {index: this.index});
    }

    throw new InvalidAxisError();
  }

  /**
   *
   * @param periods=1
   * @param axis=0
   * @returns {DataFrame}
   */
  pct_change(periods = 1, axis = 0) {
    if (typeof periods !== 'number' || !Number.isInteger(periods))
      throw new Error('periods must be an integer');
    if (periods <= 0)
      throw new Error('periods must be positive');

    if (axis === 0) {
      let data = Immutable.Map.of();
      this._columns.forEach((k) => { data = data.set(k, this._data.get(k).pct_change(periods)); });
      return new DataFrame(data, {index: this.index});
    } else if (axis === 1) {
      throw new Error('Not implemented');
    }

    throw new InvalidAxisError();
  }
}


/**
 * Perform an inner merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 *
 * @returns {DataFrame}
 */
const innerMerge = (df1, df2, on) => {
  const data = [];

  const cols1 = nonMergeColumns(df1.columns, on);
  const cols2 = nonMergeColumns(df2.columns, on);

  const intersectCols = intersectingColumns(cols1, cols2);
  intersectCols.count();  // Cache intersectCols size

  for (const [row1, _1] of df1.iterrows()) {
    for (const [row2, _2] of df2.iterrows()) {
      let match = true;
      for (const c of on) {
        if (row1.get(c).iloc(0) !== row2.get(c).iloc(0)) {
          match = false;
          break;
        }
      }

      if (match) {
        const rowData = {};

        on.forEach((k) => {
          rowData[k] = row1.get(k).iloc(0);
        });

        cols1.forEach((k) => {
          const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_x`
            : k;
          rowData[nextColName] = row1.get(k).iloc(0);
        });

        cols2.forEach((k) => {
          const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_y`
            : k;
          rowData[nextColName] = row2.get(k).iloc(0);
        });

        data.push(rowData);
      }
    }
  }

  return new DataFrame(data);
};


/**
 * Perform an outer merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 *
 * @returns {DataFrame}
 */
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
        if (row1.get(c).iloc(0) !== row2.get(c).iloc(0)) {
          match = false;
          break;
        }
      }
      const rowData = {};

      on.forEach((k) => {
        rowData[k] = row1.get(k).iloc(0);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = row1.get(k).iloc(0);
      });

      if (match) {
        cols2.forEach((k) => {
          const nextColName = intersectCols.size > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_y`
            : k;
          rowData[nextColName] = row2.get(k).iloc(0);
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


/**
 * Perform a merge of two DataFrames
 *
 * @param {DataFrame} df1
 * @param {DataFrame} df2
 * @param {Array} on
 * @param {string} how='inner'
 *
 * @returns {DataFrame}
 */
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
