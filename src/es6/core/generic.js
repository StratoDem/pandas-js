
import Immutable from 'immutable';

export default class NDFrame {
  constructor(data, kwargs = {}) {
    this._data = data;

    this._axes = {};
    this._AXIS_ORDERS = null;
    this._values = null;
  }

  /**
   * Return a Seq of axis dimensions
   *
   * @returns Immutable.Seq
   */
  get shape() {
    return Immutable.Seq(this._AXIS_ORDERS.map(axis => this._get_axis(axis).size));
  }

  get values() {
    return this._values;
  }

  /**
   * Assign labels to an axis
   *
   * @param {number|string} axis
   * @param {List} labels
   */
  set_axis(axis, labels) {
    this._axes[axis] = labels;
  }

  _setup_axes(axes) {
    this._AXIS_ORDERS = axes;
    this._AXIS_LEN = axes.size;
  }

  _get_axis(axis) {
    return this._axes[axis];
  }
}
