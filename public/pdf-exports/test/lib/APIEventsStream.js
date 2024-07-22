import https from 'node:https';
import { Readable } from 'readable-stream';
import qs from 'qs';
import logs from '@openagenda/logs';

const API = 'https://api.openagenda.com/v2/agendas/{agendaUID}/events?key={APIKey}&detailed=1';

const log = logs('APIEventsStream');

export default class APIEventsStream extends Readable {
  constructor({ agendaUID, APIKey, max, query }) {
    super({ objectMode: true });

    this.agendaUID = agendaUID;
    this.APIKey = APIKey;

    this.after = undefined;
    this.buffer = [];
    this.requestInProgress = false;
    this.count = 0;
    this.max = max;
    this.query = query ?? {};
  }

  _pushEvent() {
    if (this.max !== undefined && this.count > this.max) {
      this.push(null);
      return;
    }

    const event = this.buffer.shift();

    log(event.slug);

    this.push(event);
    this.count += 1;
  }

  _read() {
    if (this.requestInProgress) return;

    if (this.buffer.length !== 0) {
      this._pushEvent();
      return;
    }

    this.requestInProgress = true;

    const url = [API.replace('{agendaUID}', this.agendaUID).replace('{APIKey}', this.APIKey)]
      .concat(this.after ? `&${qs.stringify({ ...this.query, after: this.after })}` : [])
      .concat(!this.after && Object.keys(this.query).length ? `&${qs.stringify(this.query)}` : [])
      .join('');

    https
      .get(url, response => {
        let rawData = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          rawData += chunk;
        });
        response.on('end', () => {
          try {
            const result = JSON.parse(rawData);

            const { events, after: newAfter } = result;

            if (!events.length) {
              this.push(null);
              return;
            }

            this.after = newAfter.map(a => `${a}`);
            this.buffer = events;
            this.requestInProgress = false;

            this._pushEvent();
          } catch (error) {
            this.emit('error', error);
            this.requestInProgress = false;
          }
        });
      })
      .on('error', error => {
        this.emit('error', error);
        this.requestInProgress = false;
      });
  }
}
