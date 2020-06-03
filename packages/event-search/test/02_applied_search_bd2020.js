'use strict';

const _ = require('lodash');
const fs = require('fs');
const should = require('should');

const config = require('../testconfig');

const Service = require('../');

describe('02 - event search - functional: bd2020', function() {
  let service;

  const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bd2020.schema.json`));
  this.timeout(100000);

  before(() => {
    service = Service(config);
  });

 before(async () => {
    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(async () => {
    await service('bd2020').rebuild({
      eventsList: async (lastId, limit) => {
        return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bd2020.${lastId}.${limit}.json`))
      },
      formSchema
    });
  });

  describe('Access', () => {
    const uid = 96490567;
    let eventForPublic, eventForAdmin;

    before(async () => {
      eventForPublic = await service('bd2020').search({
        uid: 96490567
      }, {}, { formSchema }).then(r => r.events[0]);

      eventForAdmin = await service('bd2020').search({
        uid: 96490567
      }, {}, { formSchema, access: 'administrator' }).then(r => r.events[0]);
    });

    it('info of restricted access is not provided if access is not provided', () => {
      should(eventForPublic['particularites']).equal(undefined);
    });

    it('info of restricted access is provided if access is not provided', () => {
      should(eventForAdmin['particularites']).eql([776]);
    });

  });

  describe('Explicit includes', () => {
    const uid = 96490567;
    let eventForPublic, eventForAdmin;

    const includes = [
      'uid',
      'type-devenement',
      'particularites'
   ];

    before(async () => {
      eventForPublic = await service('bd2020').search({
        uid: 96490567
      }, {}, {
        formSchema,
        includes
      }).then(r => r.events[0]);

      eventForAdmin = await service('bd2020').search({
        uid: 96490567
      }, {}, {
        formSchema,
        access: 'administrator',
        includes
      }).then(r => r.events[0]);
    });

    it('explicit includes limit returned fields to specified values and of public access', () => {
      Object.keys(eventForPublic).should.eql(['uid', 'type-devenement']);
    });

    it('explicit includes limit retured fields to specified value including specified access', () => {
      Object.keys(eventForAdmin).should.eql(['uid', 'particularites', 'type-devenement']);
    });
  });
});
