# Change Log

0.2.1
### Changed
- Updated dev requirements

0.2.0
### Added
- `concat` to concatenate multiple `DataFrame`s or `Series`
- `append` for `DataFrame`
- `transpose` for DataFrame`

0.1.28
### Added
- `rename` for `DataFrame` and `Series`

### Bugfix
- `length` previously returned -INFINITY for empty `DataFrame`

0.1.27
### Added
- `cumsum`, `cummul`, `cummax` and `cummin` for `DataFrame` and `Series`

### Changed
- `pivot` returns `DataFrame` with (now) consistently-sorted columns

0.1.21
### Changed
- Removed uncessary tests from `npm install`.
- Added `reset_index` method for `DataFrame`

0.1.20
### Changed
- Dropped support for `to_excel` since XLSX adds 460kb to dependencies. Will revisit later.

0.1.19
### Added
- `.head(n = 10)` method for `DataFrame` returns first `n` rows as new `DataFrame`
- `.tail(n = 10)` method for `DataFrame` returns last `n` rows as new `DataFrame`
- `.iloc(rowIdx, colIdx)` method for `DataFrame` returns new DataFrame with [`rowIdx`, `colIdx`] indexing

0.1.26
### Added
- `.set(column, series)` method for `DataFrame` to add `series` (`Series`, `List`, or `Array`) to DataFrame at `column`