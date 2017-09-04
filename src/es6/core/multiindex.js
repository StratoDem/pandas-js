/** @flow
 * Created by michael on 3/22/17.
 */

import Immutable from 'immutable';


declare type T_SK = string | number;
declare type T_LIST = Immutable.List;
declare type T_MAP = Immutable.OrderedMap;
declare type T_INDEX = Array<T_SK> | T_LIST;


export class Index {
  _values: T_LIST;

  constructor(indexVals: T_INDEX) {
    if (Array.isArray(indexVals))
      this._values = Immutable.List(indexVals);
    else if (indexVals instanceof Immutable.List)
      this._values = indexVals;
    else
      throw new TypeError('Index values must be Immutable.List or Array');
  }

  get values(): T_LIST {
    return this._values;
  }

  /**
   * Get the index value at the idx
   *
   * @param {number} idx
   * @returns {string|number}
   */
  get(idx: number): T_SK {
    return this._values.get(idx);
  }

  /**
   * Get the index value at the idx
   *
   * @param {number} idx
   * @returns {string|number}
   */
  iloc(idx: number): T_SK {
    return this.get(idx);
  }
}


export class MultiIndex {
  _multiindex: T_MAP;
  _values: Immutable.OrderedMap;

  /**
   * A MultiIndex is an Immutable.OrderedMap of MultiIndexes nested until pointing to an Index
   *
   * @param {Immutable.OrderedMap} indexVals
   */
  constructor(indexVals: T_MAP) {
    if (indexVals instanceof Immutable.OrderedMap)
      this._multiindex = MultiIndex._parseOrderedMap(indexVals);
    else if (indexVals instanceof Immutable.List || Array.isArray(indexVals))
      this._multiindex = MultiIndex._parseArrayList(indexVals);
    else
      throw new TypeError('index values must be OrderedMap or Iterable of Iterables');
    this._values = MultiIndex._parseMultiIndex(indexVals);
  }

  // ***** GETTERS ***** //
  get values(): T_MAP {
    return this._values;
  }

  // ***** INSTANCE METHODS ***** //
  /**
   * Get the Index or MultiIndex at a key
   *
   * @param {string|number} key
   */
  get(key: T_SK): Index | MultiIndex {
    if (!(typeof key === 'string' || typeof key === 'number'))
      throw new TypeError('key must be string or number');

    return this._multiindex.get(key);
  }

  /**
   * Get the Index or MultiIndex at the key sequence
   *
   * @param {Array<string|number>|Immutable.List} keys
   * @returns {*|T_MAP}
   */
  getIn(keys: Array<T_SK> | Immutable.List): Index | MultiIndex {
    if (!(Array.isArray(keys) || keys instanceof Immutable.List))
      throw new TypeError('keys must be Array or List');

    let idx = this._multiindex;
    keys.forEach((k: T_SK) => { idx = idx.get(k); });
    return idx;
  }

  static _parseArrayList(indexVals: T_INDEX) {
    if (!(indexVals instanceof Immutable.List || Array.isArray(indexVals)))
      throw new TypeError('indexVals in parser must be Iterable');

    throw new Error('Not implemented');
  }

  static _parseOrderedMap(indexVals: T_MAP): T_MAP {
    if (!(indexVals instanceof Immutable.OrderedMap))
      throw new TypeError('indexVals in parser must be an Immutable.OrderedMap');

    return Immutable.OrderedMap(indexVals.entrySeq().map(([k, v]) => {
      if (v instanceof Index || v instanceof MultiIndex)
        return [k, v];
      else if (Array.isArray(v) || v instanceof Immutable.List)
        return [k, new Index(v)];
      else if (v instanceof Immutable.OrderedMap)
        return [k, new MultiIndex(v)];

      throw new Error('Invalid value');
    }));
  }

  static _parseMultiIndex(multiindex: T_MAP): Immutable.OrderedMap {
    if (!(multiindex instanceof Immutable.OrderedMap))
      throw new TypeError('multiindex in parser must be an Immutable.OrderedMap');

    return Immutable.OrderedMap(multiindex.entrySeq().map(([k, v]) => {
      if (v instanceof Index)
        return [k, v.values];
      else if (v instanceof Immutable.OrderedMap)
        return [k, MultiIndex._parseMultiIndex(v)];

      throw new TypeError('invalid value');
    }));
  }
}
