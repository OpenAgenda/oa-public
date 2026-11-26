# @openagenda/word-exports

Streams an agenda's events into a Word document (`.docx`), the counterpart of
`@openagenda/pdf-exports` for the agenda list export.

```js
import WordExports from '@openagenda/word-exports';

const wordExports = WordExports({ logger });

await wordExports.agenda.GenerateExportStream(eventStream, res, {
  agenda, // { title, slug, description }
  lang: 'fr',
  sections: ['location.city', 'location.name'],
  includeEventImages: true,
  includeDescription: true,
  includeAccessibility: true,
  includeLocation: true,
  includeRegistration: true,
  includeEventLink: true,
});
```

- **Streamed.** A `.docx` is a ZIP of XML parts, each compressed on its own and
  listed at the end of the archive: `word/document.xml` is compressed and sent
  as the events arrive. Only the relationships (one line per link or picture)
  and the pictures are held until the end.
- **Sections.** The events arrive sorted by `sections`, the sort keys; each key
  is a heading level, opened wherever its value changes. Under a
  `location.name` heading come the place's details, and the items stop
  repeating the location.
- **Table of contents.** With sections, the document carries a table of
  contents field Word is asked to compute on opening (`updateFields`): only
  Word knows where the pages break. LibreOffice does not honour the request;
  the table fills in from « Update index ».
- **Styles.** Everything goes through named styles (« Event title », « Event
  detail », « Location detail », the headings), so the whole export restyles
  from Word's style pane.

`yarn render` (and `yarn render:event`, for single events) writes a few variants of the fixture agenda to `word-test/`, with
real pictures, to open in Word or LibreOffice.
