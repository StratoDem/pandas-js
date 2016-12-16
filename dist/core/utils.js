"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Calculate the sum of values in an iterable
 *
 * @param {Iterable} iterable
 */
var sum = exports.sum = function sum(iterable) {
  return iterable.reduce(function (s, v) {
    return s + v;
  }, 0);
};