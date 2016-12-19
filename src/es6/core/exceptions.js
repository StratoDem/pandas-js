
export function IndexMismatchError(msg = 'Index does not match data') {
  this.name = 'IndexMismatchError';
  this.message = msg;
  this.stack = (new Error()).stack;
}
IndexMismatchError.prototype = Object.create(Error.prototype);
IndexMismatchError.prototype.constructor = IndexMismatchError;


export function InvalidAxisError(msg = 'Invalid axis for method') {
  this.name = 'InvalidAxisError';
  this.message = msg;
  this.stack = (new Error()).stack;
}
InvalidAxisError.prototype = Object.create(Error.prototype);
InvalidAxisError.prototype.constructor = InvalidAxisError;
