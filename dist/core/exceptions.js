'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexMismatchError = IndexMismatchError;
exports.InvalidAxisError = InvalidAxisError;
function IndexMismatchError() {
  var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Index does not match data';

  this.name = 'IndexMismatchError';
  this.message = msg;
  this.stack = new Error().stack;
}
IndexMismatchError.prototype = Object.create(Error.prototype);
IndexMismatchError.prototype.constructor = IndexMismatchError;

function InvalidAxisError() {
  var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Invalid axis for method';

  this.name = 'InvalidAxisError';
  this.message = msg;
  this.stack = new Error().stack;
}
InvalidAxisError.prototype = Object.create(Error.prototype);
InvalidAxisError.prototype.constructor = InvalidAxisError;