"use strict";

const _ = require('lodash');
const fs = require('fs');
const should = require('should');

const config = require('../testconfig');

const Service = require('../');

describe('02 - event search - functional: Applied search', function() {

  describe('Bordeaux Métropole', function() {
    let service;
    const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.schema.json`));
    this.timeout(60000);

    before(() => {
      service = Service(config);
    });

/*    before(async () => {
      try {
        await service.getConfig().client.indices.delete({
          index: 'maintest'
        });
      } catch (e) {}
    });

    before(async () => {
      await service('bdx').rebuild({
        eventsList: async (lastId, limit) => {
          return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.${lastId}.${limit}.json`))
        },
        formSchema
      });
    });*/

    describe('data structure', () => {
      const uid = 11438560;

      describe('basic', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {})
            .then(({ total, events }) => events[0]);
        });

        it('an event can be retrieved by uid', () => {
          event.uid.should.equal(uid);
        });

        it('origin agenda is available', () => {
          event.originAgenda.should.eql({
            uid: 1108324,
            image: 'agenda1108324.jpg',
            title: 'Un air de Bordeaux'
          });
        });
      });

      describe('detailed', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { detailed: true })
            .then(({ total, events }) => events[0])
        });

        it.only('timings are provided in detailed', () => {
          (event.timings instanceof Array).should.equal(true);
        });

      });

      describe('with formSchema', () => {
        let event;

        before(async () => {
          event = await service('bdx')
            .search({ uid }, {}, { formSchema })
            .then(({ total, events }) => events[0])
        });

        it('additional fields are included in result', () => {
          event['thematiques-bordeaux-metropole'].should.eql([9]);
        });
      });

    });

    describe('additional fields search', () => {

      it('search by additional optioned field', async () => {
        const {
          total,
          events
        } = await service('bdx').search({
          'thematiques-bordeaux-metropole' : 9
        }, {}, { formSchema });

        total.should.equal(112);

        for (const event of events) {
          event['thematiques-bordeaux-metropole']
            .filter(id => id === 9)
            .length.should.equal(1);
        }
      });

    });


  });

} );
