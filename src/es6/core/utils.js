/**
 * Calculate the sum of values in an iterable
 *
 * @param {Iterable} iterable
 */
export const sum = iterable => iterable.reduce((s, v) => s + v, 0);
