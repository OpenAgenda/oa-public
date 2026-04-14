# CLAUDE.md

## Package management

The package manager for all packages in oa is **yarn**. Always use `yarn` instead of `npm` for running scripts and managing dependencies.

## Locales

To compile locale files, run from the relevant package directory:

```sh
yarn extract-messages
```

In the `packages/next` package, every time a label is added to a component's locale files:

1. Add the English label in `en.json`
2. Run `yarn extract-messages`
3. Add the French translation in `fr.json`
4. Run `yarn extract-messages` again
