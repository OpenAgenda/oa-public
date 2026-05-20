# CLAUDE.md

## Package management

The package manager for all packages in oa is **yarn**. Always use `yarn` instead of `npm` for running scripts and managing dependencies.

## Locales

Relevant languages across the codebase: **fr, en, de, es, it, nl, br, oc**. Fill all of them when adding new labels (best-effort translations are fine — they can be refined later via crowdin). The legacy `io` key in `packages/labels/` is a crowdin placeholder and can be left as a `crwdns…` token or omitted.

### `packages/next`

To compile locale files, run from the package directory:

```sh
yarn extract-messages
```

Every time a label is added to a component's locale files:

1. Add the English label in `en.json`
2. Run `yarn extract-messages`
3. Add the translations for the other relevant languages in their respective `<lang>.json`
4. Run `yarn extract-messages` again

### `packages/labels`

Labels live in JS source files (e.g. `packages/labels/form-schemas/builder.js`) keyed by label name with one entry per locale. After editing, regenerate the per-locale JSON dumps under `.crowdin/locales/` by running, from `packages/labels/`:

```sh
node .crowdin/aggregate.js
```

## UI

When working on UI in `packages/next`, consult [`packages/next/docs/UI-GUIDELINES.md`](packages/next/docs/UI-GUIDELINES.md) for shared design principles (dialog dismissal, etc.) and add new conventions there as they emerge.
