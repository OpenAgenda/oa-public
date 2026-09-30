# Overview

Mock project for openagenda.com styles

    yarn
    yarn start

# Conventions

## Info and secondary text

Explanatory text under a label, a radio option or a section header — and
the sub-message of a banner, a notice or a panel — is a `.text-muted` element
(or keeps the colour of its surroundings) **at the inherited size**:

```jsx
<div className="text-muted">{info}</div>
```

Do **not** make it smaller: no `<small>`, no `.small`, no `font-size` set
inline or in a stylesheet (`style={{ fontSize: 13 }}`). Everything in these interfaces — body text,
control labels, accordion titles and their subtitles — sits at one size, and
`<small>` is a relative 85% of whatever it lands in (a fixed size is no
better), so a hint dressed that way reads as a different, smaller register
than every other hint on the same screen. Set it apart with its colour, its
place and the spacing around it, not its size. `Components/RadioField.js` (an option's `info`) and the form builder's
accordion headers are the reference renderings.

`<small>` is left for the rare note that is genuinely subordinate to the
control it sits under — a disabled state explaining itself, for instance — and
not for the ordinary description of a field or an option.
