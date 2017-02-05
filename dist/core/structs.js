'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sheet = exports.Workbook = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Workbook = exports.Workbook = function () {
  function Workbook() {
    var sheets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Sheets({});
    (0, _classCallCheck3.default)(this, Workbook);

    this._sheets = sheets;
  }

  (0, _createClass3.default)(Workbook, [{
    key: 'copy',
    value: function copy() {
      return new Workbook(this._sheets);
    }
  }, {
    key: 'addSheet',
    value: function addSheet(sheetName, sheetContent) {
      console.log(sheetContent.values);
      this._sheets.addSheet(sheetName, sheetContent);
    }
  }, {
    key: 'writeWorkbook',
    value: function writeWorkbook() {
      throw new Error('Workbook writing is not yet implemented');
    }
  }, {
    key: 'sheets',
    get: function get() {
      return this._sheets;
    }
  }, {
    key: 'SheetNames',
    get: function get() {
      return this.sheets.sheetNames.toArray();
    }
  }, {
    key: 'Sheets',
    get: function get() {
      return this.sheets.sheets.toJS();
    }
  }]);
  return Workbook;
}();

var Sheets = function () {
  function Sheets() {
    var initialSheets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Sheets);

    this._sheets = _immutable2.default.Map(initialSheets);
  }

  (0, _createClass3.default)(Sheets, [{
    key: 'addSheet',
    value: function addSheet(sheetName, sheet) {
      this._sheets = this._sheets.set(sheetName, sheet.values);
    }
  }, {
    key: 'sheetNames',
    get: function get() {
      return this._sheets.keySeq().toList();
    }
  }, {
    key: 'sheets',
    get: function get() {
      return this._sheets;
    }
  }]);
  return Sheets;
}();

var Sheet = exports.Sheet = function () {
  function Sheet(data) {
    (0, _classCallCheck3.default)(this, Sheet);

    this._sheet = this._sheet_from_list_of_lists(data);
  }

  (0, _createClass3.default)(Sheet, [{
    key: '_sheet_from_list_of_lists',
    value: function _sheet_from_list_of_lists(data) {
      var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
      var ws = {};

      function datenum(v, date1904) {
        var epoch = Date.parse(date1904 ? v + 1462 : v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
      }

      data.forEach(function (row, idxRow) {
        row.forEach(function (v, idxCol) {
          if (v === null) return;

          if (range.s.r > idxRow) range.s.r = idxRow;
          if (range.s.c > idxCol) range.s.c = idxCol;
          if (range.e.r < idxRow) range.e.r = idxRow;
          if (range.e.c < idxCol) range.e.c = idxCol;

          var cell = { v: v };
          throw new Error('Sheet not yet implemented');


          if (typeof cell.v === 'number') cell.t = 'n';else if (cell.v instanceof Date) {
            cell.t = 'n';cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          } else cell.t = 's';

          ws[cell_ref] = cell;
        });
      });

      return ws;
    }
  }, {
    key: 'values',
    get: function get() {
      return this._sheet;
    }
  }]);
  return Sheet;
}();