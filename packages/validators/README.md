# @openagenda/validators

Configurable validators that couple validation with data sanitizing. A configured validator throws errors as arrays when input is invalid and returns the sanitized value when valid.

## Installation

```
yarn add @openagenda/validators
```

## Running the tests

```
yarn test
```

## Overview

The package provides 20+ composable validators and a schema system for defining complex validation rules. All validators follow a consistent pattern:

1. **Configure** a validator with options (field name, constraints, defaults)
2. **Call** it with a value
3. It either **returns** the sanitized value or **throws** an array of error objects

```js
import email from '@openagenda/validators/email.js';

const validate = email({ field: 'contactEmail' });

// Returns 'user@example.com' (sanitized)
const clean = validate('  user@example.com  ');

// Throws [{ field: 'contactEmail', code: 'email.invalid', message: '...', origin: 'bad' }]
validate('bad');
```

### Error format

All validators throw arrays of objects with a consistent shape:

```js
[{
  field: 'fieldName',    // from the `field` option
  code: 'type.error',   // machine-readable error code
  message: '...',        // human-readable message
  origin: <value>        // the original invalid value
}]
```

---

## Validators

### text

Validates and sanitizes text strings with length constraints, emoji rejection, and encoding sanitization.

```js
import text from '@openagenda/validators/text.js';

const validate = text({
  field: 'title',
  min: 3,              // minimum character length (default: 0)
  max: 255,            // maximum character length (default: 1000000)
  trim: true,          // trim whitespace (default: true)
  optional: true,      // allow undefined/null (default: true)
  default: null,       // default value when undefined (default: null)
  strict: false,       // require string type — reject numbers (default: false)
  rejectEmojis: false, // reject emoji characters (default: false)
  sanitizeEncoding: null, // set to 'utf8mb3' to strip 4-byte chars (default: null)
  emptyStringAsUndefined: true, // treat '' as undefined (default: true)
});
```

**Error codes**: `string.invalidtype`, `string.tooshort`, `string.toolong`

**Used in**: agenda-locations (names, descriptions), agendas (titles), events (titles, descriptions), users (names), sessions (flash messages), form-schemas (text fields), event-search (query strings), keys (labels), members (custom fields), networks, oembed, and many more.

---

### email

Validates email addresses using the `validator` library.

```js
import email from '@openagenda/validators/email.js';

const validate = email({
  field: 'userEmail',
  optional: true,      // allow undefined/null (default: true)
});
```

**Error codes**: `email.invalid`

**Used in**: agenda-locations (contact email), agendas (admin email), users (account email), invitations, members, sessions, cibul-node (authentication), form-schemas.

---

### phone

Validates phone numbers with international format support (`+`, spaces, hyphens, dots, parentheses).

```js
import phone from '@openagenda/validators/phone.js';

const validate = phone({
  field: 'contactPhone',
  optional: true,
});
```

Accepts formats like `+33 1 23 45 67 89`, `06.37.93.02.01`, `(555) 123-4567`.

**Error codes**: `phone.invalid`

**Used in**: agenda-locations (contact phone), agenda-locations-app, events (registration phone), form-schemas.

---

### link

Validates URLs with protocol normalization and mailto support.

```js
import link from '@openagenda/validators/link.js';

const validate = link({
  field: 'website',
  optional: true,
  error: { code: 'custom.code', message: 'Custom message' }, // optional
});
```

- Auto-adds `http://` to protocol-less URLs
- Normalizes protocol casing
- Validates `mailto:` URLs with email checking
- Rejects URLs with whitespace or invalid characters

**Error codes**: `link.invalid`

**Used in**: agenda-locations (website), agendas (website, social links), events (registration links), agenda-locations-app, form-schemas.

---

### number

Validates numeric values with range constraints.

```js
import number from '@openagenda/validators/number.js';

const validate = number({
  field: 'price',
  min: 0,              // minimum value (default: null — no limit)
  max: 10000,          // maximum value (default: null — no limit)
  optional: true,
  default: null,
});
```

