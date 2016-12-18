'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexMismatchError = IndexMismatchError;
function IndexMismatchError(msg) {
  this.name = 'IndexMismatchError';
  this.message = msg || 'Index does not match data';
  this.stack = new Error().stack;
}
IndexMismatchError.prototype = Object.create(Error.prototype);
IndexMismatchError.prototype.constructor = IndexMismatchError;