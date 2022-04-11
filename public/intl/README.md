# @openagenda/intl

## Installation

```bash
yarn add @openagenda/intl
```

## Usage

```js
import {
  getLocaleValue,
  mergeLocales,
} from '@openagenda/intl';

// or

import getLocaleValue from '@openagenda/intl/getLocaleValue';
import mergeLocales from '@openagenda/intl/mergeLocales';
```

### `getLocaleValue`

```js
function getLocaleValue(
  labels,
  lang,
  defaultLang = DEFAULT_LANG,
  fallbackMap = FALLBACK_MAP
)

// where

const DEFAULT_LANG = 'en';

const FALLBACK_MAP = {
  br: 'fr',
};
```

If labels is not an object then it is returned as is.

The function attempts to find the message in the following order:

- the argument `lang`
- the fallbacks (if exists)
- the default lang
- the first key of the object

Example:

```js
const multiLabel = {
  fr: 'Titre',
  en: 'Title',
};

getLocaleValue(multiLabel, 'fr');
```

### `mergeLocales`

Like an `object.assign` with a depth of 2, to combine multiple locale objects.

Example:

```js
const filtersLocales = {
  fr: {
    title: 'Titre',
    desc: 'Description',
  },
  en: {
    title: 'Title',
    desc: 'Description',
  },
};
const filtersLocales = {
  fr: {
    other: 'Autre',
  },
  en: {
    other: 'Other',
  },
};

const locales = mergeLocales(filtersLocales, userLocales);

// result:

expect(locales).toEqual({
  fr: {
    title: 'Titre',
    desc: 'Description',
    other: 'Autre',
  },
  en: {
    title: 'Title',
    desc: 'Description',
    other: 'Other',
  }
});
```

## Bin `oa-extract-messages`

To extract messages to translate from your sources you have to add a script in your package.json:

```json
{
  ...
  "scripts": {
    "extract-messages": "yarn oa-extract-messages"
  },
  ...
}
```

### Usage

```
extract-messages.js [files]

Extract and/or compile messages.

Positionals:
  files  Glob path to extract translations from, the source files.  [default: "src/**/*.js"]

Options:
      --version                 Show version number  [boolean]
  -o, --outDir                  The target dir path where the script will output an aggregated `.json` file per lang of all the translations from the `files` supplied.  [default: "src/locales"]
      --compiledDir             The target dir path where the script will output the compiled version of the translation files, completed with the fallback langs.  [default: "src/locales-compiled"]
  -c, --compileOnly             Compile only, skip extraction.  [boolean] [default: false]
      --defaultLang             Default language, the one that is filled in for the default messages in the files.  [default: "en"]
      --langs                   The target languages of the translations.  [default: "en,fr,de,it,es,br,ca,eu,oc,io"]
      --definedDefault          Languages that are populated with messages set to "" for ease of translation.  [default: "fr"]
      --fallbackMap             A fallback object (json) to complete each key language with the value language. For `{ "br": "fr" }`, the French will complement the Breton.  [default: "{ "br": "fr" }"]
      --idInterpolationPattern  If certain message descriptors don't have id, this `pattern` will be used to automatically generate IDs for them,
                                where `contenthash` is the hash of `defaultMessage` and `description`.  [default: "[sha512:contenthash:base64:6]"]
      --help                    Show help  [boolean]
```
