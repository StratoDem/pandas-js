# pandas.js
Pandas for JavaScript

pandas.js is an open source (experimental) library mimicking the Python [pandas](http://pandas.pydata.org/) library. It relies on [Immutable.js](https://facebook.github.io/immutable-js/) as the [NumPy](http://www.numpy.org/) logical equivalent. The main data objects in pandas.js are the [`pandas.Series`](#series) and the [`pandas.DataFrame`](#dataframe)

## Installation and use
```
$ npm install pandas-js
```

Importing [`pandas.Series`](#series) and [`pandas.DataFrame`](#dataframe)
```
import { Series, DataFrame } from 'pandas-js';
```

Create a new `Series`
```
const ds_1 = new Series([1, 2, 3, 4], {name: 'My Data 1'});
console.log('This is a Series');
console.log(ds_1.toString());
console.log(`Sum: ${ds_1.sum()}`);
console.log(`Standard deviation: ${ds_1.std()}`);

const ds_2 = new Series([2, 3, 4, 5], {name: 'My Data 2'});
console.log('Summing two Series:');
console.log(ds_1.plus(ds_2).toString());
```
```
> This is a Series
0	1
1	2
2	3
Name: My Data 1, dtype: dtype(int)
Sum: 10
Standard deviation: 1
Summing two Series:
0	3
1	5
2	7
3	9
Name: , dtype: dtype(int)
```

Create a new `DataFrame`
```
const df = new DataFrame([
  {'x': 1, 'y': 2},
  {'x': 2, 'y': 3},
  {'x': 4, 'y': 5},
  ]);

console.log('This is a DataFrame');
console.log(df.toString());
```

```
This is a DataFrame
	|  x  |  y  |
--------------
0	|  1  |  2  |
1	|  2  |  3  |
2	|  4  |  5  |
```
## Documentation

See [the docs](https://stratodem.github.io/pandas.js-docs/)

## Testing and build
```
$ npm run test
$ npm run build
```
Testing uses [Jest](https://facebook.github.io/jest/). Building requires the babel compiler.
