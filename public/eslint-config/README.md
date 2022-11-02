# @openagenda/eslint-config


## ESLint

### Add dependencies

```bash
yarn add -D eslint @openagenda/eslint-config
```

### Create `.eslintrc` and `.eslintignore`

`.eslintrc`:
```json
{
  "extends": "@openagenda",

  "parserOptions": {
    "sourceType": "script"
  },

  "rules": {
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          "seeds/**/*.js",
          "test/**/*.js",
          "testconfig.sample.js",
          "testconfig.js"
        ]
      }
    ]
  }
}

```

`.eslintignore`:
```ignore
!.*
node_modules/

dist/
```

The first line are useful for does not ignore the dotfiles (.storybook, .babelrc, ...)

### Add lint script to package.json

```json
{
  "scripts": {
    "lint": "eslint -c .eslintrc '**/*.js'"
  }
}
```

And run `yarn lint`.


## Prettier

### Add dependencies

```bash
yarn add -D prettier-eslint-cli
```

### Add prettier script to package.json

```json
{
  "scripts": {
    "prettier": "prettier-eslint --write '**/*.js'"
  }
}
```

And run `yarn prettier`.


## Lint-staged

### Add dependencies

```bash
yarn add -D lint-staged
```

### Add lint-staged script and config to package.json

```json
{
  "scripts": {
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "**/*.js": [
      "prettier-eslint --write",
      "eslint -c .eslintrc",
      "git add"
    ]
  }
}
```

And run `yarn lint-staged`.
