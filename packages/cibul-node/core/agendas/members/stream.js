'use strict';

const { Readable } = require('stream');
const _ = require('lodash');
const ih = require('immutability-helper');

class Stream extends Readable {
  constructor({ core, agenda }, nav, options) {
    super({ objectMode: true });

    this._ = {
      core,
      agenda,
      nav,
      options,
      after: null,
      buffer: [],
      transform: _.get(options, 'transform'),
    };
  }

  async _read() {
    if (!this._.buffer.length) {
      this._.buffer = (await this._loadBuffer()).map(m => (this._.transform ? this._.transform(m) : m));
    }

    return this.push(this._.buffer.length ? this._.buffer.shift() : null);
  }

  async _loadBuffer() {
    const nav = this._.after
      ? ih(this._.nav, { after: { $set: this._.after } })
      : this._.nav;

    const { items: members, after } = await this._.core.agendas(this._.agenda).members.list(
      nav,
      this._.options,
    );

    if (!members.length) return [];

    this._.after = after;

    return members;
  }
}

const createStream = async (core, agendaUid, nav = {}, options = {}) => {
  const { userUid, includeMemberSchema = false } = options;
  const agenda = await core.agendas(agendaUid).get({ detailed: true, includeMemberSchema });

  const actingMember = await core.services.members.get({
    agendaUid,
    userUid,
  });
  return new Stream({ core, agenda }, nav, { ...options, actingMember, detailed: true });
};

module.exports = createStream;
