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

import DataFrame from '../frame';
import Series from '../series';

type T_CONCAT = DataFrame | Series;
type T_OBJS = Array<T_CONCAT> | Immutable.List<T_CONCAT>;
type T_ITER_SERIES = Array<Series> | Immutable.List<Series>;

type T_KWARGS = {
  ignore_index: boolean,
}

const _concatSeriesValues = (objs: T_ITER_SERIES) =>
  Immutable.List([]).concat(...objs.map(series => series.values));
const _concatSeriesIndices = (objs: T_ITER_SERIES) =>
  Immutable.List([]).concat(...objs.map(series => series.index));

const _concatSeries = (objs: Array<Series> | Immutable.List<Series>, kwargs: T_KWARGS): Series => {
  if (objs instanceof Immutable.List
    && objs.filter(series => series instanceof Series).size !== objs.size)
    throw new Error('Objects must all be Series');
  else if (Array.isArray(objs)
    && objs.filter(series => series instanceof Series).length !== objs.length)
    throw new Error('Objects must all be Series');

  if (!kwargs.ignore_index)
    return new Series(_concatSeriesValues(objs), {index: _concatSeriesIndices(objs)});
  else if (kwargs.ignore_index) {
    return new Series(
      _concatSeriesValues(objs),
      {index: Immutable.Range(0, objs.reduce((a, b: Series) => a + b.length, 0)).toList()});
  }

  throw new Error('Not supported');
};


const _concatDataFrame = (objs: Array<DataFrame> | Immutable.List<DataFrame>,
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
            column, // $FlowIssue
            _concatSeries([series, df.get(column)], kwargs)];
        return [
          column, // $FlowIssue
          _concatSeries([
            series,
            new Series(Immutable.Repeat(NaN, df.length).toList(), {index: df.index})],
          kwargs)]; // Now merge with columns only in the "right" DataFrame
      })).merge(Immutable.OrderedMap(
      df.columns
        .filter(column => !seriesOrderedMap.has(column))
        .map(column => // $FlowIssue
          ([column, lenSeriesInMap === 0 ? df.get(column) : _concatSeries([
            new Series(Immutable.Repeat(NaN, nextLength)),
            df.get(column)],
          kwargs)]))));
  });

  return new DataFrame(seriesOrderedMap);
};

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
const concat = (objs: T_OBJS, kwargs: T_KWARGS = {ignore_index: false}): T_CONCAT => {
  if ((Array.isArray(objs) && objs[0] instanceof Series)
      || (objs instanceof Immutable.List && objs.get(0) instanceof Series))
    return _concatSeries(objs, {ignore_index: kwargs.ignore_index});
  else if ((Array.isArray(objs) && objs[0] instanceof DataFrame)
    || (objs instanceof Immutable.List && objs.get(0) instanceof DataFrame))
    return _concatDataFrame(objs, {ignore_index: kwargs.ignore_index});
  throw new Error('Not supported');
};

export default concat;