Accepts both strings and numbers, parses with `parseFloat`.

**Error codes**: `number.invalid`, `number.toosmall`, `number.toobig`

**Used in**: event-search (geo radius, price), keys (list pagination), agenda-locations-app (coordinates).

---

### integer

Validates whole numbers only. Extends the number validator.

```js
import integer from '@openagenda/validators/integer.js';

const validate = integer({
  field: 'limit',
  min: 1,
  max: 100,
  optional: true,
  default: 20,
});
```

Ensures `parseInt(value) === parseFloat(value)` — rejects `3.5` but accepts `3`.

**Error codes**: `integer.invalid`, `integer.toosmall`, `integer.toobig`

**Used in**: event-search (pagination: offset, size, from), aggregators (limit), cibul-node (admin search pagination), flat-exports, form-schemas, sessions, agenda-search.

---

### boolean

Validates and coerces boolean values.

```js
import boolean from '@openagenda/validators/boolean.js';

const validate = boolean({
  field: 'isPublic',
  default: false,
  optional: true,
  allowNull: false,    // allow null values (default: false)
  allowFalse: true,    // allow false — set to false to require truthy (default: true)
});
```

Coercion rules:
- `'0'`, `'false'`, `false` → `false`
- Any other value → `!!value`

**Error codes**: `required`

**Used in**: agendas (public flags), aggregators, event-search (featured, relative dates), flat-exports, form-schemas, sessions, custom fields.

---

### date

Validates and normalizes dates with range constraints.

```js
import date from '@openagenda/validators/date.js';

const validate = date({
  field: 'startDate',
  min: new Date('2020-01-01'), // earliest allowed (default: null)
  max: new Date('2030-12-31'), // latest allowed (default: null)
  default: 'now',              // 'now' | Date | null (default: undefined)
  optional: true,
});
```

Accepts `Date` objects and date strings. Clones Date objects to prevent mutation.

**Error codes**: `date.required`, `date.invalid`, `date.toosmall`, `date.toobig`

**Used in**: agendas (creation date), events (timing validation with timezone support), event-search (date range filters), aggregators, members, sessions.

---

### latitude

Validates geographic latitude values (range: -90 to +90).

```js
import latitude from '@openagenda/validators/latitude.js';

const validate = latitude({ field: 'lat', optional: true });
```

**Error codes**: `latitude.invalid`, `latitude.toosmall`, `latitude.toobig`

**Used in**: agenda-locations, agenda-locations-app, event-search (geo queries).

---

### longitude

Validates geographic longitude values (range: -180 to +180).

```js
import longitude from '@openagenda/validators/longitude.js';

const validate = longitude({ field: 'lng', optional: true });
```

**Error codes**: `longitude.invalid`, `longitude.toosmall`, `longitude.toobig`

**Used in**: agenda-locations, agenda-locations-app, event-search (geo queries).

---

### timezone

Validates IANA timezone identifiers (e.g. `Europe/Paris`, `America/New_York`).

```js
import timezone from '@openagenda/validators/timezone.js';

const validate = timezone({ field: 'tz', optional: true });
```

Validates against the pattern `Continent/City` with proper casing.

**Error codes**: `timezone.invalid`

**Used in**: agenda-locations (location timezone), events (timing timezone).

---

### choice

Validates that values match one or more predefined options.

```js
import choice from '@openagenda/validators/choice.js';

const validate = choice({
  field: 'role',
  options: ['admin', 'editor', 'viewer'], // allowed values
  unique: true,        // return single value, not array (default: false)
  optional: true,
  default: 'viewer',
  min: null,           // minimum selections (default: null)
  max: null,           // maximum selections (default: null)
  key: 'value',        // property to check for object values (default: 'value')
  allowNull: false,    // allow null when unique + optional (default: false)
});
```

Handles both primitive and object values. Supports multi-select with min/max constraints.

