Latin subsets of Ubuntu Sans and Noto Sans, the fonts of `@openagenda/uikit`, served by the landing page so that a visitor's browser never calls Google Fonts. Both are the files Google Fonts distributes.

- Ubuntu Sans: Ubuntu Font Licence 1.0, see `fonts/LICENCE-UbuntuSans.txt`.
- Noto Sans: SIL Open Font License 1.1, see `fonts/OFL-NotoSans.txt`.

`favicon.svg` is `cdn.openagenda.com/static/openagenda-icon.svg` (no shadow, transparent), cropped to the pin to fill a browser tab, with a white inside so that the check stays readable on a dark tab. `favicon.ico` is the fallback, for browsers without SVG favicons.

`og.png` is the 1200x630 card link previews show (`og:image`): the parts of the hero drawing, the logo and the address, with no sentence so that one image serves every language. Small previews crop it to its centre square (x 285 to 915), so the logo, the calendar between its arrows and the address sit inside it, and the person and the answer outside it. It is a screenshot of a page built from `src/landingArt.js` and the fonts above.
