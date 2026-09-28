import { PassThrough } from 'node:stream';
import { once } from 'node:events';
import archiver from 'archiver';
import {
  contentTypes,
  packageRelationships,
  coreProperties,
  settings,
  footer,
  fixedDocumentRelationships,
  documentRelationships,
  documentStart,
  documentEnd,
} from './parts.js';
import styles from './styles.js';

// Writes a .docx to `output` as it goes. A .docx is a ZIP of XML parts; ZIP
// compresses each part on its own and lists them at the end of the archive,
// so `word/document.xml` is deflated and sent while the events are still
// arriving. Only the relationships (one line per link or picture) and the
// pictures, queued behind the document part, are held until the end.
export const OUTPUT_CLOSED = 'ERR_OUTPUT_CLOSED';

function outputClosedError() {
  const error = new Error(
    'The output was closed before the document was complete',
  );

  error.code = OUTPUT_CLOSED;

  return error;
}

export default class DocxWriter {
  constructor(output, { title, eventTitleLevel, updateFields }) {
    this.archive = archiver('zip', { zlib: { level: 6 } });
    this.relationships = [...fixedDocumentRelationships];
    this.nextRelationshipId = fixedDocumentRelationships.length + 1;
    this.nextDrawingId = 1;
    this.links = new Map();
    this.output = output;
    this.closed = false;

    this.started = false;

    this.done = new Promise((resolve, reject) => {
      let finished = false;

      // Already gone (the reader left while the caller was fetching what the
      // document needs): no event will come to say so.
      if (output.destroyed || output.writableEnded) {
        reject(outputClosedError());
      }

      output.once('finish', () => {
        finished = true;
        resolve();
      });
      // Closed before everything was written: the reader went away.
      output.once('close', () => {
        if (!finished) reject(outputClosedError());
      });
      // `on`, not `once`: an abort can make either emit more than one error,
      // and an error with no listener brings the process down.
      output.on('error', reject);
      this.archive.on('error', reject);
    });
    // The caller learns of a failure through `done`, or through the writes.
    this.done.then(
      () => {
        this.closed = true;
      },
      () => {
        this.closed = true;
      },
    );

    // Once a byte has reached the output, a failure can only cut it short.
    this.archive.once('data', () => {
      this.started = true;
    });
    this.archive.pipe(output);

    this.archive.append(contentTypes, { name: '[Content_Types].xml' });
    this.archive.append(packageRelationships, { name: '_rels/.rels' });
    this.archive.append(coreProperties({ title }), {
      name: 'docProps/core.xml',
    });
    this.archive.append(styles({ eventTitleLevel }), {
      name: 'word/styles.xml',
    });
    this.archive.append(settings({ updateFields }), {
      name: 'word/settings.xml',
    });
    this.archive.append(footer({ title }), { name: 'word/footer1.xml' });

    this.body = new PassThrough();
    this.archive.append(this.body, { name: 'word/document.xml' });
    this.body.write(documentStart());
  }

  // Resolves once the chunk is taken, so a slow reader slows the generation
  // down instead of piling the document up in memory.
  async write(xml) {
    // The reader went away (a download cancelled): stop generating rather
    // than buffer a document nobody will read.
    if (this.closed) throw outputClosedError();

    if (!this.body.write(xml)) {
      await Promise.race([once(this.body, 'drain'), this.done]);
    }
  }

  relationshipId() {
    const id = `rId${this.nextRelationshipId}`;

    this.nextRelationshipId += 1;

    return id;
  }

  // The relationship id of an external link, one per distinct URL.
  link(url) {
    if (!this.links.has(url)) {
      const id = this.relationshipId();

      this.relationships.push({
        id,
        type: 'hyperlink',
        target: url,
        external: true,
      });
      this.links.set(url, id);
    }

    return this.links.get(url);
  }

  // Adds a JPEG (or PNG) picture to the package; returns what the drawing
  // refers to.
  image(buffer, { extension = 'jpeg' } = {}) {
    const drawingId = this.nextDrawingId;
    const id = this.relationshipId();

    this.nextDrawingId += 1;
    const target = `media/image${drawingId}.${extension}`;

    this.relationships.push({ id, type: 'image', target });
    this.archive.append(buffer, { name: `word/${target}` });

    return { id, drawingId };
  }

  async end() {
    this.body.end(documentEnd());

    this.archive.append(documentRelationships(this.relationships), {
      name: 'word/_rels/document.xml.rels',
    });

    if (this.closed) throw outputClosedError();

    // `finalize` never settles if the reader goes away while the pictures
    // and the relationships are flushed: `done` settles either way.
    await Promise.race([this.archive.finalize(), this.done]);
    await this.done;
  }

  // Stops the document. The output is destroyed with it, unless
  // `onlyIfStarted` and nothing was sent yet: the caller can then still answer
  // with an error of its own.
  abort(error, { onlyIfStarted = false } = {}) {
    this.archive.unpipe(this.output);
    this.body.destroy();
    this.archive.abort();

    if (!onlyIfStarted || this.started) this.output.destroy(error);
  }
}
