'use strict';

var _utils = require('../../core/utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('utils', function () {
  describe('sum', function () {
    it('adds an array properly', function () {
      expect(utils.sum([1, 2, 3, 4, 5])).toEqual(15);
      expect(utils.sum([5, 4, 3, 2])).toEqual(14);
    });
  });
});