**Error codes**: `choice.required`, `choice.required.min`, `choice.required.max`

**Used in**: agendas (visibility, language), event-search (sort, state), keys (key type), members (role), sessions (preferences), flat-exports (format), agenda-search, form-schemas.

---

### regex

Validates values against custom regular expression patterns.

```js
import regex from '@openagenda/validators/regex.js';

const validate = regex({
  field: 'slug',
  regex: /^[a-z0-9-]+$/,
  optional: false,
  clean: false,        // return match result instead of full value (default: false)
  trim: true,
  min: 3,              // minimum length (default: null)
  max: 50,             // maximum length (default: null)
  error: { code: 'slug.invalid', message: 'Invalid slug format' },
});
```

**Used in**: agendas (slug validation), agenda-locations-app (custom patterns), event-search (regex filters).

---

### multilingual

Validates multilingual content — objects with language codes as keys.

```js
import multilingual from '@openagenda/validators/multilingual.js';

const validate = multilingual({
  field: 'description',
  defaultLanguage: 'fr',           // fallback language (default: 'en')
  languages: ['fr', 'en'],         // required languages (optional)
  forceCodesToLowerCase: true,      // normalize codes (default: true)
  optional: true,
});

// Input: 'Hello' → Output: { fr: 'Hello', en: 'Hello' }
// Input: { fr: 'Bonjour', en: 'Hello' } → validated per-language
```

If given a plain string, distributes it to all languages. Language codes must be exactly 2 lowercase letters.

**Error codes**: `lang.invalid`, `required`

**Used in**: agenda-locations (multilingual names, descriptions), agenda-locations-app, form-schemas (multilingual form fields).

---

### ip

Validates IPv4 and IPv6 addresses using the `validator` library.

```js
import ip from '@openagenda/validators/ip.js';

const validate = ip({ field: 'clientIp', optional: true });
```

**Error codes**: `ip.required`, `ip.invalid`

**Used in**: agendas (IP restrictions).

---

### stream

Validates stream or file objects.

```js
import stream from '@openagenda/validators/stream.js';

const validate = stream({
  field: 'upload',
  optional: true,
  allowNull: false,    // allow null values (default: false)
  allowObject: false,  // allow generic objects (default: false)
});
```

Checks if the value is a stream (via `is-stream`) or a file object with a `path` property.

**Error codes**: `invalid`

**Used in**: agenda-locations (image uploads), events (image/file uploads).

---

### pass

Pass-through validator that returns the value as-is. Useful for fields that need to appear in schemas without validation.

```js
import pass from '@openagenda/validators/pass.js';

const validate = pass({ field: 'metadata', default: {} });
```

**Used in**: agenda-locations, agendas, events (preserving raw data), aggregators, keys, invitations, flat-exports, event-search.

---

## Composition validators

### list

Processes arrays of values through one or more validators, trying each validator sequentially until one succeeds per item.

```js
import list from '@openagenda/validators/list.js';
import text from '@openagenda/validators/text.js';
import number from '@openagenda/validators/number.js';

const validate = list({
  field: 'tags',
  optional: true,
  validates: [
    text({ max: 50 }),
    number({ min: 0 }),
  ],
});
```

Collects errors with array index information. Exposes `clean()`, `decorate()`, `validateItem()`, and `decorateItem()` methods.

**Error codes**: `list.wrongtype`

**Used in**: agenda-locations-app (multi-value fields), events (keywords, accessibility codes), form-schemas.

---

### listify

Wraps any validator to handle array inputs. Converts single values to arrays automatically.

```js
import listify from '@openagenda/validators/listify.js';
import text from '@openagenda/validators/text.js';

const validate = listify(text({ max: 100 }), {
  min: 1,    // minimum items (optional)
  max: 10,   // maximum items (optional)
  optional: true,
});
```

All validators accept a `list: true` option that internally uses `listify`.

---

### object

Validates structured objects with multiple named field validators.

