---
'@openagenda/babel-preset': major
---

Modernize the preset for current Babel:

- Add `@babel/preset-typescript`.
- Remove the deprecated proposal plugins (class-properties, optional-chaining, nullish-coalescing, decorators, do-expressions, function-bind, pipeline-operator, export-default-from, …). Code relying on proposals that never reached `@babel/preset-env` (function bind `::`, pipeline `|>`, do-expressions) must migrate.
- Switch from `babel-plugin-lodash` to `@openagenda/babel-plugin-lodash` and drop the `babel-plugin-dynamic-import-node` fallback.
- Honor caller-provided `targets` instead of hardcoding them, and only apply the react-intl plugin outside the `test` environment.
- Upgrade all `@babel/*` dependencies to the 7.28 range.
