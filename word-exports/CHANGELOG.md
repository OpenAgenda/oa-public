# @openagenda/word-exports

## 0.3.0

### Minor Changes

- [#536](https://github.com/OpenAgenda/oa/pull/536) [`8eaaccd`](https://github.com/OpenAgenda/oa/commit/8eaaccdb602ff392c9d71443b07808a78b560378) Thanks [@kaore](https://github.com/kaore)! - Event links point to the event's `canonicalUrl` when it carries one — the page its licensor declared, else its page on its origin agenda: in the agenda export, and for the link and QR code of the single-event document.

## 0.2.0

### Minor Changes

- [#504](https://github.com/OpenAgenda/oa/pull/504) [`8166974`](https://github.com/OpenAgenda/oa/commit/816697448e011c9a34714d3bbacd2463cc167997) Thanks [@kaore](https://github.com/kaore)! - New package: streams an agenda's events into a Word document, with a level of
  chapters per sort key, the place's details under a location heading, optional
  pictures and the same include options as the agenda PDF.

- [#504](https://github.com/OpenAgenda/oa/pull/504) [`77d7ebd`](https://github.com/OpenAgenda/oa/commit/77d7ebd7de0ca6c990fd6d7a831c17ba518d303d) Thanks [@kaore](https://github.com/kaore)! - `event.render(writeStream, agenda, event, { lang })`: one event as a Word
  document, with what the event PDF shows: its picture, long description,
  agenda fields, practical information, venue, timings and a QR code to its page.
