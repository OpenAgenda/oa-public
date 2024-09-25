# @openagenda/intl

## Installation

```bash
yarn add @openagenda/intl
```

## Usage

```js
import { getLocaleValue, mergeLocales } from '@openagenda/intl';

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
  fallbackMap = DEFAULT_FALLBACK_MAP
)
```

See [Default constants](#default-constants).

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

Like an `Object.assign` with a depth of 2, to combine multiple locale objects.

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
const userLocales = {
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
  },
});
```

### `getFallbackedMessages`

```js
function getFallbackedMessages(
  messagesMap,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG
)
```

See [Default constants](#default-constants).

Complete the messages with the fallback languages then the default language, useful when there is no locale compilation step.

Example:

```js
const messagesMap = {
  en: {
    signup: 'Signup',
    signin: 'Signin',
  },
  fr: {
    signup: "S'inscrire",
  },
  br: {},
};

const fallbackedMessages = getFallbackedMessages(messagesMap, userLocales);

// result:

expect(fallbackedMessages).toEqual({
  en: {
    signup: 'Signup',
    signin: 'Signin',
  },
  fr: {
    signup: "S'inscrire",
    signin: 'Signin',
  },
  br: {
    signup: "S'inscrire",
    signin: 'Signin',
  },
});
```

### `getSupportedLocale`

```js
function getSupportedLocale(
  lang,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG
)
```

See [Default constants](#default-constants).

Returns the first language supported by Intl following the chain of fallbacks.

Example:

```js
const defaultLocale = getSupportedLocale('oc');

// result:

expect(defaultLocale).toBe('fr');
```

### `getFallbackChain`

```js
function getFallbackChain(
  lang,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG
)
```

See [Default constants](#default-constants).

Returns an array of languages in the order they should be used in case of missing data.

Example:

```js
const fallbacks = getFallbackChain('br');

// result:

expect(fallbacks).toEqual(['br', 'fr', 'en']);
```

## Default constants

```js
const DEFAULT_LANG = 'en';

const DEFAULT_LANGS = [
  'en',
  'fr',
  'de',
  'it',
  'es',
  'br',
  'ca',
  'eu',
  'oc',
  'io',
];

const DEFAULT_FALLBACK_MAP = {
  br: 'fr',
  ca: 'es',
  eu: 'fr',
  oc: 'fr',
};
```

These constants are used for `getLocaleValue` and `getFallbackedMessages`.

## Bin `oa-intl`

To extract messages to translate from your sources you have to add a script in your package.json:

```json
{
  "scripts": {
    "extract-messages": "yarn oa-intl"
  }
}
```

### Usage

Default command, extract and compile:

```
oa-intl [files...]

Extract and compile locales.

Positionals:
  files  Glob paths to extract translations from, the source files.  [default: ["src/**/*.js"]]

Options:
      --version                 Show version number  [boolean]
      --help                    Show help  [boolean]
  -o, --output                  The target path where the script will output an aggregated `.json` file per lang of all the translations from the `files` supplied.  [default: "src/locales/%lang%.json"]
      --compiled                The target path where the script will output the compiled version of the translation files, completed with the fallback langs.  [default: "src/locales-compiled/%lang%.json"]
  -c, --compileOnly             Compile only, skip extraction.  [boolean]
      --defaultLang             Default language, the one that is filled in for the default messages in the files.  [default: "en"]
      --langs                   The target languages of the translations.  [default: "en,fr,de,it,es,br,ca,eu,oc,io"]
      --definedDefault          Languages that are populated with messages set to "" for ease of translation.  [default: "fr"]
      --idInterpolationPattern  If certain message descriptors don't have id, this `pattern` will be used to automatically generate IDs for them,
                                where `contenthash` is the hash of `defaultMessage` and `description`.  [default: "[sha512:contenthash:base64:6]"]
      --fallbackMap             A fallback object (json) to complete each key language with the value language. For `{ "br": "fr" }`, the French will complement the Breton.  [default: "{"br":"fr","ca":"es","eu":"fr","oc":"fr"}"]
      --skipIndex               Does not create index js file.  [boolean]
      --ast                     Whether to compile message into AST instead of just string.  [boolean] [default: true]
```

Extract:

```
oa-intl extract [files...]

Extract messages.

Positionals:
  files  Glob paths to extract translations from, the source files.  [default: ["src/**/*.js"]]

Options:
      --version                 Show version number  [boolean]
      --help                    Show help  [boolean]
  -o, --output                  The target path where the script will output an aggregated `.json` file per lang of all the translations from the `files` supplied.  [default: "src/locales/%lang%.json"]
      --defaultLang             Default language, the one that is filled in for the default messages in the files.  [default: "en"]
      --langs                   The target languages of the translations.  [default: "en,fr,de,it,es,br,ca,eu,oc,io"]
      --definedDefault          Languages that are populated with messages set to "" for ease of translation.  [default: "fr"]
      --idInterpolationPattern  If certain message descriptors don't have id, this `pattern` will be used to automatically generate IDs for them,
                                where `contenthash` is the hash of `defaultMessage` and `description`.  [default: "[sha512:contenthash:base64:6]"]
      --skipIndex               Does not create index js file.  [boolean]
```

Compile:

```
oa-intl compile [locales]

Compile locales.

Positionals:
  locales  Glob path to compile locales from.  [default: "src/locales/%lang%.json"]

Options:
      --version      Show version number  [boolean]
      --help         Show help  [boolean]
  -o, --output       The target path where the script will output the compiled version of the translation files, completed with the fallback langs.  [default: "src/locales-compiled/%lang%.json"]
      --defaultLang  Default language, the one that is filled in for the default messages in the files.  [default: "en"]
      --langs        The target languages of the translations.  [default: "en,fr,de,it,es,br,ca,eu,oc,io"]
      --fallbackMap  A fallback object (json) to complete each key language with the value language. For `{ "br": "fr" }`, the French will complement the Breton.  [default: "{"br":"fr","ca":"es","eu":"fr","oc":"fr"}"]
      --skipIndex    Does not create index js file.  [boolean]
      --ast          Whether to compile message into AST instead of just string.  [boolean] [default: true]
```
