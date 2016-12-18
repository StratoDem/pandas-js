
import Immutable from 'immutable';
import { IndexMismatchError } from './exceptions';


/**
 * Calculate the sum of values in an iterable
 *
 * @param {Iterable} iterable
 */
export const sum = iterable => iterable.reduce((s, v) => s + v, 0);


/**
 * enumerate an iterable
 * Inspired by: http://stackoverflow.com/a/10179849
 *
 * @param iterable
 */
export function* enumerate(iterable) {
  let i = 0;

  for (const x of iterable) {
    yield [x, i];
    i += 1;
  }
}


// Merge utils
/**
 * Columns in DataFrame that will not be used as merge keys
 *
 * @param {Array<string>} columns
 * @param {Array<string>} on
 * @returns {Array<string>}
 */
export const nonMergeColumns = (columns, on) => columns.filter(k => on.indexOf(k) < 0);


/**
 * Columns appearing in both
 *
 * @param {Array<string>} cols1
 * @param {Array<string>} cols2
 * @returns {Array<string>}
 */
export const intersectingColumns = (cols1, cols2) => cols1.filter(k => cols2.indexOf(k) >= 0);


/**
 *
 * @param {Array|List|string|number} index
 *    Values to update the index in the Series
 * @param {List} values
 *    The values in the Series
 *
 * @returns {List}
 */
export const parseIndex = (index, values) => {
  if (Array.isArray(index)) {
    if (values.size !== index.length) throw new IndexMismatchError();

    return Immutable.List(index);
  } else if (index instanceof Immutable.List) {
    if (values.size !== index.size) throw new IndexMismatchError();

    return index;
  } else if (typeof index !== 'undefined') {
    if (values.size !== 1) throw new IndexMismatchError();

    return Immutable.List([index]);
  } else if (typeof index === 'undefined') {
    return Immutable.Range(0, values.size).toList();
  } else {
    throw new IndexMismatchError();
  }
};
