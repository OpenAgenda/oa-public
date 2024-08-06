import _ from 'lodash';
import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';

describe('agendaEvents - functional (server): validation', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql',
      connection: config.mysql,
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

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
    });
  });

  it('base validate endpoint has a field key as any validators validator would', () => {
    expect(_.keys(svc.validate.fields)).toEqual([
      'state',
      'featured',
      'userUid',
      'sourcePaths',
      'aggregated',
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
});
