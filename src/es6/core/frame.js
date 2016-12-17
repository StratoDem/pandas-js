
import Immutable from 'immutable';

import Series from './series';
import { enumerate, nonMergeColumns, intersectingColumns } from './utils';


const parseArrayToSeriesObject = (array) => {
  const returnObject = {};

  array.forEach((el) => {
    if (typeof el === 'object') {
      Object.keys(el).forEach((k) => {
        if (k in returnObject) {
          returnObject[k] = returnObject[k].push(el[k]);
        } else {
          returnObject[k] = Immutable.List.of(el[k]);
        }
      });
    }
  });

  return returnObject;
};

export default class DataFrame {
  /**
   * Two-dimensional size-mutable, potentially heterogeneous tabular data
   * structure with labeled axes (rows and columns). Arithmetic operations
   * align on both row and column labels. Can be thought of as a Object-like
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
      const seriesObject = parseArrayToSeriesObject(data);
      this._columns = Object.keys(seriesObject);
      this._columns.forEach((k) => { this[k] = new Series(seriesObject[k], {name: k}); });
    } else if (typeof data === 'undefined')
      this._columns = [];

    this.index = kwargs.index;
    this._values = Immutable.List(this._columns.map(k => this[k].values));
  }

  toString() {
    let string = '\t|';
    this.columns.forEach((k) => { string += `  ${k}  |`; });
    const headerRow = '-'.repeat(string.length);

    string += `\n${headerRow}\n`;
    for (let idx = 0; idx < this.length; idx += 1) {
      string += `${idx}\t|`;
      this.columns.forEach((k) => { string += `  ${this[k].iloc(idx)}  |`; });
      string += '\n';
    }

    return string;
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
          row[k] = this[k].values.get(index);
        });
        return {
          value: new DataFrame([row], this.kwargs),
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

  get columns() {
    return this._columns;
  }

  set columns(columns) {
    if (!Array.isArray(columns) || columns.length !== this.columns.length)
      throw new Error('Columns must be array of same dimension');

    columns.forEach((k, idx) => {
      const prevColumn = this.columns[idx];
      this[prevColumn].name = k;
      this[k] = this[prevColumn];

      if (prevColumn !== k)
        delete this[prevColumn];
    });
    this._columns = columns;
  }

  get length() {
    return Math.max(...this.columns.map(k => this[k].length));
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

  for (const [row1, _1] of df1.iterrows()) {
    for (const [row2, _2] of df2.iterrows()) {
      let match = true;
      for (const c of on) {
        if (row1[c].iloc(0) !== row2[c].iloc(0)) {
          match = false;
          break;
        }
      }
      if (match) {
        const rowData = {};

        on.forEach((k) => {
          rowData[k] = row1[k].iloc(0);
        });

        cols1.forEach((k) => {
          const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_x`
            : k;
          rowData[nextColName] = row1[k].iloc(0);
        });

        cols2.forEach((k) => {
          const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_y`
            : k;
          rowData[nextColName] = row2[k].iloc(0);
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

  const matched1 = new Array(df1.length).fill(false);
  const matched2 = new Array(df2.length).fill(false);

  for (const [row1, idx_1] of df1.iterrows()) {
    for (const [row2, idx_2] of df2.iterrows()) {
      let match = true;
      for (const c of on) {
        if (row1[c].iloc(0) !== row2[c].iloc(0)) {
          match = false;
          break;
        }
      }
      const rowData = {};

      on.forEach((k) => {
        rowData[k] = row1[k].iloc(0);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = row1[k].iloc(0);
      });

      if (match) {
        cols2.forEach((k) => {
          const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
            ? `${k}_y`
            : k;
          rowData[nextColName] = row2[k].iloc(0);
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
        rowData[k] = df1[k].iloc(idx);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = df1[k].iloc(idx);
      });

      cols2.forEach((k) => {
        const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
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
        rowData[k] = df2[k].iloc(idx);
      });

      cols1.forEach((k) => {
        const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_x`
          : k;
        rowData[nextColName] = null;
      });

      cols2.forEach((k) => {
        const nextColName = intersectCols.length > 0 && intersectCols.indexOf(k) >= 0
          ? `${k}_y`
          : k;
        rowData[nextColName] = df2[k].iloc(idx);
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
    mergeOn = df1.columns.filter(c1 => df2.columns.filter(c2 => c1 === c2).length > 0);
    if (mergeOn.length === 0)
      throw new Error('No common keys');
  } else {
    on.forEach((col) => {
      if (df1.columns.indexOf(col) < 0 || df2.columns.indexOf(col) < 0)
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
