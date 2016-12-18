
export function IndexMismatchError(msg) {
  this.name = 'IndexMismatchError';
  this.message = msg || 'Index does not match data';
  this.stack = (new Error()).stack;
}
IndexMismatchError.prototype = Object.create(Error.prototype);
IndexMismatchError.prototype.constructor = IndexMismatchError;
