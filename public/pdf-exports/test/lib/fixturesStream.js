import { readFile } from 'node:fs/promises';
import { Readable } from 'readable-stream';

export default class FixturesStream extends Readable {
  constructor(filePath) {
    super({ objectMode: true });

    this.filePath = filePath;
    this.data = null;
    this.cursor = 0;
  }

  async load() {
    this.data = JSON.parse(await readFile(this.filePath, 'utf8'));
  }

  _read() {
    if (this.cursor === this.data.length) {
      this.push(null);
      return;
    }

    this.push(this.data[this.cursor]);

    this.cursor += 1;
  }
}
