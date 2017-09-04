import Immutable from 'immutable';
import {IndexMismatchError} from './exceptions';


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

  // eslint-disable-next-line
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
    if (values.size !== index.length)
      throw new IndexMismatchError('values size not equal to index size');

    return Immutable.List(index);
  } else if (index instanceof Immutable.List) {
    if (values.size !== index.size)
      throw new IndexMismatchError('values size not equal to index size');

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


/**
 * Adjust the decimal value for round, floor, or ceiling
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 *
 * @param type
 * @param value
 * @param exp
 * @returns {*}
 */
const decimalAdjust = (type, value, exp) => {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  // noinspection Eslint
  value = +value;
  // noinspection Eslint
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  // noinspection Eslint
  value = value.toString().split('e');
  // noinspection Eslint
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  // noinspection Eslint
  value = value.toString().split('e');
  // noinspection Eslint
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
};


/**
 * Round the value to the nearest power of 10
 *
 * @param {number} value
 * @param {number} exp
 * @returns {number}
 *
 * @example
 * // Returns 1.65
 * round10(1.65234123415, -2);
 */
export const round10 = (value, exp) => decimalAdjust('round', value, exp);


export const OP_CUMSUM = 'OP_CUMSUM';
export const OP_CUMMUL = 'OP_CUMMUL';
export const OP_CUMMAX = 'OP_CUMMAX';
export const OP_CUMMIN = 'OP_CUMMIN';

/**
 * Generate a cumulative function which takes in an iterable `values`
 * and returns the accumulated iterable
 *
 * @param {string} operation
 *  Type of operation for which to generate the cumulative function (takes an iterable)
 *
 * @returns {function(*)}
 */
export const generateCumulativeFunc = (operation) => {
  switch (operation) {
    case OP_CUMSUM:
      return (values) => { let agg = 0; return values.map((v) => { agg += v; return agg; }); };
    case OP_CUMMUL:
      return (values) => { let agg = 1; return values.map((v) => { agg *= v; return agg; }); };
    case OP_CUMMAX:
      return (values) => {
        let maxVal = Number.NEGATIVE_INFINITY;
        return values.map((v) => { maxVal = Math.max(maxVal, v); return maxVal; });
      };
    case OP_CUMMIN:
      return (values) => {
        let minVal = Number.POSITIVE_INFINITY;
        return values.map((v) => { minVal = Math.min(minVal, v); return minVal; });
      };
    default:
      throw new Error(`Not implemented for ${operation}`);
  }
};
