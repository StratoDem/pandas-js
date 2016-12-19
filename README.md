# pandas.js
Pandas for JavaScript

pandas.js is an open source (experimental) library mimicking the Python [pandas](http://pandas.pydata.org/) library. It relies on [Immutable.js](https://facebook.github.io/immutable-js/) as the [NumPy](http://www.numpy.org/) logical equivalent. The main data objects in pandas.js are the [`pandas.Series`](#series) and the [`pandas.DataFrame`](#dataframe)

## Installation and use
```
$ npm install git+https://github.com/StratoDem/pandas.js
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

## Series
A `Series` is a one-dimensional `Immutable.List` with axis labels.

#### Usage
Create a new `Series` with an Array or `Immutable.List` of data, or a single element. 
```
const ds = new Series([1, 2, 3, 4, 5]);
```

### Utilities

#### iloc(`startVal`, `endVal`)
Return the `Series` between [`startVal`, `endVal`), or at `startVal` if `endVal` is undefined
```
ds.iloc(1);	// 2
ds.iloc(1, 3);	// Series([2, 3])
```

#### map(`func`)
Return a new `Series` created by a map along the `Series`
```
ds.map((val, idx) => val ** 2)	// Series([1, 4, 9, 16, 25])
```

#### length
Return the length of the `Series`
```
ds.length	// 5
```

#### values
Return the `Series` values as an `Immutable.List`
```
ds.values	// List[1, 2, 3, 4, 5]
```

### Mathematical/Statistical methods

#### sum()
Return the sum of all the values in the `Series`
```
ds.sum()	// 15 
```

#### mean()
Return the mean of all the values in the `Series`
```
ds.mean()	// 3 
```

### std()
Return the standard deviation of all the values in the `Series`
```
ds.std()	// 1
```

### plus(`series`)
Add a second `Series` and return a new  `Series` object
```
ds.plus(new Series([2, 3, 4, 5, 6]));	// Series([3, 5, 7, 9, 11])
```

### minus(`series`)
Subtract a second `Series` and return a new `Series` object
```
ds.minus(new Series([2, 3, 4, 5, 6]));	// Series([-1, -1, -1, -1, -1])
```

### times(`series`)
Multiply by a second `Series` and return a new `Series` object
```
ds.times(new Series([2, 3, 4, 5, 6]));	// Series([2, 6, 12, 20, 30])
```

### dividedBy(`series`)
Divide by a second `Series` and return a new `Series` object
```
ds.dividedBy(new Series([2, 3, 4, 5, 6]));	// Series([0.5, 2 / 3, 3 / 4, 4 / 5, 5 / 6])
```

## DataFrame
A `DataFrame` is a two-dimensional `Immutable.Map` container for [`Series`](#series) objects. The `DataFrame` is the primary pandas data structure. 

#### Usage
Create a new `DataFrame` with an array of objects. 
```
const df = new DataFrame([{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}]);
```

### Utilities

#### columns
Returns an `Immutable.Seq` of the column names. Also functions as a setter like Python pandas
```
df.columns	// Seq['x', 'y']
df.columns = ['a', 'b'];
df.columns	// Seq['a', 'b']
df.get('x')	// new Error('KeyError: "x" not found');
df.get('a')	// Series([1, 2, 3, 4], {name: 'a'});
```

#### index
Returns an `Immutable.List` of the index values. Also functions as a setter like Python pandas
```
df.index	// List[0, 1, 2, 3]
df.index = Immutable.List([1, 2, 3, 4])
df.index 	// List[1, 2, 3, 4]
```

#### length
Return the length of the `DataFrame`
```
df.length	// 4
```

#### get(`column`)
Return the Series with the `column` name. This is equivalent to df['COLUMN_NAME'] in Python
```
df.get('x')	// Series([1, 2, 3, 4], {name: 'x'})
```

#### merge(`dataframe`, `on`, `how = 'inner'`)
Return a new `DataFrame` which is `df` merged with `dataframe` by `on` columns, as either an 'inner' or 'outer' merge
```
const df2 = new DataFrame({x: 2, z: 6}, {x: 1, z: 1}, {x: 3, z: 100});
const df3 = df.merge(df2, ['x']);
console.log('Inner merge');
console.log(df3).toString();

const df3 = df.merge(df2, ['x'], 'outer');
console.log('Outer merge');
```
```
> Inner merge
   x  |  y  |  z
0  1  |  2  |  1
1  2  |  3  |  6
2  3  |  4  |  100
Outer merge
   x  |  y  |  z
0  1  |  2  |  1
1  2  |  3  |  6
2  3  |  4  |  100
3  4  |  5  |  null
```

## Testing and build
```
$ npm run test
$ npm run build
```
Testing uses [Jest](https://facebook.github.io/jest/). Building requires the babel compiler.
