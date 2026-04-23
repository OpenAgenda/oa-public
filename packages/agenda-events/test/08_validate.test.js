import _ from 'lodash';
import knexLib from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';

describe('agendaEvents - functional (server): validation', () => {
  let knex;
  let svc;

  beforeAll(() => {
    knex = knexLib({
      client: 'mysql2',
      connection: { ...config.mysql },
    });

    svc = Service({
      ...config,
      knex,
    });
  });

  afterAll(() => knex?.destroy());

  it('base validate endpoint validates data part of an agendaEvent reference', () => {
    expect(
      svc.validate({
        state: 2,
        featured: true,
      }),
    ).toEqual({
      state: 2,
      featured: true,
      userUid: null,
      sourcePaths: [],
      aggregated: null,
      motive: null,
    });
  });

  it('base validate endpoint has a field key as any validators validator would', () => {
    expect(_.keys(svc.validate.fields)).toEqual([
      'state',
      'featured',
      'userUid',
      'sourcePaths',
      'aggregated',
      'motive',
    ]);
  });

  it('validate endpoint assigns default state value when it is unspecified', () => {
    expect(
      svc.validate({
        featured: true,
      }),
    ).toEqual({
      state: 2,
      featured: true,
      userUid: null,
      sourcePaths: [],
      aggregated: null,
      motive: null,
    });
  });

  it('validate endpoint does not include state if not provided and optional state option is set', () => {
    expect(
      svc.validate(
        {
          featured: true,
        },
        { optionalSecondaryFields: true },
      ),
    ).toEqual({
      featured: true,
      userUid: null,
    });
  });

  it('validate can do things partially', () => {
    expect(
      svc.validate(
        {
          state: 0,
        },
        { partial: true },
      ),
    ).toEqual({
      state: 0,
    });
  });

  it('motive is removed if state is not refused', () => {
    expect(
      svc.validate(
        {
          state: 0,
          motive: "I don't wanna",
        },
        { partial: true },
      ),
    ).toEqual({
      state: 0,
    });
  });

  it('motive is maintained if state is refused', () => {
    expect(
      svc.validate(
        {
          state: -1,
          motive: 'Ah non. Non non non.',
        },
        { partial: true },
      ),
    ).toEqual({
      motive: 'Ah non. Non non non.',
      state: -1,
    });
  });
});
