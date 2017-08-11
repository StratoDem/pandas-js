/** @flow
 * StratoDem Analytics : concat.js
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import Immutable from 'immutable';

import DataFrame, { _concatDataFrame } from '../frame';
import Series, { _concatSeries } from '../series';

type T_CONCAT = DataFrame | Series;
type T_OBJS = Array<T_CONCAT> | Immutable.List<T_CONCAT>;

type T_KWARGS = {
  ignore_index: boolean,
  axis?: 0 | 1,
}

/**
 * Concatenate pandas objects along a particular axis.
 *
 * pandas equivalent: [pandas.concat](https://pandas.pydata.org/pandas-docs/stable/generated/pandas.concat.html)
 *
 * @returns {Series | DataFrame}
 *
 * @example
 * const series1 = new Series([1, 2, 3, 4]);
 * const series2 = new Series([2, 3, 4, 5]);
 *
 * // Returns Series([1, 2, 3, 4, 2, 3, 4, 5], {index: [0, 1, 2, 3, 0, 1, 2, 3]})
 * concat([series1, series2], {ignore_index: false});
 *
 * // Returns Series([1, 2, 3, 4, 2, 3, 4, 5], {index: [0, 1, 2, 3, 4, 5, 6, 7]})
 * concat([series1, series2], {ignore_index: true});
 */
const concat = (objs: T_OBJS, kwargs: T_KWARGS = {ignore_index: false, axis: 0}): T_CONCAT => {
  if ((Array.isArray(objs) && objs[0] instanceof Series)
      || (objs instanceof Immutable.List && objs.get(0) instanceof Series))
    return _concatSeries(objs, {ignore_index: kwargs.ignore_index});
  else if ((Array.isArray(objs) && objs[0] instanceof DataFrame)
    || (objs instanceof Immutable.List && objs.get(0) instanceof DataFrame))
    return _concatDataFrame(objs, {ignore_index: kwargs.ignore_index, axis: kwargs.axis});
  throw new Error('Not supported');
};

export default concat;
