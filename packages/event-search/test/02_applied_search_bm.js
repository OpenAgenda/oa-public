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

    before(async () => {
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
    });

    describe('Data structure', () => {
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
            .then(({ total, events }) => events[0]);
        });

        it('timings are provided in detailed', () => {
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

        it('event with requested uid is retrieved', () => {
          event.uid.should.equal(uid);
        });

        it('additional fields are included in result', () => {
          event['thematiques-bordeaux-metropole'].should.eql([9]);
        });
      });

    });

    describe('Additional fields search', () => {

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

    describe('CRUD operations', () => {

      const data = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bordeaux-metropole.event.json`))
      let addResult;

      before(async () => {
        addResult = await service('bdx').add(data, {
          formSchema,
          refresh: true // index must be refreshed directly for test
        });
      });

      it('adding a document went well', async () => {
        addResult.success.should.equal(true);
      });

      it('added document can be retrieved through its uid', async () => {
        const {
          events
        } = await service('bdx').search({
          uid: data.uid
        }, { formSchema });

        events[0].uid.should.equal(data.uid);
      });

      it('updating a document standard field', async () => {
        const result = await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          state: 1
        }, {
          refresh: true,
          formSchema
        });

        result.success.should.equal(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null
        }, {}, { detailed: true });

        events.length.should.equal(1);
        events[0].state.should.equal(1);
      });

      it('updating a document additional field', async () => {
        const result = await service('bdx').update({ uid: data.uid }, {
          ...data, // this is not a patch, all data must be provided
          'thematiques-bordeaux-metropole': [3, 7, 8]
        }, {
          refresh: true,
          formSchema
        });

        const event = await service('bdx').search({
          uid: data.uid,
          state: null
        }, {}, {
          detailed: true,
          first: true,
          formSchema
        });

        event['thematiques-bordeaux-metropole'].should.eql([3, 7, 8]);
      });

      it('removing a document', async () => {
        const result = await service('bdx').remove({ uid: data.uid }, {
          refresh: true
        });

        result.success.should.equal(true);

        const { events } = await service('bdx').search({
          uid: data.uid,
          state: null
        });

        events.length.should.equal(0);
      });

    });

    describe('Aggregations', () => {

      describe('timings', () => {
        let timingsAggregation;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: [{
              type: 'timings'
            }]
          });

          timingsAggregation = result.aggregations.timings;
        });

        it('there are as many items in timings aggregation as there are dates in lifespan of result', () => {
          timingsAggregation.length.should.equal(757);
        });

        it('each item is a { key, count } pair, the key being a date (YYYY-MM-DD)', () => {
          _.first(timingsAggregation).should.eql({
            key: '2018-12-15',
            count: 1
          });
          _.last(timingsAggregation).should.eql({
            key: '2021-01-09',
            count: 1
          });
        });

      });

      describe('origin agendas', () => {
        let originAgendaAggregation;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: ['originAgendas']
          });

          originAgendaAggregation = result.aggregations.originAgendas;
        });

        it('each aggregation key is the uid of the agenda', () => {
          originAgendaAggregation[0].key.should.equal('94573624');
        });

        it('each aggregation provides basic info on agenda', () => {
          originAgendaAggregation[0].should.eql({
            key: '94573624',
            count: 80,
            agenda: {
              uid: '94573624',
              title: 'Rocher de Palmer',
              image: 'agenda94573624.jpg'
            }
          });
        });

      });

      describe('timespan', () => {
        let timespanAggregation;

        before(async () => {
          const result = await service('bdx').search({}, { size: 0 }, {
            detailed: true,
            aggregations: [{ type: 'timespan' }]
          });

          timespanAggregation = result.aggregations.timespan;
        });

        it('provides first and last Date bracket matching search', () => {
          timespanAggregation.first.should.eql(
            new Date('2018-12-15T16:00:00.000Z')
          );

          timespanAggregation.last.should.eql(
            new Date('2021-01-09T13:00:00.000Z')
          );
        });
      });

      describe('timingsReverseHits', () => {
        let TRHAggregation;

        before(async () => {
          const result = await service('bdx').search({
            date: {
              gte: new Date('2019-11-01'),
              lte: new Date('2019-11-30')
            },
          }, { size: 0 }, {
            detailed: true,
            aggregations: [{
              type: 'timingsReverseHits'
            }]
          });

          TRHAggregation = result.aggregations.timingsReverseHits;
        });

        it('item of aggregation contains keys {key, count, sampleEvents}', () => {
          Object.keys(TRHAggregation[0]).should.eql(['key', 'count', 'sampleEvents']);
        });

        it('item.key is of format YYYY-MM-DD', () => {
          TRHAggregation[0].key.should.equal('2019-11-01');
        });

        it('item.sampleEvents contains 3 events corresponding to provided key', () => {
          TRHAggregation[0].sampleEvents.map(e => e.uid).should.eql([75721304, 16560750]);
        });

      });

    });

  });

} );
