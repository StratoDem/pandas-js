

const int = 'int';
const float = 'float';
const object = 'object';

const ALLOWED_DTYPES = [
  int,
  float,
  object,
];

export class DType {
  constructor(name) {
    if (ALLOWED_DTYPES.indexOf(name) < 0)
      throw new Error(`dtype ${name} not allowed`);

    this.dtype = name;
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

  if (typeof el === 'object') {
    arrayDType = object;
  } else if (typeof el === 'string') {
    arrayDType = object;
  } else if (!Number.isInteger(el)) {
    arrayDType = float;
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

  for (const el of array) {
    arrayDType = elementToDType(el);

    if (arrayDType.dtype !== int && arrayDType.dtype !== float)
      break;
  }

  return arrayDType;
};
