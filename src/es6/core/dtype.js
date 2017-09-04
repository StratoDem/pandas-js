

const int = 'int';
const float = 'float';
const object = 'object';
const bool = 'bool';
const datetime = 'datetime';

const ALLOWED_DTYPES = [
  int,
  float,
  object,
  bool,
  datetime,
];

export class DType {
  constructor(name) {
    if (ALLOWED_DTYPES.indexOf(name) < 0)
      throw new Error(`dtype ${name} not allowed`);

    this._name = name;
  }

  get dtype() {
    return this._name;
  }

  toString() {
    return `dtype(${this.dtype})`;
  }
}


/**
 *
 * @param el
 * @returns {DType}
 */
export const elementToDType = (el) => {
  let arrayDType = int;

  if (typeof el === 'string') {
    arrayDType = object;
  } else if (!Number.isInteger(el) && typeof el === 'number') {
    arrayDType = float;
  } else if (typeof el === 'boolean') {
    arrayDType = bool;
  } else if (el instanceof Date) {
    arrayDType = datetime;
  } else if (typeof el === 'object') {
    arrayDType = object;
  }

  return new DType(arrayDType);
};

/**
 * Returns the DType of an array
 *
 * @param array
 * @returns {DType}
 */
export const arrayToDType = (array) => {
  let arrayDType;

  // eslint-disable-next-line
  for (const el of array) {
    arrayDType = elementToDType(el);

    if (arrayDType.dtype !== int && arrayDType.dtype !== float && arrayDType.dtype !== datetime)
      break;
  }

  return arrayDType;
};
