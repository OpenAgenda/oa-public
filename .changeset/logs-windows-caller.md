---
'@openagenda/logs': patch
---

Fix a `RangeError: Maximum call stack size exceeded` crash on Windows when resolving the caller's module. `getModule` now terminates at the filesystem root on every platform (`path.dirname` returns the drive root unchanged on Windows, so the old `dir === '/'` check never matched and recursed infinitely), and `getCallerFile` converts `file://` URLs with `url.fileURLToPath` instead of a naive string replace, which previously produced invalid `/C:/…` paths that `path.resolve` mangled on Windows.
