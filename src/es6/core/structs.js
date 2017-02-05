/**
 * structs
 *
 * Description:
 * Primary author(s):
 * Secondary author(s):
 *
 * Notes:
 *
 * January 12, 2017
 * StratoDem Analytics, LLC
 */

import Immutable from 'immutable';
// import XLSX from 'xlsx'; TODO figure out if this is the best package

// This does not match the Python pandas

export class Workbook {
  /**
   * @param {Sheets} sheets
   */
  constructor(sheets = new Sheets({})) {
    this._sheets = sheets;
  }

  /**
   * @returns {Sheets}
   */
  get sheets() {
    return this._sheets;
  }

  get SheetNames() {
    return this.sheets.sheetNames.toArray();
  }

  get Sheets() {
    return this.sheets.sheets.toJS();
  }

  /**
   * Create a copy of the Workbook
   *
   * @returns {Workbook}
   */
  copy() {
    return new Workbook(this._sheets);
  }

  /**
   * Add a values to the Workbook
   *
   * @param {string} sheetName
   * @param {Sheet} sheetContent
   */
  addSheet(sheetName, sheetContent) {
    console.log(sheetContent.values);
    this._sheets.addSheet(sheetName, sheetContent);
  }

  writeWorkbook() {
    throw new Error('Workbook writing is not yet implemented');
    // return XLSX.write(this, {bookType: 'xlsx', bookSST: true, type: 'binary'});
  }
}


class Sheets {
  constructor(initialSheets = {}) {
    this._sheets = Immutable.Map(initialSheets);
  }

  /**
   * List of values names in the Sheets
   *
   * @returns {List<string>}
   */
  get sheetNames() {
    return this._sheets.keySeq().toList();
  }

  /**
   * Map of sheetName, Sheet objects
   *
   * @returns {Map<string, Sheet>}
   */
  get sheets() {
    return this._sheets;
  }

  /**
   *
   * @param {string} sheetName
   * @param {Sheet} sheet
   */
  addSheet(sheetName, sheet) {
    this._sheets = this._sheets.set(sheetName, sheet.values);
  }
}


export class Sheet {
  /**
   * Construct a Sheet object from a List of Lists of data (from DataFrame.values, e.g.)
   *
   * @param {List<List>} data
   */
  constructor(data) {
    this._sheet = this._sheet_from_list_of_lists(data);
  }

  get values() {
    return this._sheet;
  }

  /**
   * Get a Sheet object's content from a List of Lists
   * As inspiration: view-source:http://sheetjs.com/demos/writexlsx.html
   *
   * @param data
   * @private
   */
  _sheet_from_list_of_lists(data) {
    const range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
    const ws = {};

    function datenum(v, date1904) {
      const epoch = Date.parse(date1904 ? v + 1462 : v);
      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    data.forEach((row, idxRow) => {
      row.forEach((v, idxCol) => {
        if (v === null) return;

        if (range.s.r > idxRow) range.s.r = idxRow;
        if (range.s.c > idxCol) range.s.c = idxCol;
        if (range.e.r < idxRow) range.e.r = idxRow;
        if (range.e.c < idxCol) range.e.c = idxCol;

        const cell = {v};
        throw new Error('Sheet not yet implemented');
        // const cell_ref = XLSX.utils.encode_cell({c: idxCol, r: idxRow}); TODO

        if (typeof cell.v === 'number')
          cell.t = 'n';
        else if (cell.v instanceof Date) {
          cell.t = 'n'; cell.z = XLSX.SSF._table[14];
          cell.v = datenum(cell.v);
        } else
          cell.t = 's';

        ws[cell_ref] = cell;
      });
    });

    // if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range); TODO

    return ws;
  }
}
