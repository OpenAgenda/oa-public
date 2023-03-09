# Overview

Provide streams and transforms for event flat exports ( csv, xlsx, ical, rss )

## Flatteners

Event data has depth.

```json
{
  "title": { "fr": "Un titre", "en": "A title" },
  "location": {
    "name": "La tour césar",
    "city": "Provins"
  }
}
```

... yet spreadsheet exports do not.

A Flattener in this package is a function that takes a configuration map (an item per output field) and returns a transform fonction that takes in an object with depth and returns a flat object.

To generate the transform function, the Flattener takes in a default field map mapping event standard fields (see `lib/transform/getDefaultFieldMap.js`).

If provided options include a `formSchema`, the transform field map is decorated by the function `lib/transform/decorateFieldMap.js`.s

