/** @flow
 * StratoDem Analytics : concat
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import Immutable from 'immutable';
import DataFrame from '../../../core/frame';
import Series from '../../../core/series';

import concat from '../../../core/reshape/concat';

describe('concat', () => {
  describe('concat Series', () => {
    it('Concatenates two Series without ignoring index', () => {
      const series1 = new Series([1, 2, 3, 4]);
      const series2 = new Series([2, 3, 4, 5]);

      const series3 = concat([series1, series2]);
      expect(series3.values.toArray()).toEqual([1, 2, 3, 4, 2, 3, 4, 5]);
      expect(series3.index.toArray()).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
    });

    it('Concatenates two Series with ignore index', () => {
      const series1 = new Series([1, 2, 3, 4]);
      const series2 = new Series([2, 3, 4, 5]);

      const series3 = concat([series1, series2], {ignore_index: true});
      expect(series3.values.toArray()).toEqual([1, 2, 3, 4, 2, 3, 4, 5]);
      expect(series3.index.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('Throws an error if the first object in concat is a Series '
      + 'and any of the rest are not', () => {
      const series1 = new Series([1, 2, 3, 4]);
      const series2 = new Series([2, 3, 4, 5]);

      expect(() => concat([series1, series2, []], {ignore_index: true})).toThrow();
      expect(() => concat(Immutable.List([series1, series2, []]), {ignore_index: true})).toThrow();
    });
  });

  describe('concat DataFrame', () => {
    it('Concatenates two DataFrames without ignoring index', () => {
      const frame1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
      const frame2 = new DataFrame([{x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);

      const frame3 = concat([frame1, frame2]);
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(frame3.get('x').index.toArray()).toEqual([0, 1, 2, 0, 1, 2]);
    });

    it('Concatenates two DataFrames with index ignored', () => {
      const frame1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
      const frame2 = new DataFrame([{x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);

      const frame3 = concat([frame1, frame2], {ignore_index: true});
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3, 2, 3, 4]);
      expect(frame3.get('x').index.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('Concatenates two DataFrames along axis = 1 without ignoring index', () => {
      const frame1 = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}]);
      const frame2 = new DataFrame([{x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);

      const frame3 = concat([frame1, frame2], {axis: 1});
      expect(frame3.get('x').values.toArray()).toEqual([1, 2, 3]);
      expect(frame3.get('y').values.toArray()).toEqual([2, 3, 4]);
      expect(frame3.get('x.x').values.toArray()).toEqual([2, 3, 4]);
      expect(frame3.get('x.x').name).toEqual('x.x');
      expect(frame3.get('y.x').values.toArray()).toEqual([3, 4, 5]);
      expect(frame3.get('y.x').name).toEqual('y.x');
    });
  });
});
