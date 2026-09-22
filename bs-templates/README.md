# Overview

Mock project for openagenda.com styles

    yarn
    yarn start

# Conventions

## Info and secondary text

Explanatory text under a label, a radio option or a section header is a
`.text-muted` element **at the inherited size**:

```jsx
<div className="text-muted">{info}</div>
```

Do **not** wrap it in `<small>`. Everything in these interfaces — body text,
control labels, accordion titles and their subtitles — sits at one size, and
`<small>` is a relative 85% of whatever it lands in, so a hint dressed that way
reads as a different, smaller register than every other hint on the same
screen. `Components/RadioField.js` (an option's `info`) and the form builder's
accordion headers are the reference renderings.

`<small>` is left for the rare note that is genuinely subordinate to the
control it sits under — a disabled state explaining itself, for instance — and
not for the ordinary description of a field or an option.
