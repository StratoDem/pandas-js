'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _utils = require('../../core/utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('utils', function () {
  describe('sum', function () {
    it('adds an array properly', function () {
      expect(utils.sum([1, 2, 3, 4, 5])).toEqual(15);
      expect(utils.sum([5, 4, 3, 2])).toEqual(14);
    });
  });

  describe('enumerate', function () {
    it('enumerates with [element, index]', function () {
      var vals = [1, 2, 3, 4];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = utils.enumerate(vals)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              v = _step$value[0],
              idx = _step$value[1];

          expect(v).toEqual(vals[idx]);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
  });

  describe('round10', function () {
    it('rounds a decimal to the nearest tenth', function () {
      var val = 1.14;
      expect(utils.round10(val, -1)).toEqual(1.1);

      var val2 = 1.16;
      expect(utils.round10(val2, -1)).toEqual(1.2);
    });

    it('rounds a decimal to the nearest hundredth', function () {
      var val = 1.144;
      expect(utils.round10(val, -2)).toEqual(1.14);

      var val2 = 1.146;
      expect(utils.round10(val2, -2)).toEqual(1.15);
    });
  });
});