```js
import object from '@openagenda/validators/object.js';
import text from '@openagenda/validators/text.js';
import email from '@openagenda/validators/email.js';

const validate = object({
  field: 'contact',
}, [
  text({ field: 'name', min: 1 }),
  email({ field: 'email' }),
]);
```

Processes arrays of `{ field, value }` pairs. Supports nested objects. Field names are prefixed with the parent field name.

**Error codes**: `object.invalidtype`

---

### set

Validates a set of named field values. Similar to `object` but for flat value sets.

```js
import set from '@openagenda/validators/set.js';
import text from '@openagenda/validators/text.js';
import email from '@openagenda/validators/email.js';

const validate = set({ compact: true }, [
  text({ field: 'name', min: 3, max: 40 }),
  email({ field: 'email' }),
]);

// With compact: true, returns { name: 'Toto', email: 'a@b.com' }
// Without compact, returns [{ field: 'name', value: 'Toto' }, ...]
validate([
  { field: 'name', value: 'Toto' },
  { field: 'email', value: 'a@b.com' },
]);
```

**Used in**: agenda-locations-app (form field sets).

---

## Schema system

The schema system is the primary way validators are used across the codebase. It composes validators into structured validation rules with support for conditional fields, partial validation, and default values.

### Basic usage

```js
import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import email from '@openagenda/validators/email.js';

// Register validators once
schema.register({ text, email });

// Define a schema
const validateUser = schema({
  name: { type: 'text', min: 1, max: 100 },
  email: { type: 'email', optional: false },
});

// Validate — returns sanitized object or throws error array
const clean = validateUser({
  name: '  John  ',
  email: 'john@example.com',
});
// → { name: 'John', email: 'john@example.com' }
```

### Default values

```js
const validate = schema({
  role: { type: 'text', default: 'viewer' },
  active: { type: 'boolean', default: true },
});

// Access pre-computed defaults
validate.default;
// → { role: 'viewer', active: true }
```

### Partial validation

Validate individual fields or subsets — useful for PATCH operations:

```js
const validate = schema({
  name: { type: 'text' },
  email: { type: 'email' },
  role: { type: 'choice', options: ['admin', 'editor'] },
});

// Validate a single field
const cleanName = validate.part('name', { name: 'Jane' });

// Validate multiple fields
const partial = validate.parts(['name', 'email'], {
  name: 'Jane',
  email: 'jane@example.com',
});
```

### Conditional fields with `enableWith`

A field is only validated (and included in output) when its dependency field has a value:

```js
const validate = schema({
  image: { type: 'text', optional: true },
  credits: {
    type: 'text',
    optional: false,
    enableWith: 'image', // only validated when image is present
  },
});

// image absent → credits ignored
validate({ name: 'Test' });
// → { image: null, credits: null }

// image present → credits required
validate({ image: 'photo.jpg' });
// → throws error: credits is required
```

`enableWith` also supports matching specific values:

```js
enableWith: { field: 'type', value: 'premium' }
```

### Conditional optionality with `optionalWith`

Makes a field optional only when a related field has a value:

```js
const validate = schema({
  altSource: { type: 'text', optional: true },
  mainSource: {
    type: 'text',
    optional: false,
    optionalWith: 'altSource', // becomes optional when altSource is filled
  },
});
```

### Related fields

Pass related field values as context during validation:

```js
const validate = schema({
  password: { type: 'text', min: 8, related: ['confirmPassword'] },
});
```

### Nested schemas

Schemas can be nested for hierarchical data structures:

```js
const validate = schema({
  contact: {
    name: { type: 'text' },
    email: { type: 'email' },
  },
});
```

---

## Labels (i18n)

The `labels` module provides multilingual error messages (English and French):

```js
import { getLabel, setLang } from '@openagenda/validators/labels.js';

setLang('fr');
getLabel('email.invalid');
// → 'L\'email n\'est pas valide'

getLabel('string.toolong', { max: 255 });
// → '255 caractères au maximum'
```

