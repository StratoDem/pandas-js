# pandas-js
Pandas for JavaScript

pandas.js is an open source (experimental) library mimicking the
Python [pandas](http://pandas.pydata.org/) library. It relies on
[Immutable.js](https://facebook.github.io/immutable-js/) as the
[NumPy](http://www.numpy.org/) base. The main data
objects in pandas.js are the [`Series`](#series) and the
[`DataFrame`](#dataframe)

## Documentation

See [the docs](https://stratodem.github.io/pandas.js-docs/)  
See also [this post](https://insights.stratodem.com/pandas-immutable-js-2d9bf010639b) on use for optimizing React logic.

## Installation and use
```
$ npm install pandas-js
```

Importing
[`Series`](https://stratodem.github.io/pandas.js-docs/#series)
and
[`DataFrame`](https://stratodem.github.io/pandas.js-docs/#dataframe)
```js
import { Series, DataFrame } from 'pandas-js';
```

Create a new `Series`
```js
const ds = new Series([1, 2, 3, 4], {name: 'My test name', index: [2, 3, 4, 5]})
ds.toString()
// Returns:
// 2  1
// 3  2
// 4  3
// 5  4
// Name: My test name, dtype: dtype(int)
```

Filter a `Series`
```js
const ds = new Series([1, 2, 3]);

// Returns Series([2, 3]);
ds.filter(ds.gte(2));
```

Filtering can be done with generic methods
- [`eq`](https://stratodem.github.io/pandas.js-docs/#series-eq)
- [`lt`](https://stratodem.github.io/pandas.js-docs/#series-lt)
- [`gt`](https://stratodem.github.io/pandas.js-docs/#series-gt)
- [`lte`](https://stratodem.github.io/pandas.js-docs/#series-lte)
- [`gte`](https://stratodem.github.io/pandas.js-docs/#series-gte)

```js
const ds = new Series([1, 2, 3], {name: 'Test name'})

// Returns Series([true, false, false])
ds.eq(1);

// Returns Series([false, true, true])
ds.eq(new Series([0, 2, 3]));

// Returns Series([false, true, true])
ds.eq(Immutable.List([0, 2, 3]));

// Returns Series([false, true, true])
ds.eq([0, 2, 3]);

// Returns Series([2, 3])
ds.filter(ds.eq([0, 2, 3]));
```

Create a new `DataFrame`
```js
const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}])

// Returns:
//    x  |  y
// 0  1  |  2
// 1  2  |  3
// 2  3  |  4
df.toString();
```

Filtering a `DataFrame`

```js
const df = new DataFrame(Immutable.Map({x: new Series([1, 2]), y: new Series([2, 3])}));

// Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
df.filter(df.get('x').gt(1));

// Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
df.filter([false, true]);

// Returns DataFrame(Immutable.Map({x: Series([2]), y: Series([3]));
df.filter(Immutable.Map([false, true]));
```

## Development

### Testing and build
```
$ npm run test
$ npm run build
```
Testing uses [Jest](https://facebook.github.io/jest/). Building requires the babel compiler.
