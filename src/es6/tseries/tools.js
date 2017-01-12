
import Immutable from 'immutable';

import { Series, DataFrame } from '../core/index';

/**
 *
 * @param {Series|DataFrame|List|Array|string} arg
 */
export const to_datetime = (arg) => {
  if (arg instanceof Series) {
    return new Series(arg.values.map(v => to_datetime(v)), arg.kwargs);
  } else if (arg instanceof DataFrame) {
    return new DataFrame(Immutable.Map(arg.columns.map(c => [c, to_datetime(arg.get(c))])),
      arg.kwargs);
  } else if (arg instanceof Immutable.List || Array.isArray(arg)) {
    return arg.map(v => to_datetime(v));
  } else if (typeof arg === 'string') {
    return new Date(arg);
  }
  throw new Error('Must be Series, DataFrame, List or Array');
};
