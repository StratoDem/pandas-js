# Change Log

0.1.20
### Changed
- Dropped support for `to_excel` since XLSX adds 460kb to dependencies. Will revisit later.

0.1.19
### Added
- `.head(n = 10)` method for `DataFrame` returns first `n` rows as new `DataFrame`
- `.tail(n = 10)` method for `DataFrame` returns last `n` rows as new `DataFrame`
- `.iloc(rowIdx, colIdx)` method for `DataFrame` returns new DataFrame with [`rowIdx`, `colIdx`] indexing