Supported labels: `number.toosmall`, `number.toobig`, `string.tooshort`, `string.toolong`, `email.invalid`, `phone.invalid`, `link.invalid`, `number.invalid`, `required`.

---

## Usage across the platform

The validators package is used by **28 packages** across the OpenAgenda platform:

| Domain | Packages | Key validators used |
|--------|----------|-------------------|
| **Entities** | agendas, events, agenda-locations, members, users, networks | schema, text, email, link, choice, date, boolean, multilingual, latitude/longitude, timezone |
| **Search** | event-search, agenda-search | schema, text, integer, choice, boolean, date, latitude/longitude, number, regex |
| **Forms** | form-schemas, event-form, agenda-contribute | schema, text, email, phone, link, choice, boolean, number, date, multilingual, integer |
| **Apps** | agenda-locations-app, sessions, agenda-settings, member-apps, inbox-apps | schema, set, text, link, email, choice, boolean, list, multilingual |
| **Services** | keys, invitations, activities, cibul-node, aggregators | schema, text, email, integer, number, choice, boolean, pass, date |
| **Utilities** | utils, custom, flat-exports, legacy, oembed | schema, text, boolean, integer, choice |

### Common patterns in consumers

**Schema registration and definition** — the most common pattern:

```js
import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import integer from '@openagenda/validators/integer.js';

schema.register({ text, integer });

export default schema({
  search: { type: 'text', max: 255, optional: true },
  offset: { type: 'integer', min: 0, default: 0 },
  limit: { type: 'integer', min: 1, max: 100, default: 20 },
});
```

**Custom validators** — built on top of base validators:

```js
// agenda-locations: address validator that rejects URLs
import text from '@openagenda/validators/text.js';

export default function address(config) {
  const validateText = text(config);
  return function (value) {
    const clean = validateText(value);
    if (clean && /https?:\/\//.test(clean)) {
      throw [{ code: 'address.invalid' }];
    }
    return clean;
  };
}
```

**Partial validation for PATCH operations**:

```js
const clean = validate.part('fieldName', requestBody, contextValues);
```

---

## Test suite

The test suite covers all validators with 27 test files:

| Test file | Coverage |
|-----------|----------|
| `text.test.js` | Trimming, length constraints, type checking, emoji rejection, encoding sanitization |
| `email.test.js` | Format validation, list mode, empty/optional handling |
| `phone.test.js` | International format patterns |
| `link.test.js` | URL validation, protocol normalization, mailto support, edge cases |
| `number.test.js` | Parsing, min/max bounds, NaN handling |
| `integer.test.js` | Whole number enforcement, range bounds |
| `boolean.test.js` | Coercion rules, allowFalse, allowNull |
| `date.test.js` | Date parsing, 'now' default, min/max bounds, mutation prevention |
| `latitude.test.js` | Range validation (-90 to 90) |
| `longitude.test.js` | Range validation (-180 to 180) |
| `timezone.test.js` | IANA format validation |
| `choice.test.js` | Option matching, object keys, min/max selections, defaults |
| `regex.test.js` | Custom pattern matching, clean mode |
| `multilingual.test.js` | Language code validation, string distribution across languages |
| `ip.test.js` | IPv4/IPv6 validation |
| `stream.test.js` | Stream/file object detection |
| `list.test.js` | Array validation, multi-validator fallback, error indexing |
| `object.test.js` | Structured object validation, nested field prefixing |
| `set.test.js` | Named field sets, compact mode |
| `labels.test.js` | i18n label translation |
| `schema.test.js` | Full schema validation, nested schemas, defaults |
| `schema.unit.test.js` | Schema utility functions |
| `schema.clean.test.js` | Schema definition normalization |
| `enableWith.schema.test.js` | Conditional field enablement |
| `optionalWith.schema.test.js` | Conditional field optionality |
| `related.schema.test.js` | Cross-field validation context |
| `schema.unregistered.test.js` | Error handling for unregistered validators |
