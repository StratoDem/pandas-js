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
 * Compares valueA and valueB for an Immutable.List sort ascending
 * Returns 0 if valueA and valueB should not be swapped
 * Returns -1 if valueA should come before valueB
 * Returns 1 if valueA should come after valueB
 *
 * @param valueA
 * @param valueB
 * @returns {number}
 */
export const sortAscendingComparator = (valueA, valueB) => {
  if (valueA < valueB) return -1;
  else if (valueA === valueB) return 0;
  return 1;
};


/**
 * Compares valueA and valueB for an Immutable.List sort descending
 * Returns 0 if valueA and valueB should not be swapped
 * Returns -1 if valueA should come before valueB
 * Returns 1 if valueA should come after valueB
 *
 * @param valueA
 * @param valueB
 * @returns {number}
 */
export const sortDescendingComparator = (valueA, valueB) => {
  if (valueA > valueB) return -1;
  else if (valueA === valueB) return 0;
  return -1;
};
